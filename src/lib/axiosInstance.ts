import {config} from '@/config/environment';
import axios from 'axios';

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

// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401 || error.response?.status === 403) {
//             sessionStorage.removeItem('authToken');
//             sessionStorage.clear();
//             window.location.href = '/';
//             setTimeout(() => {
//                 alert("Your session has expired. Please login again."); // Replace with toast/snackbar if in a React component
//             }, 300);
//         }
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;
