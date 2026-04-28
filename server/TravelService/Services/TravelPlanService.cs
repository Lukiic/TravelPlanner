using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Models;

namespace TravelService.Services
{
    public class TravelPlanService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public TravelPlanService(TravelDbContext db, IMapper mapper, IHttpContextAccessor http)
        {
            _db = db;
            _mapper = mapper;
            _http = http;
        }

        private void VerifyPlanOwnershipAsync(TravelPlan plan, Guid userId)
        {
            // Admin users bypass ownership checks
            if (_http.HttpContext?.User.IsInRole("Admin") == true)
                return;

            // Share token users bypass ownership checks
            var sharePlanId = _http.HttpContext?.User.GetShareTokenPlanId();
            if (sharePlanId.HasValue)
            {
                if (sharePlanId.Value != plan.Id)
                    throw new UnauthorizedAccessException("Share token is not valid for this plan.");
                return;
            }

            if (plan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");
        }

        public async Task<List<TravelPlanDto>> GetAllForUserAsync(Guid userId)
        {
            var plans = await _db.TravelPlans.Where(tp => tp.UserId == userId).ToListAsync();
            return _mapper.Map<List<TravelPlanDto>>(plans);
        }

        public async Task<TravelPlanDto> GetByIdAsync(Guid id, Guid userId)
        {
            var plan = await _db.TravelPlans.FindAsync(id)
                ?? throw new KeyNotFoundException("Travel plan not found.");

            VerifyPlanOwnershipAsync(plan, userId);

            return _mapper.Map<TravelPlanDto>(plan);
        }

        public async Task<TravelPlanDto> CreateAsync(CreateTravelPlanDto dto, Guid userId)
        {
            if (dto.EndDate < dto.StartDate)
                throw new InvalidOperationException("EndDate cannot be before StartDate.");

            if (dto.Budget < 0)
                throw new InvalidOperationException("Budget cannot be negative.");

            var plan = new TravelPlan
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Budget = dto.Budget,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _db.TravelPlans.Add(plan);
            await _db.SaveChangesAsync();

            return _mapper.Map<TravelPlanDto>(plan);
        }

        public async Task<TravelPlanDto> UpdateAsync(Guid id, Guid userId, UpdateTravelPlanDto dto)
        {
            var plan = await _db.TravelPlans.FindAsync(id)
                ?? throw new KeyNotFoundException("Travel plan not found.");

            VerifyPlanOwnershipAsync(plan, userId);

            if (dto.Name != null) plan.Name = dto.Name;
            if (dto.Description != null) plan.Description = dto.Description;
            if (dto.StartDate.HasValue) plan.StartDate = dto.StartDate.Value;
            if (dto.EndDate.HasValue) plan.EndDate = dto.EndDate.Value;
            if (dto.Budget.HasValue) plan.Budget = dto.Budget.Value;
            if (dto.Notes != null) plan.Notes = dto.Notes;

            if (plan.EndDate < plan.StartDate)
                throw new InvalidOperationException("EndDate cannot be before StartDate.");

            await _db.SaveChangesAsync();

            return _mapper.Map<TravelPlanDto>(plan);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var plan = await _db.TravelPlans.FindAsync(id)
                ?? throw new KeyNotFoundException("Travel plan not found.");

            VerifyPlanOwnershipAsync(plan, userId);

            _db.TravelPlans.Remove(plan);
            await _db.SaveChangesAsync();
        }

        // Admin methods
        public async Task<List<TravelPlanDto>> GetAllAdminAsync()
        {
            var plans = await _db.TravelPlans.ToListAsync();
            return _mapper.Map<List<TravelPlanDto>>(plans);
        }

        public async Task DeleteAdminAsync(Guid id)
        {
            var plan = await _db.TravelPlans.FindAsync(id)
                ?? throw new KeyNotFoundException("Travel plan not found.");

            _db.TravelPlans.Remove(plan);
            await _db.SaveChangesAsync();
        }
    }
}
