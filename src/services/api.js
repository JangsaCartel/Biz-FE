import axios from 'axios'

const instance = axios.create({
  baseURL: '/biz-be',
  // withCredentials: true, // 필요 시 주석 해제
})

export default instance
