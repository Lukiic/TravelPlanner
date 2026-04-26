import travelApi from '../../../api/travel.api';
import type { CreateDestinationRequest } from '../types/CreateDestinationRequest';
import type { Destination } from '../types/Destination';

export const destinationApi = {
    getAll: (planId: string) =>
        travelApi.get<Destination[]>(`/travel-plans/${planId}/destinations`).then(r => r.data),

    create: (planId: string, data: CreateDestinationRequest) =>
        travelApi.post<Destination>(`/travel-plans/${planId}/destinations`, data).then(r => r.data),

    update: (planId: string, id: string, data: Partial<CreateDestinationRequest>) =>
        travelApi.put<Destination>(`/travel-plans/${planId}/destinations/${id}`, data).then(r => r.data),

    delete: (planId: string, id: string) =>
        travelApi.delete(`/travel-plans/${planId}/destinations/${id}`),
};