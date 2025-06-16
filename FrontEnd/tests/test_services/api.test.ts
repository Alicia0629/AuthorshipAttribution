import axios from 'axios';
import {
  registerUser,
  loginUser,
  getUserProfile,
  deleteUserAccount,
  sendModelData,
  predictText,
  checkModelStatus,
  deleteModel,
  getLatestModel,
  getModelDetails
} from '../../src/services/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios and global fetch
vi.mock('axios');
global.fetch = vi.fn();

describe('API Service Functions', () => {
  const mockToken = 'test-token';
  const mockResponse = { data: { success: true } };
  const mockError = {
    isAxiosError: true,
    response: { data: { detail: 'Error message' } }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_API_URL = 'http://test-api.com';
  });

  describe('registerUser', () => {
    it('should register a user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      axios.post.mockResolvedValue(mockResponse);

      const result = await registerUser(email, password);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-api.com/users/register',
        { email, password }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error with server message when registration fails', async () => {
      axios.post.mockRejectedValue(mockError);

      await expect(registerUser('test@example.com', 'pass'))
        .rejects.toThrow('Error desconocido al registrar');
    });

    it('should throw generic error when no server message', async () => {
      axios.post.mockRejectedValue({ isAxiosError: true });

      await expect(registerUser('test@example.com', 'pass'))
        .rejects.toThrow('Error desconocido al registrar');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      axios.post.mockResolvedValue(mockResponse);

      const result = await loginUser(email, password);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-api.com/auth/login',
        { email, password }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error with server message when login fails', async () => {
      axios.post.mockRejectedValue(mockError);

      await expect(loginUser('test@example.com', 'wrong'))
        .rejects.toThrow('Error desconocido al hacer login');
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      axios.get.mockResolvedValue(mockResponse);

      const result = await getUserProfile(mockToken);

      expect(axios.get).toHaveBeenCalledWith(
        'http://test-api.com/users/me',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when fetching profile fails', async () => {
      axios.get.mockRejectedValue(mockError);

      await expect(getUserProfile('invalid-token'))
        .rejects.toThrow('Error desconocido al obtener datos');
    });
  });

  describe('deleteUserAccount', () => {
    it('should delete account successfully', async () => {
      axios.delete.mockResolvedValue({});

      await deleteUserAccount(mockToken);

      expect(axios.delete).toHaveBeenCalledWith(
        'http://test-api.com/users/delete-account',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });

    it('should throw error when deletion fails', async () => {
      axios.delete.mockRejectedValue(mockError);

      await expect(deleteUserAccount('invalid-token'))
        .rejects.toThrow('Error desconocido al eliminar cuenta');
    });
  });

  describe('sendModelData', () => {
    it('should send model data successfully', async () => {
      const mockData = {
        file: 'test.csv',
        text_column: 'content',
        label_column: 'author',
        num_labels: 5
      };
      const mockJson = { model_id: '123' };
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockJson)
      });

      const result = await sendModelData(mockData, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://test-api.com/model/train',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify(mockData)
        }
      );
      expect(result).toEqual(mockJson);
    });
  });

  describe('predictText', () => {
    it('should make prediction successfully', async () => {
      const text = 'sample text';
      const modelId = '123';
      const mockResponse = { prediction: 'author1' };
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await predictText(text, modelId, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://test-api.com/model/predict',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({
            text: text,
            model_id: String(modelId)
          })
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when prediction fails', async () => {
      fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: 'Prediction error' })
      });

      await expect(predictText('text', '123', mockToken))
        .rejects.toThrow('Prediction error');
    });
  });

  describe('checkModelStatus', () => {
    it('should check model status successfully', async () => {
      const modelId = '123';
      axios.get.mockResolvedValue(mockResponse);

      const result = await checkModelStatus(modelId, mockToken);

      expect(axios.get).toHaveBeenCalledWith(
        `http://test-api.com/model/status/${modelId}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteModel', () => {
    it('should delete model successfully', async () => {
      const modelId = '123';
      axios.post.mockResolvedValue(mockResponse);

      const result = await deleteModel(modelId, mockToken);

      expect(axios.post).toHaveBeenCalledWith(
        'http://test-api.com/model/delete',
        { model_id: String(modelId) },
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getLatestModel', () => {
    it('should fetch latest model successfully', async () => {
      axios.get.mockResolvedValue(mockResponse);

      const result = await getLatestModel(mockToken);

      expect(axios.get).toHaveBeenCalledWith(
        'http://test-api.com/model/latest-model',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getModelDetails', () => {
    it('should fetch model details successfully', async () => {
      const modelId = '123';
      axios.get.mockResolvedValue(mockResponse);

      const result = await getModelDetails(modelId, mockToken);

      expect(axios.get).toHaveBeenCalledWith(
        `http://test-api.com/model/${modelId}`,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});