import API from "./api";

export const getAllUsers = () => API.get("/admin/users").then(r => r.data);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`).then(r => r.data);
export const getAllUploads = () => API.get("/admin/uploads").then(r => r.data);
