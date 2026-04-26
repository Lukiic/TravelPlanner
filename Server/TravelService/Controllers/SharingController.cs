using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    public class SharingController : ControllerBase
    {
        private readonly SharingProxyService _sharingService;
        private readonly QrCodeService _qrCodeService;
        private readonly TravelDbContext _db;
        private readonly IConfiguration _configuration;

        public SharingController(SharingProxyService sharingService, QrCodeService qrCodeService, TravelDbContext db, IConfiguration configuration)
        {
            _sharingService = sharingService;
            _qrCodeService = qrCodeService;
            _db = db;
            _configuration = configuration;
        }

        // Create a share token and QR code for a plan
        [HttpPost("travel-plans/{planId:guid}/share")]
        [Authorize]
        public async Task<IActionResult> CreateShareToken(Guid planId, [FromBody] CreateShareTokenRequestDto dto)
        {
            var userId = User.GetUserId();

            var plan = await _db.TravelPlans.FindAsync(planId);

            if (plan == null)
                return NotFound("Travel plan not found.");

            if (plan.UserId != userId)
                return Forbid();

            var accessType = dto.AccessType.ToUpper();
            if (accessType != "VIEW" && accessType != "EDIT")
                return BadRequest("AccessType must be VIEW or EDIT.");

            var token = await _sharingService.CreateTokenAsync(planId, accessType);

            // Build the shareable URL (frontend route)
            var baseUrl = _configuration["AppSettings:FrontendBaseUrl"] ?? "http://localhost:5173";
            var shareUrl = $"{baseUrl.TrimEnd('/')}/shared/{token}";

            var qrBytes = _qrCodeService.GenerateQrCode(shareUrl);
            var qrBase64 = Convert.ToBase64String(qrBytes);

            return Ok(new ShareTokenResponseDto
            {
                Token = token,
                QrCode = qrBase64,
                AccessType = accessType
            });
        }

        // List all active tokens for a plan
        [HttpGet("travel-plans/{planId:guid}/share-tokens")]
        [Authorize]
        public async Task<IActionResult> GetTokensForPlan(Guid planId)
        {
            var userId = User.GetUserId();

            var plan = await _db.TravelPlans.FindAsync(planId);
            if (plan == null)
                return NotFound();

            if (plan.UserId != userId)
                return Forbid();

            var tokens = await _sharingService.GetTokensForPlanAsync(planId);
            return Ok(tokens);
        }

        // Delete a specific token
        [HttpDelete("share-tokens/{token}")]
        [Authorize]
        public async Task<IActionResult> RevokeToken(string token)
        {
            await _sharingService.RevokeTokenAsync(token);
            return NoContent();
        }

        // Public endpoint for viewing shared plan (no auth required)
        [HttpGet("shared/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSharedPlan(string token)
        {
            SharingTokenDto tokenDto;
            try
            {
                tokenDto = await _sharingService.ValidateTokenAsync(token);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Token not found.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }

            var plan = await _db.TravelPlans
                .Include(tp => tp.Destinations)
                .Include(tp => tp.Activities)
                .Include(tp => tp.Expenses)
                .Include(tp => tp.ChecklistItems)
                .FirstOrDefaultAsync(tp => tp.Id == tokenDto.TravelPlanId);

            if (plan == null)
                return NotFound("Travel plan no longer exists.");

            return Ok(new
            {
                accessType = tokenDto.AccessType,
                plan = new
                {
                    plan.Id,
                    plan.Name,
                    plan.Description,
                    plan.StartDate,
                    plan.EndDate,
                    plan.Budget,
                    plan.Notes,
                },
                destinations = plan.Destinations,
                activities = plan.Activities,
                expenses = plan.Expenses,
                checklist = plan.ChecklistItems
            });
        }

        // Update an activity using shared link
        [HttpPut("shared/{token}/activities/{activityId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateActivityViaToken(string token, Guid activityId, [FromBody] UpdateActivityDto dto)
        {
            SharingTokenDto tokenDto;
            try
            {
                tokenDto = await _sharingService.ValidateTokenAsync(token);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            if (tokenDto.AccessType != "EDIT")      // VIEW tokens don't have permission for modifying data
                return Forbid();

            var activity = await _db.Activities
                .Include(a => a.TravelPlan)
                .FirstOrDefaultAsync(a => a.Id == activityId);

            if (activity == null)
                return NotFound();

            if (activity.TravelPlanId != tokenDto.TravelPlanId)
                return Forbid();

            if (dto.Name != null) activity.Name = dto.Name;
            if (dto.Date.HasValue) activity.Date = dto.Date.Value;
            if (dto.Time != null) activity.Time = dto.Time;
            if (dto.Location != null) activity.Location = dto.Location;
            if (dto.Description != null) activity.Description = dto.Description;
            if (dto.EstimatedCost.HasValue) activity.EstimatedCost = dto.EstimatedCost.Value;
            if (dto.Status != null) activity.Status = dto.Status;

            await _db.SaveChangesAsync();
            return Ok(activity);
        }
    }
}
