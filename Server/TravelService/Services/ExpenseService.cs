using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Extensions;
using TravelService.Models;
using static System.Net.WebRequestMethods;

namespace TravelService.Services
{
    public class ExpenseService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        private static readonly string[] ValidCategories =
            { "Transport", "Accommodation", "Food", "Tickets", "Shopping", "Other" };

        public ExpenseService(TravelDbContext db, IMapper mapper, IHttpContextAccessor http)
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

        public async Task<List<ExpenseDto>> GetAllForPlanAsync(Guid planId, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            var expenses = await _db.Expenses
                .Where(e => e.TravelPlanId == planId)
                .OrderBy(e => e.Date)
                .ToListAsync();

            return _mapper.Map<List<ExpenseDto>>(expenses);
        }

        public async Task<ExpenseDto> GetByIdAsync(Guid id, Guid userId)
        {
            var expense = await _db.Expenses
                .Include(e => e.TravelPlan)
                .FirstOrDefaultAsync(e => e.Id == id)
                ?? throw new KeyNotFoundException("Expense not found.");

            await VerifyPlanOwnershipAsync(expense.TravelPlanId, userId);

            return _mapper.Map<ExpenseDto>(expense);
        }

        public async Task<ExpenseDto> CreateAsync(Guid planId, CreateExpenseDto dto, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            if (!ValidCategories.Contains(dto.Category))
                throw new InvalidOperationException($"Category must be one of: {string.Join(", ", ValidCategories)}");

            var expense = new Expense
            {
                Id = Guid.NewGuid(),
                TravelPlanId = planId,
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description
            };

            _db.Expenses.Add(expense);
            await _db.SaveChangesAsync();

            return _mapper.Map<ExpenseDto>(expense);
        }

        public async Task<ExpenseDto> UpdateAsync(Guid id, UpdateExpenseDto dto, Guid userId)
        {
            var expense = await _db.Expenses
                .Include(e => e.TravelPlan)
                .FirstOrDefaultAsync(e => e.Id == id)
                ?? throw new KeyNotFoundException("Expense not found.");

            await VerifyPlanOwnershipAsync(expense.TravelPlanId, userId);

            if (dto.Name != null)
                expense.Name = dto.Name;

            if (dto.Category != null)
            {
                if (!ValidCategories.Contains(dto.Category))
                    throw new InvalidOperationException($"Category must be one of: {string.Join(", ", ValidCategories)}");
                expense.Category = dto.Category;
            }

            if (dto.Amount.HasValue)
                expense.Amount = dto.Amount.Value;

            if (dto.Date.HasValue)
                expense.Date = dto.Date.Value;

            if (dto.Description != null)
                expense.Description = dto.Description;

            await _db.SaveChangesAsync();

            return _mapper.Map<ExpenseDto>(expense);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var expense = await _db.Expenses
                .Include(e => e.TravelPlan)
                .FirstOrDefaultAsync(e => e.Id == id)
                ?? throw new KeyNotFoundException("Expense not found.");

            await VerifyPlanOwnershipAsync(expense.TravelPlanId, userId);

            _db.Expenses.Remove(expense);
            await _db.SaveChangesAsync();
        }

        public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(Guid planId, Guid userId)
        {
            await VerifyPlanOwnershipAsync(planId, userId);

            var plan = await _db.TravelPlans
                .Include(tp => tp.Expenses)
                .Include(tp => tp.Activities)   // Each Activity has estimated cost
                .FirstOrDefaultAsync(tp => tp.Id == planId)
                ?? throw new KeyNotFoundException("Travel plan not found.");

            var expenseTotal = plan.Expenses.Sum(e => e.Amount);
            var spentByCategory = plan.Expenses
                .GroupBy(e => e.Category)
                .ToDictionary(g => g.Key, g => (decimal)g.Sum(e => e.Amount));

            var activityEstimates = plan.Activities
                .Where(a => a.EstimatedCost > 0 && a.Status != "Cancelled")     // Cancelled activity estimated cost is ignored in spendings calculation
                .Sum(a => a.EstimatedCost);

            if (activityEstimates > 0)
                spentByCategory["Activities"] = activityEstimates;

            var totalSpent = expenseTotal + activityEstimates;

            return new BudgetSummaryDto
            {
                TotalBudget = plan.Budget,
                TotalSpent = totalSpent,
                RemainingBudget = plan.Budget - totalSpent,
                SpentByCategory = spentByCategory,
            };
        }
    }
}
