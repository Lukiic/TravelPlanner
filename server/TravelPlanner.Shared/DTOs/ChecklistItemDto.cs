namespace TravelPlanner.Shared.DTOs
{
    public class ChecklistItemDto
    {
        public Guid Id { get; set; }
        public Guid TravelPlanId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}
