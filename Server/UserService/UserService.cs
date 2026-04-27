using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using System.Text;
using UserService.Data;
using UserService.Mappings;
using UserService.Middleware;
using UserService.Services;

namespace UserService
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    internal sealed class UserService : StatelessService
    {
        public UserService(StatelessServiceContext context) : base(context) { }

        /// <summary>
        /// Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "UserServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder();

                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);

                        // Configuration
                        builder.Configuration
                            .AddJsonFile("appsettings.json", optional: false)
                            .AddJsonFile("appsettings.Development.json", optional: true)
                            .AddEnvironmentVariables();

                        // Database
                        builder.Services.AddDbContext<UserDbContext>(options =>
                            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

                        // AutoMapper
                        builder.Services.AddAutoMapper(typeof(UserMappingProfile));

                        // Services
                        builder.Services.AddScoped<JwtService>();
                        builder.Services.AddScoped<AuthService>();
                        builder.Services.AddScoped<UserManagementService>();

                        // JWT Authentication
                        var jwtSecret = builder.Configuration["Jwt:Secret"]!;
                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                            .AddJwtBearer(options =>
                            {
                                options.TokenValidationParameters = new TokenValidationParameters
                                {
                                    ValidateIssuer = true,
                                    ValidateAudience = true,
                                    ValidateLifetime = true,
                                    ValidateIssuerSigningKey = true,
                                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                                    ValidAudience = builder.Configuration["Jwt:Audience"],
                                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
                                };
                            });

                        builder.Services.AddAuthorization();
                        builder.Services.AddControllers();
                        builder.Services.AddEndpointsApiExplorer();

                        // CORS
                        var frontendUrl = builder.Configuration["AppSettings:FrontendBaseUrl"];
                        if (string.IsNullOrEmpty(frontendUrl))
                        {
                            throw new Exception("FrontendBaseUrl is not configured.");
                        }

                        builder.Services.AddCors(options =>
                        {
                            options.AddPolicy("AllowFrontend", policy =>
                            {
                                policy
                                    .WithOrigins(frontendUrl)
                                    .AllowAnyHeader()
                                    .AllowAnyMethod();
                            });
                        });

                        builder.Services.AddSwaggerGen(options =>
                        {
                            options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                            {
                                Name = "Authorization",
                                Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                                Scheme = "bearer",
                                BearerFormat = "JWT",
                                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                                Description = "Enter 'Bearer {your token}'"
                            });

                            options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                            {
                                {
                                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                                    {
                                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                                        {
                                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                            Id = "Bearer"
                                        }
                                    },
                                    new string[] {}
                                }
                            });
                        });

                        builder.WebHost
                            .UseKestrel()
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(url);

                        var app = builder.Build();

                        // Run migrations on startup
                        using (var scope = app.Services.CreateScope())
                        {
                            var db = scope.ServiceProvider.GetRequiredService<UserDbContext>();
                            db.Database.Migrate();
                        }

                        app.UseMiddleware<ExceptionMiddleware>();

                        if (app.Environment.IsDevelopment())
                        {
                            app.UseSwagger();
                            app.UseSwaggerUI();
                        }

                        app.UseCors("AllowFrontend");

                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.MapControllers();

                        return app;

                    }))
            };
        }
    }
}
