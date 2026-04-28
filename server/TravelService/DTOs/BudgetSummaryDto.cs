namespace TravelService.DTOs
{
    public class BudgetSummaryDto
    {
        public decimal TotalBudget { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal RemainingBudget { get; set; }
        public Dictionary<string, decimal> SpentByCategory { get; set; } = new();
    }
}
