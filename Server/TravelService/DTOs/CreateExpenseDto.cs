using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class CreateExpenseDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Required] public string Category { get; set; } = string.Empty;
        [Required, Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        [Required] public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
