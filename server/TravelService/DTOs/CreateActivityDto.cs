using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateActivityDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Required] public DateTime Date { get; set; }
        public string Time { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Range(0, double.MaxValue)] public decimal EstimatedCost { get; set; }
        public string Status { get; set; } = "Planned";
    }
}
