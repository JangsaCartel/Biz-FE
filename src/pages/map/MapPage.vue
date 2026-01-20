<template>
  <div id="map"></div>
  <MapPostSheet
    :is-open="isSheetOpen"
    :region-name="selectedRegionName"
    :posts="sheetPosts"
    @close="handleSheetClose"
    @navigate="handleSheetNavigate"
  />
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getKakaoMapApiKey, getBoundaries, fetchUserRegionForMap } from '@/api/mapApi'
import MapPostSheet from '@/components/map/MapPostSheet.vue'
import { fetchHotPostsByRegion } from '@/api/boardApi'

const router = useRouter()

let map = null
const polygons = ref([])
let infowindow = null

const isSheetOpen = ref(false)
const sheetPosts = ref([])
const selectedRegionName = ref('')
let currentRegionQuery = ''

onMounted(async () => {
  try {
    const response = await getKakaoMapApiKey()
    const apiKey = response.kakaoMapApiKey

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`
    document.head.appendChild(script)

    script.onload = () => {
      kakao.maps.load(async () => {
        const userProfile = await fetchUserRegionForMap()
        const userRegion = userProfile?.region

        const geocoder = new kakao.maps.services.Geocoder()
        const defaultLat = 37.566826
        const defaultLng = 126.9786567

        if (userRegion) {
          geocoder.addressSearch(userRegion, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
              initMap(result[0].y, result[0].x)
            } else {
              console.warn(`Geocoding failed for user region: ${userRegion}. Using default center.`)
              initMap(defaultLat, defaultLng)
            }
          })
        } else {
          initMap(defaultLat, defaultLng)
        }
      })
    }
  } catch (error) {
    console.error('Failed to load Kakao Map API key or user region:', error)
    // API 키 로딩 실패 시에도 기본 위치로 지도 초기화
    initMap(37.566826, 126.9786567)
  }
})

function initMap(lat, lng) {
  const mapContainer = document.getElementById('map')
  const mapOption = {
    center: new kakao.maps.LatLng(lat, lng),
    level: 6,
  }
  map = new kakao.maps.Map(mapContainer, mapOption)

  infowindow = new kakao.maps.InfoWindow({
    removable: false,
    disableAutoPan: true,
  })

  updatePolygons()

  kakao.maps.event.addListener(map, 'dragend', updatePolygons)
  kakao.maps.event.addListener(map, 'zoom_changed', updatePolygons)
}

async function updatePolygons() {
  if (infowindow) {
    infowindow.close()
  }

  if (!map) {
    console.error('Map object is null!')
    return
  }

  const level = map.getLevel()

  polygons.value.forEach((p) => p.setMap(null))
  polygons.value = []

  if (level > 8) {
    return
  }

  const bounds = map.getBounds()

  try {
    const districtsData = await getBoundaries(bounds)
    if (!districtsData || !districtsData.features) {
      console.warn('Response data is invalid or has no features.')
      return
    }

    districtsData.features.forEach((feature) => {
      const regionName = feature.properties.adm_nm || feature.properties.emd_nm
      if (!regionName || !feature.geometry) return

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
          `<div style="padding:5px;text-align:center;font-size:12px;color:black;">${regionName}</div>`,
        )
        infowindow.setPosition(mouseEvent.latLng)
        infowindow.open(map)
      })

      kakao.maps.event.addListener(polygon, 'mouseout', function () {
        polygon.setOptions({ fillColor: '#F5F5F5', fillOpacity: 0.2 })
        infowindow.close()
      })

      kakao.maps.event.addListener(polygon, 'click', async function (mouseEvent) {
        infowindow.close()
        const nameParts = regionName.split(' ')
        if (nameParts.length >= 2) {
          const sido = nameParts[0]
          const gugun = nameParts[1]
          currentRegionQuery = `${sido}-${gugun}`
          selectedRegionName.value = `${sido} ${gugun}`

          try {
            const response = await fetchHotPostsByRegion(selectedRegionName.value, 3)
            sheetPosts.value = response.data
            isSheetOpen.value = true
          } catch (error) {
            console.error('Failed to fetch hot posts by region:', error)
          }
        } else {
          console.warn('Cannot process. Region name format is not as expected:', regionName)
          const fallbackInfoWindow = new kakao.maps.InfoWindow({ removable: true })
          const content = `<div style="padding:5px;text-align:center;">${regionName}<br>(상세 지역 정보 부족)</div>`
          fallbackInfoWindow.setContent(content)
          fallbackInfoWindow.setPosition(mouseEvent.latLng)
          fallbackInfoWindow.open(map)
        }
      })

      polygons.value.push(polygon)
    })
  } catch (error) {
    console.error('Failed during API call or polygon drawing.', error)
  }
}

const handleSheetNavigate = (regionName) => {
  router.push({ name: 'local', query: { region: currentRegionQuery, page: 1 } })
  isSheetOpen.value = false
}

const handleSheetClose = () => {
  isSheetOpen.value = false
}
</script>

<style scoped>
#map {
  width: 100%;
  height: calc(100vh - 120px);
}
</style>
