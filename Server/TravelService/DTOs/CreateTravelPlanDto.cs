using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateTravelPlanDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required] public DateTime StartDate { get; set; }
        [Required] public DateTime EndDate { get; set; }
        [Range(0, double.MaxValue)] public decimal Budget { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
