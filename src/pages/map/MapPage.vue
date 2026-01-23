<template>
  <div id="map"></div>
  <MapPostSheet
    :is-open="isSheetOpen"
    :region-name="selectedRegionName"
    :posts="sheetPosts"
    @close="handleSheetClose"
    @navigate="handleSheetNavigate"
    @select-post="handlePostSelect"
  />
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getKakaoMapApiKey, getBoundaries, fetchUserRegionForMap } from '@/api/mapApi'
import MapPostSheet from '@/components/map/MapPostSheet.vue'
import { fetchHotPostsByRegion } from '@/api/boardApi'
import { useBoardStore } from '@/stores/board/board.js'
import districtData from '@/assets/data/district.json'

const router = useRouter()
const boardStore = useBoardStore()

let map = null
const polygons = ref([])
let infowindow = null

const isSheetOpen = ref(false)
const sheetPosts = ref([])
const selectedRegionName = ref('')
let currentRegionQuery = ''

const regionLookupMap = new Map()

onMounted(async () => {
  // GeoJSON의 지역이름을 district.json 기준으로 변환하기 위한 조회 지도 생성
  districtData.forEach((entry) => {
    const { sido, sigungu, eupmyeondong } = entry
    if (!sido) return

    const value = { sido, sigungu: sigungu || '' }

    const sigunguNoSpace = sigungu ? sigungu.replace(/ /g, '') : ''
    const eupmyeondongNoSpace = eupmyeondong ? eupmyeondong.replace(/ /g, '') : ''

    if (eupmyeondongNoSpace && sigunguNoSpace) {
      const key1 = (sido + sigunguNoSpace + eupmyeondongNoSpace).replace(/ /g, '')
      if (!regionLookupMap.has(key1)) {
        regionLookupMap.set(key1, value)
      }
    }

    if (sigunguNoSpace && eupmyeondongNoSpace) {
      const key2 = (sigunguNoSpace + eupmyeondongNoSpace).replace(/ /g, '')
      if (!regionLookupMap.has(key2)) {
        regionLookupMap.set(key2, value)
      }
    }

    if (sigunguNoSpace) {
      const key3 = (sido + sigunguNoSpace).replace(/ /g, '')
      if (!regionLookupMap.has(key3)) {
        regionLookupMap.set(key3, value)
      }
    }

    if (sigunguNoSpace) {
      const key4 = sigunguNoSpace
      if (!regionLookupMap.has(key4)) {
        regionLookupMap.set(key4, value)
      }
    }

    if (sido === '세종특별자치시' && eupmyeondongNoSpace && !sigunguNoSpace) {
      const sejongKey = ('세종특별자치시' + '세종시' + eupmyeondongNoSpace).replace(/ /g, '')
      if (!regionLookupMap.has(sejongKey)) {
        regionLookupMap.set(sejongKey, value)
      }
    }
  })

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
    initMap(37.566826, 126.9786567)
  }
})

onBeforeUnmount(() => {
  if (map) {
    map = null
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

        // 전체 이름으로 조회 후, 실패 시 '동'을 제외한 상위 지역으로 재조회
        let searchKey = regionName.replace(/ /g, '')
        let foundData = regionLookupMap.get(searchKey)

        if (!foundData) {
          const parts = regionName.split(' ')
          if (parts.length > 1) {
            const truncatedRegionName = parts.slice(0, -1).join(' ')
            searchKey = truncatedRegionName.replace(/ /g, '')
            foundData = regionLookupMap.get(searchKey)
          }
        }

        if (foundData) {
          const finalFilterString = [foundData.sido, foundData.sigungu].filter(Boolean).join(' ')
          currentRegionQuery = finalFilterString
          selectedRegionName.value = finalFilterString

          try {
            const response = await fetchHotPostsByRegion(finalFilterString, 3)
            sheetPosts.value = response.data
            isSheetOpen.value = true
          } catch (error) {
            console.error(
              `Failed to fetch hot posts for region: "${finalFilterString}". Error:`,
              error,
            )
            sheetPosts.value = []
            isSheetOpen.value = true
          }
        } else {
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

const handlePostSelect = (postId) => {
  boardStore.setLocalFilter({ region: currentRegionQuery, page: 1 })
  router.push({ name: 'postDetail', params: { postId: postId } })
}
</script>

<style scoped>
#map {
  width: 100%;
  height: calc(100vh - 120px);
}
</style>
