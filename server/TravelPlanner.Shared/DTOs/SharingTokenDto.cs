namespace TravelPlanner.Shared.DTOs
{
    public class SharingTokenDto
    {
        public string Token { get; set; } = string.Empty;
        public Guid TravelPlanId { get; set; }
        public string AccessType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}
