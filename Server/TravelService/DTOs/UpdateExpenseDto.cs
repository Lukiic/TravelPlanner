namespace TravelService.DTOs
{
    public class UpdateExpenseDto
    {
        public string? Name { get; set; }
        public string? Category { get; set; }
        public decimal? Amount { get; set; }
        public DateTime? Date { get; set; }
        public string? Description { get; set; }
    }
}
