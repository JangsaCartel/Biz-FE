import apiClient from '@/api/apiClient'

export async function fetchWeeklyAiAnalysis({ week, limit, topK }) {
  const { data } = await apiClient.get('/ai/analysis/weekly', {
    params: { week, limit, topK },
  })
  return data
}
