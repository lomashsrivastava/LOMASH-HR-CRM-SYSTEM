
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const useAxios = () => {
    const { token } = useAuth();

    const api = axios.create({
        baseURL: 'http://127.0.0.1:4000/api/v1',
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
