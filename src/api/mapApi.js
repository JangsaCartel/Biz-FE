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

/**
 * 지도 표시를 위해 현재 로그인된 사용자의 지역 정보를 가져옴
 * @returns {Promise<any>}
 */
export const fetchUserRegionForMap = async () => {
  // 토큰이 없으면 요청을 보내지 않고 null 반환
  if (!sessionStorage.getItem('accessToken')) {
    return null
  }
  try {
    const response = await apiClient.get('/users/mypage')
    return response.data
  } catch (error) {
    // 401 (토큰 만료 등) 또는 기타 에러 발생 시 콘솔에 로그만 남기고 null 반환
    console.error('Error fetching user region for map:', error)
    return null
  }
}
