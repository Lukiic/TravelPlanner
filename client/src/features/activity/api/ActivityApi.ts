import travelApi from '../../../api/travel.api';
import type { Activity } from '../types/Activity';
import type { CreateActivityRequest } from '../types/CreateActivityRequest';
import type { IActivityApi } from './IActivityApi';

export const activityApi: IActivityApi = {
    getAll: (planId: string, date?: string) => {
        const params = date ? { date } : {};
        return travelApi.get<Activity[]>(`/travel-plans/${planId}/activities`, { params }).then(r => r.data);
    },

    getById: (planId: string, id: string) =>
        travelApi.get<Activity>(`/travel-plans/${planId}/activities/${id}`).then(r => r.data),

    create: (planId: string, data: CreateActivityRequest) =>
        travelApi.post<Activity>(`/travel-plans/${planId}/activities`, data).then(r => r.data),

    update: (planId: string, id: string, data: Partial<CreateActivityRequest>) =>
        travelApi.put<Activity>(`/travel-plans/${planId}/activities/${id}`, data).then(r => r.data),

    delete: (planId: string, id: string) =>
        travelApi.delete(`/travel-plans/${planId}/activities/${id}`),
};