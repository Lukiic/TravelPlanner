using AutoMapper;
using TravelPlanner.Shared.DTOs;
using TravelService.Models;

namespace TravelService.Mappings
{
    public class TravelMappingProfile : Profile
    {
        public TravelMappingProfile()
        {
            CreateMap<TravelPlan, TravelPlanDto>();
            CreateMap<Destination, DestinationDto>();
            CreateMap<Activity, ActivityDto>();
            CreateMap<Expense, ExpenseDto>();
            CreateMap<ChecklistItem, ChecklistItemDto>();
        }
    }
}
