import api from "./api";

export const getCart = () => api.get("/cart");
export const addCart = (payload) => api.post("/cart", payload);
export const updateCart = (id, payload) => api.put(`/cart/${id}`, payload);
export const removeCart = (id) => api.delete(`/cart/${id}`);
