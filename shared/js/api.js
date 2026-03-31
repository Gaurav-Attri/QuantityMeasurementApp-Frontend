const BASE_URL = "http://localhost:5174";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res;
}