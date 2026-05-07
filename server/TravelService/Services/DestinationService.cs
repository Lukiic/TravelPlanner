using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Models;

namespace TravelService.Services
{
    public class DestinationService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public DestinationService(TravelDbContext db, IMapper mapper, IHttpContextAccessor http)
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

        public async Task<List<DestinationDto>> GetAllForPlanAsync(Guid planId, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            var destinations = await _db.Destinations.Where(d => d.TravelPlanId == planId).ToListAsync();

            return _mapper.Map<List<DestinationDto>>(destinations);
        }

        public async Task<DestinationDto> GetByIdAsync(Guid id, Guid userId)
        {
            var dest = await _db.Destinations.Include(d => d.TravelPlan).FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new KeyNotFoundException("Destination not found.");

            await VerifyPlanOwnershipAsync(dest.TravelPlanId, userId);

            return _mapper.Map<DestinationDto>(dest);
        }

        public async Task<DestinationDto> CreateAsync(Guid planId, CreateDestinationDto dto, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            if (dto.DepartureDate < dto.ArrivalDate)
                throw new InvalidOperationException("DepartureDate cannot be before ArrivalDate.");

            var dest = new Destination
            {
                Id = Guid.NewGuid(),
                TravelPlanId = planId,
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Description = dto.Description
            };

            _db.Destinations.Add(dest);
            await _db.SaveChangesAsync();

            return _mapper.Map<DestinationDto>(dest);
        }

        public async Task<DestinationDto> UpdateAsync(Guid id, UpdateDestinationDto dto, Guid userId)
        {
            var dest = await _db.Destinations.Include(d => d.TravelPlan).FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new KeyNotFoundException("Destination not found.");

            await VerifyPlanOwnershipAsync(dest.TravelPlanId, userId);

            if (dto.Name != null) dest.Name = dto.Name;
            if (dto.Location != null) dest.Location = dto.Location;
            if (dto.ArrivalDate.HasValue) dest.ArrivalDate = dto.ArrivalDate.Value;
            if (dto.DepartureDate.HasValue) dest.DepartureDate = dto.DepartureDate.Value;
            if (dto.Description != null) dest.Description = dto.Description;

            if (dest.DepartureDate < dest.ArrivalDate)
                throw new InvalidOperationException("DepartureDate cannot be before ArrivalDate.");

            await _db.SaveChangesAsync();

            return _mapper.Map<DestinationDto>(dest);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var dest = await _db.Destinations.Include(d => d.TravelPlan).FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new KeyNotFoundException("Destination not found.");

            await VerifyPlanOwnershipAsync(dest.TravelPlanId, userId);

            _db.Destinations.Remove(dest);
            await _db.SaveChangesAsync();
        }
    }
}
