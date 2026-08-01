const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('orderflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('orderflow_token');
      localStorage.removeItem('orderflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  get: async (endpoint, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}${endpoint}${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async (endpoint, body = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (endpoint, body = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
