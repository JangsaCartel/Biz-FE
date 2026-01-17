import apiClient from './apiClient';

export const getKakaoMapApiKey = async () => {
  try {
    const response = await apiClient.get('/map/key');
    return response.data;
  } catch (error) {
    console.error('Error fetching Kakao Map API key:', error);
    throw error;
  }
};
