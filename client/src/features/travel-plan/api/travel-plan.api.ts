import travelApi from '../../../api/travel.api';
import type { CreateTravelPlanRequest, UpdateTravelPlanRequest } from '../types/CreateTravelPlanRequest';
import type { TravelPlan } from '../types/TravelPlan';

export const travelPlanApi = {
    getAll: () =>
        travelApi.get<TravelPlan[]>('/travel-plans').then(r => r.data),

    getById: (id: string) =>
        travelApi.get<TravelPlan>(`/travel-plans/${id}`).then(r => r.data),

    create: (data: CreateTravelPlanRequest) =>
        travelApi.post<TravelPlan>('/travel-plans', data).then(r => r.data),

    update: (id: string, data: UpdateTravelPlanRequest) =>
        travelApi.put<TravelPlan>(`/travel-plans/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        travelApi.delete(`/travel-plans/${id}`),

    exportPdf: (id: string) =>
        travelApi.get(`/travel-plans/${id}/export-pdf`, { responseType: 'blob' }).then(r => r.data),
};