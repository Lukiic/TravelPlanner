namespace TravelService.DTOs
{
    public class UpdateTravelPlanDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Budget { get; set; }
        public string? Notes { get; set; }
    }
}
