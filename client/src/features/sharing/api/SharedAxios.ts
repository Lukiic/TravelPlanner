import axios from "axios";

export function createSharedAxios(token: string) {
    return axios.create({
        baseURL: import.meta.env.VITE_TRAVEL_SERVICE_URL,
        headers: {
            'Content-Type': 'application/json',
            'X-Share-Token': token,     // Shared token in header of request so JWT is not needed (server middleware validates this)
        },
    });
}