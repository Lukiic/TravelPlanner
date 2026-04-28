using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateShareTokenRequestDto
    {
        [Required] public string AccessType { get; set; } = "VIEW"; // "VIEW" or "EDIT"
    }
}
