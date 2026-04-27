import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor — shto JWT token në çdo kërkesë
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor — trajto përgjigjet me gabim
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('perdoruesi');
      if (window.location.pathname !== '/hyrje') {
        window.location.href = '/hyrje';
      }
    }
    return Promise.reject(error);
  }
);

// ═══════ AUTH ═══════
export const authAPI = {
  regjistrim: (data) => apiClient.post('/auth/regjistrim', data),
  hyrje: (data) => apiClient.post('/auth/hyrje', data),
  profili: () => apiClient.get('/auth/profili'),
  perditesoProfili: (data) => apiClient.put('/auth/profili', data),
  verifikoEmail: (token) => apiClient.get(`/auth/verifiko-email/${token}`),
};

// ═══════ AUTOMJETE ═══════
export const automjeteAPI = {
  lista: (params) => apiClient.get('/automjete', { params }),
  detajet: (id) => apiClient.get(`/automjete/${id}`),
  krijo: (data) => apiClient.post('/automjete', data),
  perditeso: (id, data) => apiClient.put(`/automjete/${id}`, data),
  fshi: (id) => apiClient.delete(`/automjete/${id}`),
};

// ═══════ SIGURIME ═══════
export const sigurimeAPI = {
  lista: (params) => apiClient.get('/sigurime', { params }),
  detajet: (id) => apiClient.get(`/sigurime/${id}`),
  krijo: (data) => apiClient.post('/sigurime', data),
  perditeso: (id, data) => apiClient.put(`/sigurime/${id}`, data),
  fshi: (id) => apiClient.delete(`/sigurime/${id}`),
  qeSkadojne: (dite = 30) => apiClient.get(`/sigurime/qe-skadojne?dite=${dite}`),
};

// ═══════ KLIENTË ═══════
export const klienteAPI = {
  lista: (params) => apiClient.get('/kliente', { params }),
  detajet: (id) => apiClient.get(`/kliente/${id}`),
  perditeso: (id, data) => apiClient.put(`/kliente/${id}`, data),
  fshi: (id) => apiClient.delete(`/kliente/${id}`),
};

// ═══════ QIRADHËNIE ═══════
export const qiraDhenieAPI = {
  lista: (params) => apiClient.get('/qiradhenie', { params }),
  detajet: (id) => apiClient.get(`/qiradhenie/${id}`),
  krijo: (data) => apiClient.post('/qiradhenie', data),
  ndryshStatuisin: (id, data) => apiClient.put(`/qiradhenie/${id}/statusi`, data),
  kontrolloDisponueshmerine: (params) => apiClient.get('/qiradhenie/kontrollo-disponueshmerine', { params }),
};

// ═══════ RAPORTE ═══════
export const raporteAPI = {
  statistika: () => apiClient.get('/raporte/statistika'),
  perdorimi: () => apiClient.get('/raporte/perdorimi'),
  sigurime: () => apiClient.get('/raporte/sigurime'),
};

// ═══════ NJOFTIMET ═══════
export const njoftimetAPI = {
  lista: (params) => apiClient.get('/njoftimet', { params }),
  shenioLexuar: (id) => apiClient.put(`/njoftimet/${id}/lexo`),
  lexoTeGjitha: () => apiClient.put('/njoftimet/lexo-te-gjitha'),
};

export default apiClient;
