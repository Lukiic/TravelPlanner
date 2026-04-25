using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.DTOs;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("travel-plans")]
    [Authorize]
    public class TravelPlansController : ControllerBase
    {
        private readonly TravelPlanService _service;

        public TravelPlansController(TravelPlanService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _service.GetAllForUserAsync(User.GetUserId()));

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
            => Ok(await _service.GetByIdAsync(id, User.GetUserId()));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTravelPlanDto dto)
        {
            var result = await _service.CreateAsync(dto, User.GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTravelPlanDto dto)
            => Ok(await _service.UpdateAsync(id, User.GetUserId(), dto));

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id, User.GetUserId());
            return NoContent();
        }

        // Admin methods
        [HttpGet("/admin/travel-plans")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAdmin()
            => Ok(await _service.GetAllAdminAsync());

        [HttpDelete("/admin/travel-plans/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            await _service.DeleteAdminAsync(id);
            return NoContent();
        }
    }
}
