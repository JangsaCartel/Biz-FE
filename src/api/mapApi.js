import apiClient from './apiClient'

export const getKakaoMapApiKey = async () => {
  try {
    const response = await apiClient.get('/map/key')
    return response.data
  } catch (error) {
    console.error('Error fetching Kakao Map API key:', error)
    throw error
  }
}

export const getBoundaries = async (bounds) => {
  try {
    const params = {
      minLat: bounds.getSouthWest().getLat(),
      minLng: bounds.getSouthWest().getLng(),
      maxLat: bounds.getNorthEast().getLat(),
      maxLng: bounds.getNorthEast().getLng(),
    }
    const response = await apiClient.get('/map/boundaries', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching boundaries:', error)
  }
}
