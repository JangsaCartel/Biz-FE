<template>
  <div id="map"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getKakaoMapApiKey, getBoundaries } from '@/api/mapApi'

let map = null // 지도 인스턴스
const polygons = ref([]) // 현재 그려진 폴리곤들을 관리하기 위한 ref

onMounted(async () => {
  console.log('0. onMounted: Component is mounted.')
  try {
    const response = await getKakaoMapApiKey()
    const apiKey = response.kakaoMapApiKey

    if (window.kakao && window.kakao.maps) {
      console.log('0. onMounted: Kakao map script already loaded.')
      initMap()
    } else {
      console.log('0. onMounted: Kakao map script not found, creating script tag...')
      const script = document.createElement('script')
      script.onload = () => {
        kakao.maps.load(() => initMap())
      }
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
      document.head.appendChild(script)
    }
  } catch (error) {
    console.error('Failed to load Kakao Map API key:', error)
  }
})

function initMap() {
  console.log('2. initMap: Function started.')
  const mapContainer = document.getElementById('map')
  const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 6, // 지도를 줌인 (더 확대)
  }
  map = new kakao.maps.Map(mapContainer, mapOption)
  console.log('3. initMap: Map object created.')

  // 지도 로딩 후 첫 경계선 데이터 요청
  updatePolygons()

  // 지도 이동 및 줌 변경 시 경계선 다시 그리도록 이벤트 등록
  console.log('3. initMap: Adding map event listeners (dragend, zoom_changed).')
  kakao.maps.event.addListener(map, 'dragend', updatePolygons)
  kakao.maps.event.addListener(map, 'zoom_changed', updatePolygons)
}

// 지도 영역에 맞는 폴리곤을 API로 요청하여 그리는 함수
async function updatePolygons() {
  console.log('4. updatePolygons: Function started.')
  if (!map) {
    console.error('4. updatePolygons: Map object is null!')
    return
  }
  console.log('5. updatePolygons: Map object is valid, preparing to fetch boundaries.')

  // 기존 폴리곤 제거
  polygons.value.forEach((p) => p.setMap(null))
  polygons.value = []

  // 현재 지도 영역의 좌표 가져오기
  const bounds = map.getBounds()

  try {
    // API를 통해 현재 영역의 경계선 데이터만 받아옴
    console.log('6. updatePolygons: Calling getBoundaries API...')
    const districtsData = await getBoundaries(bounds)
    console.log('7. updatePolygons: API response received.', districtsData)
    if (!districtsData || !districtsData.features) {
      console.warn('7. updatePolygons: Response data is invalid or has no features.')
      return
    }

    // 받아온 데이터로 폴리곤 그리기
    const infowindow = new kakao.maps.InfoWindow({ removable: true })

    districtsData.features.forEach((feature) => {
      const name = feature.properties.adm_nm || feature.properties.emd_nm // 속성 이름 임시로 조정해둠
      if (!name || !feature.geometry) return

      const geometryType = feature.geometry.type
      const coordinates = feature.geometry.coordinates

      // MultiPolygon일 경우, 첫 번째 폴리곤만 그리도록 단순화 (추후 확장 가능성 있음)
      const polygonCoords = geometryType === 'Polygon' ? coordinates[0] : coordinates[0][0]

      const path = polygonCoords.map((coord) => new kakao.maps.LatLng(coord[1], coord[0]))

      const polygon = new kakao.maps.Polygon({
        map: map,
        path: path,
        strokeWeight: 2,
        strokeColor: '#004c80',
        strokeOpacity: 0.8,
        fillColor: '#F5F5F5',
        fillOpacity: 0.2,
      })

      // 폴리곤에 마우스오버/아웃/클릭 이벤트 등록
      kakao.maps.event.addListener(polygon, 'mouseover', function () {
        polygon.setOptions({ fillColor: '#ffcc3c', fillOpacity: 0.5 }) // 마우스 오버 시 시그니처 색상(노란색)으로 변경
      })
      kakao.maps.event.addListener(polygon, 'mouseout', function () {
        polygon.setOptions({ fillColor: '#F5F5F5', fillOpacity: 0.2 }) // 마우스 아웃 시 원래 색상으로 복구
      })
      kakao.maps.event.addListener(polygon, 'click', function (mouseEvent) {
        console.log('Polygon clicked:', feature.properties)
        const content = `<div style="padding:5px;text-align:center;">${name}</div>`
        infowindow.setContent(content)
        infowindow.setPosition(mouseEvent.latLng)
        infowindow.open(map)
      })

      polygons.value.push(polygon) // 새로 그린 폴리곤을 관리 목록에 추가
    })
    console.log(`8. updatePolygons: Successfully drawn ${districtsData.features.length} polygons.`)
  } catch (error) {
    console.error('9. updatePolygons: Failed during API call or polygon drawing.', error)
  }
}
</script>

<style scoped>
#map {
  width: 100%;
  height: calc(100vh - 120px);
}
</style>
