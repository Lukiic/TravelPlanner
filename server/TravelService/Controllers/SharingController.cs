using AutoMapper;
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
        private readonly SharedAccessService _sharedAccess;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public SharingController(
            SharingProxyService sharingService,
            QrCodeService qrCodeService,
            SharedAccessService sharedAccess,
            IConfiguration configuration,
            IMapper mapper)
        {
            _sharingService = sharingService;
            _qrCodeService = qrCodeService;
            _sharedAccess = sharedAccess;
            _configuration = configuration;
            _mapper = mapper;
        }

        [HttpPost("travel-plans/{planId:guid}/share")]
        [Authorize]
        public async Task<IActionResult> CreateShareToken(Guid planId, [FromBody] CreateShareTokenRequestDto dto)
        {
            if (User.IsShareTokenIdentity())
                return Forbid();

            var userId = User.GetUserId();
            var plan = await _sharedAccess.GetPlanIfOwnerAsync(planId, userId);
            if (plan == null)
                return NotFound("Travel plan not found.");

            var accessType = dto.AccessType.ToUpper();
            if (accessType != "VIEW" && accessType != "EDIT")
                return BadRequest("AccessType must be VIEW or EDIT.");

            var token = await _sharingService.CreateTokenAsync(planId, accessType);

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

        [HttpGet("travel-plans/{planId:guid}/share-tokens")]
        [Authorize]
        public async Task<IActionResult> GetTokensForPlan(Guid planId)
        {
            if (User.IsShareTokenIdentity())
                return Forbid();

            var userId = User.GetUserId();
            var plan = await _sharedAccess.GetPlanIfOwnerAsync(planId, userId);
            if (plan == null)
                return NotFound();

            var tokens = await _sharingService.GetTokensForPlanAsync(planId);
            return Ok(tokens);
        }

        [HttpDelete("share-tokens/{token}")]
        [Authorize]
        public async Task<IActionResult> RevokeToken(string token)
        {
            var userId = User.GetUserId();

            SharingTokenDto tokenDto;
            try { tokenDto = await _sharingService.ValidateTokenAsync(token); }
            catch (KeyNotFoundException) { return NotFound("Token not found."); }
            catch (InvalidOperationException) { return NotFound("Token not found or has already expired."); }

            // Checking if user owns that plan
            var plan = await _sharedAccess.GetPlanIfOwnerAsync(tokenDto.TravelPlanId, userId);
            if (plan == null)
                return NotFound("Travel plan not found.");

            await _sharingService.RevokeTokenAsync(token);
            return NoContent();
        }

        [HttpGet("shared/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSharedPlan(string token)
        {
            SharingTokenDto tokenDto;
            try { tokenDto = await _sharingService.ValidateTokenAsync(token); }
            catch (KeyNotFoundException) { return NotFound("Token not found."); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }

            var response = await _sharedAccess.GetSharedPlanDataAsync(tokenDto.TravelPlanId, tokenDto.AccessType, _mapper);
            return Ok(response);
        }
    }
}
