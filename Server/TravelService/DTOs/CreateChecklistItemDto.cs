using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateChecklistItemDto
    {
        [Required] public string Name { get; set; } = string.Empty;
    }
}
