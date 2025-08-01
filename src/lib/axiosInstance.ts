import {config} from '@/config/environment';
import axios from 'axios';
import {toast} from "react-toastify";

const axiosInstance = axios.create({
    baseURL: config.baseURL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            sessionStorage.clear();
            localStorage.clear();
            toast.info("Session Expired! Please Login Again")
            setTimeout(() => {
                window.location.replace('/');
            }, 3000);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
