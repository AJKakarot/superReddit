// If you haven't already, run: npm install axios @types/axios
import axios from "axios";
// TODO: Type config parameter more strictly if axios types are available

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000", // Use backend domain in production
  withCredentials: false, // CORS, but no cookies needed for JWT
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api; 