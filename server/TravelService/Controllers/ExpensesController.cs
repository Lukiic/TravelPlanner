using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Services;

namespace TravelService.Controllers
{
    [ApiController]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseService _service;

        public ExpensesController(ExpenseService service) => _service = service;

        [HttpGet("travel-plans/{planId:guid}/expenses")]
        public async Task<IActionResult> GetAll(Guid planId)
            => Ok(await _service.GetAllForPlanAsync(planId, User.GetUserId()));

        [HttpGet("travel-plans/{planId:guid}/expenses/{id:guid}")]
        public async Task<IActionResult> GetById(Guid planId, Guid id)
            => Ok(await _service.GetByIdAsync(id, User.GetUserId()));

        [HttpPost("travel-plans/{planId:guid}/expenses")]
        public async Task<IActionResult> Create(Guid planId, [FromBody] CreateExpenseDto dto)
        {
            var result = await _service.CreateAsync(planId, dto, User.GetUserId());
            return CreatedAtAction(nameof(GetById), new { planId, id = result.Id }, result);
        }

        [HttpPut("travel-plans/{planId:guid}/expenses/{id:guid}")]
        public async Task<IActionResult> Update(Guid planId, Guid id, [FromBody] UpdateExpenseDto dto)
            => Ok(await _service.UpdateAsync(id, dto, User.GetUserId()));

        [HttpDelete("travel-plans/{planId:guid}/expenses/{id:guid}")]
        public async Task<IActionResult> Delete(Guid planId, Guid id)
        {
            await _service.DeleteAsync(id, User.GetUserId());
            return NoContent();
        }

        [HttpGet("travel-plans/{planId:guid}/budget")]
        public async Task<IActionResult> GetBudget(Guid planId)
            => Ok(await _service.GetBudgetSummaryAsync(planId, User.GetUserId()));
    }
}
