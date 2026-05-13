import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config';

const useAxios = () => {
    const { token } = useAuth();

    const api = axios.create({
        baseURL: getApiUrl(''), // Use the helper to get the base URL
    });

    api.interceptors.request.use(
        (config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return api;
};

export default useAxios;
