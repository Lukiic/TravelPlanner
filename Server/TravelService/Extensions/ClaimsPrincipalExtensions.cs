using System.Security.Claims;

namespace TravelService.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var sub = user.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? user.FindFirstValue("sub")
                   ?? throw new UnauthorizedAccessException("User ID claim not found.");

            return Guid.Parse(sub);
        }
    }
}
