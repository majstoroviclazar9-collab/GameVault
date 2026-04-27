import axios from "axios";

const client = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("gamevault_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function api(path, options = {}) {
  try {
    const response = await client.request({
      url: path,
      method: options.method || "GET",
      data: options.body ? JSON.parse(options.body) : options.data,
      headers: options.headers || {},
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error || error.message || "Zahtev nije uspeo.";
    const requestError = new Error(message);
    requestError.status = error.response?.status || 0;
    throw requestError;
  }
}
