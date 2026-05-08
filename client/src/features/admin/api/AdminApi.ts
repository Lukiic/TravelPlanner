import userApi from '../../../api/user.api';
import travelApi from '../../../api/travel.api';
import type { User } from '../../auth/types/User';
import type { TravelPlan } from '../../travel-plan/types/TravelPlan';
import type { CreateUserRequest } from '../types/CreateUserRequest';
import type { IAdminApi } from './IAdminApi';

export const adminApi: IAdminApi = {
    // UserService
    getAllUsers: () =>
        userApi.get<User[]>('/users').then(r => r.data),

    deleteUser: (id: string) =>
        userApi.delete(`/users/${id}`),

    createUser: (data: CreateUserRequest) =>
        userApi.post<User>('/users', data).then(r => r.data),

    // TravelService
    getAllPlans: () =>
        travelApi.get<TravelPlan[]>('/admin/travel-plans').then(r => r.data),

    deletePlan: (id: string) =>
        travelApi.delete(`/travel-plans/${id}`),
};