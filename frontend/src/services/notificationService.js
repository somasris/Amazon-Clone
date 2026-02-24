import api from "./api";

export const myNotifications = () => api.get("/notifications");
export const markRead = (id) => api.patch(`/notifications/${id}/read`);
