//Early stage now, keep as placeholder
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, //fetch base URL
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  // attach token in header
  // Backend team will handle via cookies
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

export default axiosClient; //Export to default
