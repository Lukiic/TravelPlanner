namespace TravelService.Models
{
    public class Destination
    {
        public Guid Id { get; set; }
        public Guid TravelPlanId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string Description { get; set; } = string.Empty;

        public TravelPlan TravelPlan { get; set; } = null!;
    }
}
