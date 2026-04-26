using TravelPlanner.Shared.DTOs;

namespace TravelService.DTOs
{
    public class SharedPlanResponseDto
    {
        public string AccessType { get; set; } = string.Empty;
        public SharedPlanDto Plan { get; set; } = null!;
        public List<DestinationDto> Destinations { get; set; } = new();
        public List<ActivityDto> Activities { get; set; } = new();
        public List<ExpenseDto> Expenses { get; set; } = new();
        public List<ChecklistItemDto> Checklist { get; set; } = new();
    }
}
