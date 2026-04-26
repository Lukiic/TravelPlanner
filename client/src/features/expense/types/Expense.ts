import type { ExpenseCategory } from "./ExpenseCategory";

export interface Expense {
    id: string;
    travelPlanId: string;
    name: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
}