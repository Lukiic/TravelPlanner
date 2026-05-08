using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class SharedAccessService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;

        public SharedAccessService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<TravelPlan?> GetPlanIfOwnerAsync(Guid planId, Guid userId)
        {
            var plan = await _db.TravelPlans.FindAsync(planId);

            if (plan == null)
                return null;

            if (plan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");

            return plan;
        }

        public async Task<SharedPlanResponseDto> GetSharedPlanDataAsync(Guid planId, string accessType, IMapper mapper)
        {
            var plan = await _db.TravelPlans
                .Include(tp => tp.Destinations)
                .Include(tp => tp.Activities)
                .Include(tp => tp.Expenses)
                .Include(tp => tp.ChecklistItems)
                .FirstOrDefaultAsync(tp => tp.Id == planId)
                ?? throw new KeyNotFoundException("Travel plan no longer exists.");

            return new SharedPlanResponseDto
            {
                AccessType = accessType,
                Plan = new SharedPlanDto
                {
                    Id = plan.Id,
                    Name = plan.Name,
                    Description = plan.Description,
                    StartDate = plan.StartDate,
                    EndDate = plan.EndDate,
                    Budget = plan.Budget,
                    Notes = plan.Notes,
                    CreatedAt = plan.CreatedAt,
                },
                Destinations = mapper.Map<List<DestinationDto>>(plan.Destinations),
                Activities = mapper.Map<List<ActivityDto>>(plan.Activities),
                Expenses = mapper.Map<List<ExpenseDto>>(plan.Expenses),
                Checklist = mapper.Map<List<ChecklistItemDto>>(plan.ChecklistItems),
            };
        }
    }
}
