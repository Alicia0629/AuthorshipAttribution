import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const registerUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Error al registrar');
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Error al hacer login');
  }
};

export const getUserProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Error al obtener datos');
  }
};
