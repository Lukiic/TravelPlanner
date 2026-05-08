using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.Extensions;
using TravelService.Models;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("travel-plans")]
    [Authorize]
    public class PdfController : ControllerBase
    {
        private readonly TravelPlanService _travelPlanService;
        private readonly PdfService _pdfService;

        public PdfController(TravelPlanService travelPlanService, PdfService pdfService)
        {
            _travelPlanService = travelPlanService;
            _pdfService = pdfService;
        }

        [HttpGet("{planId:guid}/export-pdf")]
        public async Task<IActionResult> ExportPdf(Guid planId)
        {
            TravelPlan plan;

            try
            {
                plan = await _travelPlanService.GetFullPlanForExportAsync(planId, User.GetUserId());
            }
            catch (KeyNotFoundException) { return NotFound(); }
            catch (UnauthorizedAccessException) { return Forbid(); }

            var pdfBytes = _pdfService.GenerateTravelPlanPdf(plan);

            var safeFileName = string.Concat(plan.Name.Split(Path.GetInvalidFileNameChars()));

            return File(pdfBytes, "application/pdf", $"{safeFileName}.pdf");
        }
    }
}
