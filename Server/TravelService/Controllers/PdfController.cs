using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.Extensions;
using TravelService.Services;
using static System.Net.WebRequestMethods;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("travel-plans")]
    [Authorize]
    public class PdfController : ControllerBase
    {
        private readonly TravelDbContext _db;
        private readonly PdfService _pdfService;

        public PdfController(TravelDbContext db, PdfService pdfService)
        {
            _db = db;
            _pdfService = pdfService;
        }

        [HttpGet("{planId:guid}/export-pdf")]
        public async Task<IActionResult> ExportPdf(Guid planId)
        {
            var userId = User.GetUserId();

            var plan = await _db.TravelPlans
                .Include(tp => tp.Destinations)
                .Include(tp => tp.Activities)
                .Include(tp => tp.Expenses)
                .Include(tp => tp.ChecklistItems)
                .FirstOrDefaultAsync(tp => tp.Id == planId);

            if (plan == null)
                return NotFound();

            if (plan.UserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            var pdfBytes = _pdfService.GenerateTravelPlanPdf(plan);

            var safeFileName = string.Concat(plan.Name.Split(Path.GetInvalidFileNameChars()));
            return File(pdfBytes, "application/pdf", $"{safeFileName}.pdf");
        }
    }
}
