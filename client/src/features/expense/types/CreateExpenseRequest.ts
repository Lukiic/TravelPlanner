import type { ExpenseCategory } from "./ExpenseCategory";

export interface CreateExpenseRequest {
    name: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
}