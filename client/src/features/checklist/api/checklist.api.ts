import travelApi from '../../../api/travel.api';
import type { ChecklistItem } from '../types/ChecklistItem';

export const checklistApi = {
    getAll: (planId: string) =>
        travelApi.get<ChecklistItem[]>(`/travel-plans/${planId}/checklist`).then(r => r.data),

    create: (planId: string, name: string) =>
        travelApi.post<ChecklistItem>(`/travel-plans/${planId}/checklist`, { name }).then(r => r.data),

    update: (planId: string, id: string, data: { name?: string; isCompleted?: boolean }) =>
        travelApi.put<ChecklistItem>(`/travel-plans/${planId}/checklist/${id}`, data).then(r => r.data),

    delete: (planId: string, id: string) =>
        travelApi.delete(`/travel-plans/${planId}/checklist/${id}`),

    toggle: (planId: string, id: string, currentStatus: boolean) =>
        travelApi.put<ChecklistItem>(`/travel-plans/${planId}/checklist/${id}`, { isCompleted: !currentStatus }).then(r => r.data),
};