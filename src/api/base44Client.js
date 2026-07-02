// Standalone backend client — drop-in replacement for the old Base44 SDK client.
// Keeps the same shape (entities / auth / users / functions) so the rest of the
// app code did not need to change.

const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch (e) { /* ignore */ }
    const error = new Error((data && data.error) || `Request failed: ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

function makeEntity(name) {
  return {
    list: (sort, limit) => {
      const params = new URLSearchParams();
      if (sort) params.set('sort', sort);
      if (limit) params.set('limit', String(limit));
      const qs = params.toString();
      return request(`/entities/${name}${qs ? `?${qs}` : ''}`);
    },
    filter: (query = {}, sort, limit) => {
      const params = new URLSearchParams();
      params.set('filter', JSON.stringify(query));
      if (sort) params.set('sort', sort);
      if (limit) params.set('limit', String(limit));
      return request(`/entities/${name}?${params.toString()}`);
    },
    create: (data) => request(`/entities/${name}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/entities/${name}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/entities/${name}/${id}`, { method: 'DELETE' }),
  };
}

export const base44 = {
  entities: {
    Product: makeEntity('Product'),
    Order: makeEntity('Order'),
    User: makeEntity('User'),
    SpecialClient: makeEntity('SpecialClient'),
    SpecialClientProduct: makeEntity('SpecialClientProduct'),
  },
  auth: {
    me: () => request('/auth/me'),
    updateMe: (data) => request('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
    login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password, full_name) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name }) }),
    logout: async (redirectTo = '/') => {
      try { await request('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
      window.location.href = redirectTo;
    },
    redirectToLogin: (returnTo = '/catalog') => {
      window.location.href = `/login?return=${encodeURIComponent(returnTo)}`;
    },
  },
  users: {
    inviteUser: (email, role, password) => request('/users/invite', { method: 'POST', body: JSON.stringify({ email, role, password }) }),
    setPassword: (id, password) => request(`/users/${id}/set-password`, { method: 'POST', body: JSON.stringify({ password }) }),
  },
  functions: {
    invoke: (name, payload) => request(`/functions/${name}`, { method: 'POST', body: JSON.stringify(payload) }),
  },
  public: {
    listProducts: () => request('/public/products'),
    createOrder: (data) => request('/public/orders', { method: 'POST', body: JSON.stringify(data) }),
  },
};
