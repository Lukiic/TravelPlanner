namespace TravelService.Models
{
    public class ChecklistItem
    {
        public Guid Id { get; set; }
        public Guid TravelPlanId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;

        public TravelPlan TravelPlan { get; set; } = null!;
    }
}
