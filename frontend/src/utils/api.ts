const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token ? 'Present' : 'Missing'); // Debug log
  return token;
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const api = {
  // Auth endpoints
  signup: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Signup failed');
    }

    return response.json();
  },

  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
  },

  // Notes endpoints
  getNotes: async (searchQuery: string = '', sortBy: string = 'newest') => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search_query', searchQuery);
    if (sortBy) params.append('sort_by', sortBy);

    console.log('Fetching notes with params:', params.toString()); // Debug log
    const data = await makeAuthenticatedRequest(`${API_BASE_URL}/notes/?${params}`);
    return Array.isArray(data) ? data.map((n: any) => ({ ...n, id: n?.id ?? n?._id })) : [];
  },

  createNote: async (title: string, content: string) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/notes/`, {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  },

  updateNote: async (id: string, title: string, content: string) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/notes/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
  },

  deleteNote: async (id: string) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/notes/${id}/`, {
      method: 'DELETE',
    });
  },

  getNote: async (id: string) => {
    return makeAuthenticatedRequest(`${API_BASE_URL}/notes/${id}/`);
  },
};

export default api;