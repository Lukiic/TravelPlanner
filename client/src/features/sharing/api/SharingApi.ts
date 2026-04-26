import travelApi from '../../../api/travel.api';
import axios from 'axios';
import type { AccessType } from '../types/AccessType';
import type { ShareResponse } from '../types/ShareResponse';
import type { ShareToken } from '../types/ShareToken';
import type { SharedPlanData } from '../types/SharedPlanData';
import type { ISharingApi } from './ISharingApi';

// Public axios instance — no auth header, no interceptor redirect
const publicApi = axios.create({
    baseURL: import.meta.env.VITE_TRAVEL_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const sharingApi: ISharingApi = {
    createToken: (planId: string, accessType: AccessType) =>
        travelApi.post<ShareResponse>(`/travel-plans/${planId}/share`, { accessType }).then(r => r.data),

    getTokens: (planId: string) =>
        travelApi.get<ShareToken[]>(`/travel-plans/${planId}/share-tokens`).then(r => r.data),

    revokeToken: (token: string) =>
        travelApi.delete(`/share-tokens/${token}`),

    // Public — no auth
    getSharedPlan: (token: string) =>
        publicApi.get<SharedPlanData>(`/shared/${token}`).then(r => r.data),

    updateSharedActivity: (token: string, activityId: string, data: any) =>
        publicApi.put(`/shared/${token}/activities/${activityId}`, data).then(r => r.data),
};