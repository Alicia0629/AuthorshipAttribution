import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, {
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
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error al hacer login');
    }
    throw new Error('Error desconocido al hacer login');
  }
};

export const getUserProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
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
    await axios.delete(`${API_URL}/users/delete-account`, {
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

export const sendModelData = async (
  data: { file: string; text_column: string; label_column: string; num_labels: number },
  token: string
) => {
  const response = await fetch(`${API_URL}/runpod/train`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const checkModelStatus = async (modelId: string, token: string) => {
  try {
    const response = await axios.get(`${API_URL}/runpod/status/${modelId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Error al verificar estado');
    }
    throw new Error('Error desconocido al verificar estado');
  }
};