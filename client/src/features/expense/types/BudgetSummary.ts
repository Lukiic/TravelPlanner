export interface BudgetSummary {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    spentByCategory: Record<string, number>;
}
