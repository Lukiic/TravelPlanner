using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Models;
using static System.Net.WebRequestMethods;

namespace TravelService.Services
{
    public class ActivityService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        private static readonly string[] ValidStatuses = { "Planned", "Reserved", "Completed", "Cancelled" };

        public ActivityService(TravelDbContext db, IMapper mapper, IHttpContextAccessor http)
        {
            _db = db;
            _mapper = mapper;
            _http = http;
        }

        private async Task VerifyPlanOwnershipAsync(Guid planId, Guid userId)
        {
            var plan = await _db.TravelPlans.FindAsync(planId)
                ?? throw new KeyNotFoundException("Travel plan not found.");

            // Admin users bypass ownership checks
            if (_http.HttpContext?.User.IsInRole("Admin") == true)
                return;

            // Share token users bypass ownership checks
            var sharePlanId = _http.HttpContext?.User.GetShareTokenPlanId();
            if (sharePlanId.HasValue)
            {
                if (sharePlanId.Value != planId)
                    throw new UnauthorizedAccessException("Share token is not valid for this plan.");
                return;
            }

            if (plan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");
        }

        public async Task<List<ActivityDto>> GetAllForPlanAsync(Guid planId, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            var activities = await _db.Activities
                .Where(a => a.TravelPlanId == planId)
                .OrderBy(a => a.Date)
                .ToListAsync();

            return _mapper.Map<List<ActivityDto>>(activities);
        }

        public async Task<List<ActivityDto>> GetByDateAsync(Guid planId, DateTime date, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            var activities = await _db.Activities
                .Where(a => a.TravelPlanId == planId && a.Date.Date == date.Date)
                .OrderBy(a => a.Date)
                .ToListAsync();

            return _mapper.Map<List<ActivityDto>>(activities);
        }

        public async Task<ActivityDto> GetByIdAsync(Guid id, Guid userId)
        {
            var activity = await _db.Activities.Include(a => a.TravelPlan).FirstOrDefaultAsync(a => a.Id == id)
                ?? throw new KeyNotFoundException("Activity not found.");

            if (activity.TravelPlan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");

            return _mapper.Map<ActivityDto>(activity);
        }

        public async Task<ActivityDto> CreateAsync(Guid planId, CreateActivityDto dto, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            if (!ValidStatuses.Contains(dto.Status))
                throw new InvalidOperationException($"Status must be one of: {string.Join(", ", ValidStatuses)}");

            var activity = new Activity
            {
                Id = Guid.NewGuid(),
                TravelPlanId = planId,
                Name = dto.Name,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Description = dto.Description,
                EstimatedCost = dto.EstimatedCost,
                Status = dto.Status
            };

            _db.Activities.Add(activity);
            await _db.SaveChangesAsync();

            return _mapper.Map<ActivityDto>(activity);
        }

        public async Task<ActivityDto> UpdateAsync(Guid id, UpdateActivityDto dto, Guid userId)
        {
            var activity = await _db.Activities.Include(a => a.TravelPlan).FirstOrDefaultAsync(a => a.Id == id)
                ?? throw new KeyNotFoundException("Activity not found.");

            if (activity.TravelPlan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");

            if (dto.Name != null) activity.Name = dto.Name;
            if (dto.Date.HasValue) activity.Date = dto.Date.Value;
            if (dto.Time != null) activity.Time = dto.Time;
            if (dto.Location != null) activity.Location = dto.Location;
            if (dto.Description != null) activity.Description = dto.Description;
            if (dto.EstimatedCost.HasValue) activity.EstimatedCost = dto.EstimatedCost.Value;
            if (dto.Status != null)
            {
                if (!ValidStatuses.Contains(dto.Status))
                    throw new InvalidOperationException($"Status must be one of: {string.Join(", ", ValidStatuses)}");
                activity.Status = dto.Status;
            }

            await _db.SaveChangesAsync();
            return _mapper.Map<ActivityDto>(activity);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var activity = await _db.Activities.Include(a => a.TravelPlan).FirstOrDefaultAsync(a => a.Id == id)
                ?? throw new KeyNotFoundException("Activity not found.");

            if (activity.TravelPlan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");

            _db.Activities.Remove(activity);
            await _db.SaveChangesAsync();
        }
    }
}
