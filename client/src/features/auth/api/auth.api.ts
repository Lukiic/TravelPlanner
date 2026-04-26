import userApi from '../../../api/user.api';
import type { AuthResponse } from '../types/AuthResponse';
import type { LoginRequest } from '../types/LoginRequest';
import type { RegisterRequest } from '../types/RegisterRequest';

export const authApi = {
    login: (data: LoginRequest) =>
        userApi.post<AuthResponse>('/auth/login', data).then(r => r.data),

    register: (data: RegisterRequest) =>
        userApi.post<AuthResponse>('/auth/register', data).then(r => r.data),
};