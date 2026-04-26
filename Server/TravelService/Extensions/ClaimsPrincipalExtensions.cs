using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TravelService.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var sub = user.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                   ?? user.FindFirstValue("sub")
                   ?? throw new UnauthorizedAccessException("User ID claim not found.");

            return Guid.Parse(sub);
        }

        public static bool IsShareTokenIdentity(this ClaimsPrincipal user)  // Request made with a share token identity (from middleware)
            => user.FindFirstValue("share_plan_id") != null;

        public static Guid? GetShareTokenPlanId(this ClaimsPrincipal user)  // Returns PlanId that user can view
        {
            var val = user.FindFirstValue("share_plan_id");
            return val != null ? Guid.Parse(val) : null;
        }
    }
}
