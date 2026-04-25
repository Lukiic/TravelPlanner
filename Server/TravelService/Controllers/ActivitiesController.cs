using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("travel-plans/{planId:guid}/activities")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly ActivityService _service;

        public ActivitiesController(ActivityService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll(Guid planId, [FromQuery] string? date)
        {
            var userId = User.GetUserId();

            if (date != null && DateTime.TryParse(date, out var parsedDate))
                return Ok(await _service.GetByDateAsync(planId, parsedDate, userId));

            return Ok(await _service.GetAllForPlanAsync(planId, userId));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid planId, Guid id)
            => Ok(await _service.GetByIdAsync(id, User.GetUserId()));

        [HttpPost]
        public async Task<IActionResult> Create(Guid planId, [FromBody] CreateActivityDto dto)
        {
            var result = await _service.CreateAsync(planId, dto, User.GetUserId());
            return CreatedAtAction(nameof(GetById), new { planId, id = result.Id }, result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid planId, Guid id, [FromBody] UpdateActivityDto dto)
            => Ok(await _service.UpdateAsync(id, dto, User.GetUserId()));

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid planId, Guid id)
        {
            await _service.DeleteAsync(id, User.GetUserId());
            return NoContent();
        }
    }
}
