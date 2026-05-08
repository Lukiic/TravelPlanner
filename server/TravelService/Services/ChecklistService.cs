using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Models;

namespace TravelService.Services
{
    public class ChecklistService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public ChecklistService(TravelDbContext db, IMapper mapper, IHttpContextAccessor http)
        {
            _db = db;
            _mapper = mapper;
            _http = http;
        }

        private async Task VerifyPlanOwnershipAsync(Guid planId, Guid userId, bool requiresEditAccess = false)
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

                if (requiresEditAccess)
                {
                    var accessType = _http.HttpContext?.User.GetShareTokenAccessType();
                    if (accessType != "EDIT")
                        throw new UnauthorizedAccessException("This share token is read-only.");
                }

                return;
            }

            if (plan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");
        }

        public async Task<ChecklistItemDto> GetByIdAsync(Guid id, Guid userId)
        {
            var item = await _db.ChecklistItems
                .Include(c => c.TravelPlan)
                .FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new KeyNotFoundException("Checklist item not found.");

            await VerifyPlanOwnershipAsync(item.TravelPlanId, userId);
            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<List<ChecklistItemDto>> GetAllForPlanAsync(Guid planId, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            var items = await _db.ChecklistItems
                .Where(c => c.TravelPlanId == planId)
                .ToListAsync();

            return _mapper.Map<List<ChecklistItemDto>>(items);
        }

        public async Task<ChecklistItemDto> CreateAsync(Guid planId, CreateChecklistItemDto dto, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId, requiresEditAccess: true);

            var item = new ChecklistItem
            {
                Id = Guid.NewGuid(),
                TravelPlanId = planId,
                Name = dto.Name,
                IsCompleted = false
            };

            _db.ChecklistItems.Add(item);
            await _db.SaveChangesAsync();

            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task<ChecklistItemDto> UpdateAsync(Guid id, UpdateChecklistItemDto dto, Guid userId)
        {
            var item = await _db.ChecklistItems
                .Include(c => c.TravelPlan)
                .FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new KeyNotFoundException("Checklist item not found.");

            await VerifyPlanOwnershipAsync(item.TravelPlanId, userId, requiresEditAccess: true);

            if (dto.Name != null)
                item.Name = dto.Name;

            if (dto.IsCompleted.HasValue)
                item.IsCompleted = dto.IsCompleted.Value;

            await _db.SaveChangesAsync();
            return _mapper.Map<ChecklistItemDto>(item);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var item = await _db.ChecklistItems
                .Include(c => c.TravelPlan)
                .FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new KeyNotFoundException("Checklist item not found.");

            await VerifyPlanOwnershipAsync(item.TravelPlanId, userId, requiresEditAccess: true);

            _db.ChecklistItems.Remove(item);
            await _db.SaveChangesAsync();
        }
    }
}
