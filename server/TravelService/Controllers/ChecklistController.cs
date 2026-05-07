using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("travel-plans/{planId:guid}/checklist")]
    [Authorize]
    public class ChecklistController : ControllerBase
    {
        private readonly ChecklistService _service;

        public ChecklistController(ChecklistService service) => _service = service;

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid planId, Guid id)
            => Ok(await _service.GetByIdAsync(id, User.GetUserId()));

        [HttpGet]
        public async Task<IActionResult> GetAll(Guid planId)
            => Ok(await _service.GetAllForPlanAsync(planId, User.GetUserId()));

        [HttpPost]
        public async Task<IActionResult> Create(Guid planId, [FromBody] CreateChecklistItemDto dto)
        {
            var result = await _service.CreateAsync(planId, dto, User.GetUserId());
            return CreatedAtAction(nameof(GetById), new { planId, id = result.Id }, result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid planId, Guid id, [FromBody] UpdateChecklistItemDto dto)
            => Ok(await _service.UpdateAsync(id, dto, User.GetUserId()));

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid planId, Guid id)
        {
            await _service.DeleteAsync(id, User.GetUserId());
            return NoContent();
        }
    }
}
