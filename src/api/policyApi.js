import apiClient from '@/api/apiClient'

export async function fetchPolicyList({ page, size, domain, hashtags }) {
  const params = {
    page,
    size,
  }

  if (domain) {
    params.domain = domain
  }

  if (Array.isArray(hashtags) && hashtags.length > 0) {
    params.hashtags = hashtags.join(',')
  }

  // GET /biz-be/api/policies?page=2&size=4&domain=...&hashtags=금융,서울
  const res = await apiClient.get('/policies', { params })

  // 백엔드에서 받은 정보 확인 log
  console.log('[policyApi] /policies raw response:', res.data)

  return res.data
}
