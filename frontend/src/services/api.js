// Base URL for the Django API
// In production on Vercel, read from an environment variable:
// e.g. import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com'
export const API_BASE = 'http://127.0.0.1:8000/api';

// Helper for making API calls with standard headers and Token Auth
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Standardize error handling 
    throw data;
  }

  return data;
};

// ============================================================================
// Service Methods corresponding to Django API
// ============================================================================

export const authService = {
  login: (username, password) => apiCall('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  register: (userData) => apiCall('/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  logout: () => apiCall('/logout', { method: 'POST' }),
};

export const accountService = {
  getHomeData: () => apiCall('/home'),
  createAccount: (data) => apiCall('/accounts/create', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deactivateAccount: (data) => apiCall('/accounts/deactivate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};

export const transactionService = {
  getStatements: (accountNumber = null) => {
    let url = '/statements';
    if (accountNumber) url += `?account_number=${accountNumber}`;
    return apiCall(url);
  },
  transfer: (data) => apiCall('/transfer', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};

export const beneficiaryService = {
  getBeneficiaries: () => apiCall('/beneficiaries'),
  addBeneficiary: (data) => apiCall('/beneficiaries', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

export const fdService = {
  getFDs: () => apiCall('/fixed_deposits'),
  createFD: (data) => apiCall('/fixed_deposits', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancelFD: (fdId, verify_password) => apiCall(`/fixed_deposits/${fdId}/cancel`, {
    method: 'DELETE',
    body: JSON.stringify({ verify_password })
  })
};
