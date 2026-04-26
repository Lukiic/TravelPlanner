import type { Activity } from '../types/Activity';
import type { CreateActivityRequest } from '../types/CreateActivityRequest';
import type { AxiosResponse } from 'axios';

export interface IActivityApi {
    getAll: (planId: string, date?: string) => Promise<Activity[]>;
    getById: (planId: string, id: string) => Promise<Activity>;
    create: (planId: string, data: CreateActivityRequest) => Promise<Activity>;
    update: (planId: string, id: string, data: Partial<CreateActivityRequest>) => Promise<Activity>;
    delete: (planId: string, id: string) => Promise<AxiosResponse<void>>;
}