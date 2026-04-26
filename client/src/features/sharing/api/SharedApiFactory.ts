import { createSharedAxios } from './SharedAxios';
import type { IDestinationApi } from '../../destination/api/IDestinationApi';
import type { IActivityApi } from '../../activity/api/IActivityApi';
import type { IExpenseApi } from '../../expense/api/IExpenseApi';
import type { IChecklistApi } from '../../checklist/api/IChecklistApi';
import type { Destination } from '../../destination/types/Destination';
import type { Activity } from '../../activity/types/Activity';
import type { Expense } from '../../expense/types/Expense';
import type { ChecklistItem } from '../../checklist/types/ChecklistItem';
import type { CreateDestinationRequest } from '../../destination/types/CreateDestinationRequest';
import type { CreateActivityRequest } from '../../activity/types/CreateActivityRequest';
import type { CreateExpenseRequest } from '../../expense/types/CreateExpenseRequest';
import type { BudgetSummary } from '../../expense/types/BudgetSummary';

export function createSharedApis(token: string) {   // Each API request has sharing token in header
    const http = createSharedAxios(token);

    const destinationApi: IDestinationApi = {
        getAll: (planId: string) =>
            http.get<Destination[]>(`/travel-plans/${planId}/destinations`).then(r => r.data),
        create: (planId: string, data: CreateDestinationRequest) =>
            http.post<Destination>(`/travel-plans/${planId}/destinations`, data).then(r => r.data),
        update: (planId: string, id: string, data: Partial<CreateDestinationRequest>) =>
            http.put<Destination>(`/travel-plans/${planId}/destinations/${id}`, data).then(r => r.data),
        delete: (planId: string, id: string) =>
            http.delete(`/travel-plans/${planId}/destinations/${id}`),
    };

    const activityApi: IActivityApi = {
        getAll: (planId: string, date?: string) =>
            http.get<Activity[]>(`/travel-plans/${planId}/activities`, { params: date ? { date } : {} }).then(r => r.data),
        getById: (planId: string, id: string) =>
            http.get<Activity>(`/travel-plans/${planId}/activities/${id}`).then(r => r.data),
        create: (planId: string, data: CreateActivityRequest) =>
            http.post<Activity>(`/travel-plans/${planId}/activities`, data).then(r => r.data),
        update: (planId: string, id: string, data: Partial<CreateActivityRequest>) =>
            http.put<Activity>(`/travel-plans/${planId}/activities/${id}`, data).then(r => r.data),
        delete: (planId: string, id: string) =>
            http.delete(`/travel-plans/${planId}/activities/${id}`),
    };

    const expenseApi: IExpenseApi = {
        getAll: (planId: string) =>
            http.get<Expense[]>(`/travel-plans/${planId}/expenses`).then(r => r.data),
        create: (planId: string, data: CreateExpenseRequest) =>
            http.post<Expense>(`/travel-plans/${planId}/expenses`, data).then(r => r.data),
        update: (planId: string, id: string, data: Partial<CreateExpenseRequest>) =>
            http.put<Expense>(`/travel-plans/${planId}/expenses/${id}`, data).then(r => r.data),
        delete: (planId: string, id: string) =>
            http.delete(`/travel-plans/${planId}/expenses/${id}`),
        getBudgetSummary: (planId: string) =>
            http.get<BudgetSummary>(`/travel-plans/${planId}/budget`).then(r => r.data),
    };

    const checklistApi: IChecklistApi = {
        getAll: (planId: string) =>
            http.get<ChecklistItem[]>(`/travel-plans/${planId}/checklist`).then(r => r.data),
        create: (planId: string, name: string) =>
            http.post<ChecklistItem>(`/travel-plans/${planId}/checklist`, { name }).then(r => r.data),
        update: (planId: string, id: string, data: { name?: string; isCompleted?: boolean }) =>
            http.put<ChecklistItem>(`/travel-plans/${planId}/checklist/${id}`, data).then(r => r.data),
        delete: (planId: string, id: string) =>
            http.delete(`/travel-plans/${planId}/checklist/${id}`),
        toggle: (planId: string, id: string, currentStatus: boolean) =>
            http.put<ChecklistItem>(`/travel-plans/${planId}/checklist/${id}`, { isCompleted: !currentStatus }).then(r => r.data),
    };

    return { destinationApi, activityApi, expenseApi, checklistApi };
}