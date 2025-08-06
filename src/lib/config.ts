export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
	login: `${API_BASE_URL}/auth/login`,
	currentUser: `${API_BASE_URL}/auth/current`,
	books: `${API_BASE_URL}/books`,
	authors: `${API_BASE_URL}/authors`,
	categories: `${API_BASE_URL}/categories`,
	publisher: `${API_BASE_URL}/publishers`,
	upload: `${API_BASE_URL}/storage/upload`
};
