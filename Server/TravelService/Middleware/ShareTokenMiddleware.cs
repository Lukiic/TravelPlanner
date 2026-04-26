using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using TravelService.Data;
using TravelService.Services;

namespace TravelService.Middleware
{
    public class ShareTokenMiddleware
    {
        private readonly RequestDelegate _next;

        public ShareTokenMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, SharingProxyService sharingProxy, TravelDbContext db)
        {
            var shareToken = context.Request.Headers["X-Share-Token"].FirstOrDefault(); // Read share token from request header if exists

            if (!string.IsNullOrWhiteSpace(shareToken))
            {
                try
                {
                    var tokenData = await sharingProxy.ValidateTokenAsync(shareToken);
                    bool isEditToken = tokenData.AccessType == "EDIT";

                    // VIEW tokens may only make GET requests
                    bool isMutating = context.Request.Method != HttpMethods.Get;
                    if (isMutating && !isEditToken)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new { error = "This share link is read-only." });
                        return;
                    }

                    // Find the plan owner to impersonate them for the request
                    var plan = await db.TravelPlans.FindAsync(tokenData.TravelPlanId);
                    if (plan != null)
                    {
                        var claims = new[]
                        {
                            new Claim(JwtRegisteredClaimNames.Sub, plan.UserId.ToString()),
                            new Claim("share_plan_id", tokenData.TravelPlanId.ToString()),
                            new Claim("share_access_type", tokenData.AccessType),
                        };

                        var identity = new ClaimsIdentity(claims, "ShareToken");
                        context.User = new ClaimsPrincipal(identity);
                    }
                }
                catch
                {
                    // Token invalid or expired — request proceeds without a user
                }
            }

            await _next(context);
        }
    }
}
