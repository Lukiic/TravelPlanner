using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateDestinationDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Required] public string Location { get; set; } = string.Empty;
        [Required] public DateTime ArrivalDate { get; set; }
        [Required] public DateTime DepartureDate { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
