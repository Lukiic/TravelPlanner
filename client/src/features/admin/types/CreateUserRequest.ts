export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Admin';
}