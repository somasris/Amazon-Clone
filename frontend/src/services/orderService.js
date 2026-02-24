import api from "./api";

export const placeOrder = (payload) => api.post("/orders", payload);
export const myOrders = (params) => api.get("/orders/my", { params });
export const orderStatuses = () => api.get("/orders/statuses");
export const allOrders = () => api.get("/admin/orders");
export const orderTransitions = (fromStatus) => api.get("/orders/transitions", { params: { from_status: fromStatus } });
export const transitionOrder = (id, payload) => api.patch(`/admin/orders/${id}/status`, payload);
