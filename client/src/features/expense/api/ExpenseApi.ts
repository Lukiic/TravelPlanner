import travelApi from '../../../api/travel.api';
import type { BudgetSummary } from '../types/BudgetSummary';
import type { CreateExpenseRequest } from '../types/CreateExpenseRequest';
import type { Expense } from '../types/Expense';
import type { IExpenseApi } from './IExpenseApi';

export const expenseApi: IExpenseApi = {
    getAll: (planId: string) =>
        travelApi.get<Expense[]>(`/travel-plans/${planId}/expenses`).then(r => r.data),

    create: (planId: string, data: CreateExpenseRequest) =>
        travelApi.post<Expense>(`/travel-plans/${planId}/expenses`, data).then(r => r.data),

    update: (planId: string, id: string, data: Partial<CreateExpenseRequest>) =>
        travelApi.put<Expense>(`/travel-plans/${planId}/expenses/${id}`, data).then(r => r.data),

    delete: (planId: string, id: string) =>
        travelApi.delete(`/travel-plans/${planId}/expenses/${id}`),

    getBudgetSummary: (planId: string) =>
        travelApi.get<BudgetSummary>(`/travel-plans/${planId}/budget`).then(r => r.data),
};