import axios from 'axios';

const API = axios.create({
  baseURL:'https://excel-analytics-platform-w6db.onrender.com/api',
});

// Automatically attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => API.post('/auth/register', data).then(r => r.data);
export const login = (data) => API.post('/auth/login', data).then(r => r.data);

export const uploadFile = (formData) =>
  API.post('/uploads/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const getHistory = () => API.get('/uploads/history').then(r => r.data);
export const getAllUploads = () => API.get('/uploads/all').then(r => r.data);

// --- Delete helpers ---
export const deleteUpload = (id) => API.delete(`/uploads/${id}`).then(r => r.data);

// ✅ Fixed route: backend expects /admin/users/:id
export const deleteUser = (id) => API.delete(`/admin/users/${id}`).then(r => r.data);
