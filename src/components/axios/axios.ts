import axios from "axios";

const api = axios.create({
  // Relative "/api" goes through the Vite proxy in dev, so the auth cookie is same-origin
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
