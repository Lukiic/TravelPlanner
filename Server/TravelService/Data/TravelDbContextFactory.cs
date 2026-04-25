using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TravelService.Data
{
    public class TravelDbContextFactory : IDesignTimeDbContextFactory<TravelDbContext>
    {
        public TravelDbContext CreateDbContext(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");

            var optionsBuilder = new DbContextOptionsBuilder<TravelDbContext>();
            optionsBuilder.UseSqlServer(connectionString);

            return new TravelDbContext(optionsBuilder.Options);
        }
    }
}
