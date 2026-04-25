using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelService.Data;
using TravelService.DTOs;
using TravelService.Models;

namespace TravelService.Services
{
    public class ExpenseService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;

        private static readonly string[] ValidCategories =
            { "Transport", "Accommodation", "Food", "Tickets", "Shopping", "Other" };

        public ExpenseService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        private async Task VerifyPlanOwnershipAsync(Guid planId, Guid userId)
        {
            var plan = await _db.TravelPlans.FindAsync(planId)
                ?? throw new KeyNotFoundException("Travel plan not found.");

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

            if (expense.TravelPlan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");

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

            if (expense.TravelPlan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");

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

            if (expense.TravelPlan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");

            _db.Expenses.Remove(expense);
            await _db.SaveChangesAsync();
        }

        public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(Guid planId, Guid userId)
        {
            var plan = await _db.TravelPlans
                .Include(tp => tp.Expenses)
                .FirstOrDefaultAsync(tp => tp.Id == planId)
                ?? throw new KeyNotFoundException("Travel plan not found.");

            if (plan.UserId != userId)
                throw new UnauthorizedAccessException("Access denied.");

            var totalSpent = plan.Expenses.Sum(e => e.Amount);
            var spentByCategory = plan.Expenses
                .GroupBy(e => e.Category)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));

            return new BudgetSummaryDto
            {
                TotalBudget = plan.Budget,
                TotalSpent = totalSpent,
                RemainingBudget = plan.Budget - totalSpent,
                SpentByCategory = spentByCategory
            };
        }
    }
}
