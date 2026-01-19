<template>
  <div id="map"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router' // Import useRouter
import { getKakaoMapApiKey, getBoundaries } from '@/api/mapApi'

const router = useRouter()

let map = null // 지도 인스턴스
const polygons = ref([]) // 현재 그려진 폴리곤들을 관리하기 위한 ref
let infowindow = null // InfoWindow 인스턴스를 script-level로 이동

onMounted(async () => {
  // console.log('0. onMounted: Component is mounted.')
  try {
    const response = await getKakaoMapApiKey()
    const apiKey = response.kakaoMapApiKey

    if (window.kakao && window.kakao.maps) {
      // console.log('0. onMounted: Kakao map script already loaded.')
      initMap()
    } else {
      // console.log('0. onMounted: Kakao map script not found, creating script tag...')
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
  // console.log('2. initMap: Function started.')
  const mapContainer = document.getElementById('map')
  const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 6,
  }
  map = new kakao.maps.Map(mapContainer, mapOption)
  map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC) // 교통정보 제거
  // console.log('3. initMap: Map object created.')

  infowindow = new kakao.maps.InfoWindow({
    removable: false,
    disableAutoPan: true,
  })

  // 지도 로딩 후 첫 경계선 데이터 요청
  updatePolygons()

  // 지도 이동 및 줌 변경 시 경계선 다시 그리도록 이벤트 등록
  // console.log('3. initMap: Adding map event listeners (dragend, zoom_changed).')
  kakao.maps.event.addListener(map, 'dragend', updatePolygons)
  kakao.maps.event.addListener(map, 'zoom_changed', updatePolygons)
}

// 지도 영역에 맞는 폴리곤을 API로 요청하여 그리는 함수
async function updatePolygons() {
  if (infowindow) {
    infowindow.close()
  }

  // console.log('4. updatePolygons: Function started.')
  if (!map) {
    console.error('4. updatePolygons: Map object is null!')
    return
  }
  // console.log('5. updatePolygons: Map object is valid, preparing to fetch boundaries.')

  // 기존 폴리곤 제거
  polygons.value.forEach((p) => p.setMap(null))
  polygons.value = []

  // 현재 지도 영역의 좌표 가져오기
  const bounds = map.getBounds()

  try {
    // API를 통해 현재 영역의 경계선 데이터만 받아옴
    // console.log('6. updatePolygons: Calling getBoundaries API...')
    const districtsData = await getBoundaries(bounds)
    // console.log('7. updatePolygons: API response received.', districtsData)
    if (!districtsData || !districtsData.features) {
      console.warn('7. updatePolygons: Response data is invalid or has no features.')
      return
    }

    districtsData.features.forEach((feature) => {
      const name = feature.properties.adm_nm || feature.properties.emd_nm
      if (!name || !feature.geometry) return

      const geometryType = feature.geometry.type
      const coordinates = feature.geometry.coordinates

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

      kakao.maps.event.addListener(polygon, 'mouseover', function (mouseEvent) {
        polygon.setOptions({ fillColor: '#ffcc3c', fillOpacity: 0.5 })
        infowindow.setContent(
          `<div style="padding:5px;text-align:center;font-size:12px;color:black;">${name}</div>`,
        )
        infowindow.setPosition(mouseEvent.latLng)
        infowindow.open(map)
      })

      kakao.maps.event.addListener(polygon, 'mouseout', function () {
        polygon.setOptions({ fillColor: '#F5F5F5', fillOpacity: 0.2 })
        infowindow.close()
      })

      kakao.maps.event.addListener(polygon, 'click', function () {
        infowindow.close()
        const nameParts = name.split(' ')
        if (nameParts.length >= 2) {
          const sido = nameParts[0]
          const gugun = nameParts[1]
          const regionQuery = `${sido}-${gugun}`

          router.push({ name: 'local', query: { region: regionQuery, page: 1 } })
        } else {
          console.warn('Cannot navigate. Region name format is not as expected:', name)
          const fallbackInfoWindow = new kakao.maps.InfoWindow({ removable: true })
          const content = `<div style="padding:5px;text-align:center;">${name}<br>(상세 지역 정보 부족)</div>`
          fallbackInfoWindow.setContent(content)
          fallbackInfoWindow.setPosition(mouseEvent.latLng)
          fallbackInfoWindow.open(map)
        }
      })

      polygons.value.push(polygon)
    })
    // console.log(`8. updatePolygons: Successfully drawn ${districtsData.features.length} polygons.`)
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
