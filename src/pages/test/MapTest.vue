<template>
  <div>
    <h1>Kakao Map Test</h1>
    <div id="map" style="width: 500px; height: 400px"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { getKakaoMapApiKey } from '@/api/mapApi'

onMounted(async () => {
  try {
    const response = await getKakaoMapApiKey()
    const apiKey = response.kakaoMapApiKey

    if (window.kakao && window.kakao.maps) {
      initMap(apiKey)
    } else {
      const script = document.createElement('script')
      script.onload = () => kakao.maps.load(() => initMap(apiKey))
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
      document.head.appendChild(script)
    }
  } catch (error) {
    console.error('Failed to load Kakao Map:', error)
  }
})

// eslint-disable-next-line no-unused-vars
function initMap(_apiKey) {
  const mapContainer = document.getElementById('map')
  const mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 3,
  }
  new kakao.maps.Map(mapContainer, mapOption)
}
// 제목 수정
</script>

<style scoped>
#map {
  border: 1px solid #ccc;
}
</style>
