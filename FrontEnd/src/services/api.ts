import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error al registrar');
    }
    throw new Error('Error desconocido al registrar');
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error al haver login');
    }
    throw new Error('Error desconocido al hacer login');
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error al obtener datos');
    }
    throw new Error('Error desconocido al obtener datos');
  }
};

export const deleteUserAccount = async (token: string) => {
  try {
    await axios.delete(`${API_URL}/delete-account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error al eliminar cuenta');
    }
    throw new Error('Error desconocido al eliminar cuenta');
  }
};
