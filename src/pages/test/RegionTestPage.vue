<template>
  <div class="region-test-page">
    <h1>지역 드롭다운 테스트 페이지</h1>
    <p>아래 드롭다운을 사용하여 시/도, 시/군/구, 읍/면/동을 선택해보세요.</p>
    <p>console을 통해 어떤식으로 값이 들어가는지 확인 가능</p>
    <p>
      어떤 값이 선택되었는지만 골라주는 컴포넌트 (부모 페이지에서 그 값 어떻게 할건지 선택해야함)
      확인 버튼도 나중에 추가해서 사용하세용
    </p>

    <RegionDropdowns @update:region="handleRegionUpdate" />

    <!-- 선택된 지역 정보를 표시하는 부분 -->
    <div v-if="selectedRegion" class="selected-info">
      <h2>선택된 지역 정보:</h2>
      <p><strong>시/도:</strong> {{ selectedRegion.sido }}</p>
      <p><strong>시/군/구:</strong> {{ selectedRegion.gugun }}</p>
      <p><strong>읍/면/동:</strong> {{ selectedRegion.dong }}</p>
    </div>
    <div v-else class="selected-info">
      <p>아직 선택된 지역이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RegionDropdowns from '@/components/common/RegionDropdowns.vue'

const selectedRegion = ref(null)

/**
 * RegionDropdowns 컴포넌트에서 'update:region' 이벤트 발생 시 호출되는 함수
 * @param {object} region - 선택된 시/도, 시/군/구, 읍/면/동 정보를 담고 있는 객체
 */
const handleRegionUpdate = (region) => {
  console.log('RegionDropdowns에서 전달된 지역 정보:', region)
  // 전달받은 지역 정보를 selectedRegion 변수에 저장하여 화면에 표시
  selectedRegion.value = region
}
</script>

<style scoped lang="scss">
.region-test-page {
  padding: rem(20px);
}

h1 {
  color: #333;
  margin-bottom: rem(20px);
}

p {
  color: #555;
  margin-bottom: rem(20px);
}

.selected-info {
  margin-top: rem(30px);
  padding: rem(15px);
  border: rem(1px) solid #eee;
  border-radius: rem(8px);
  background-color: #f9f9f9;
}

.selected-info h2 {
  color: #007bff;
  margin-top: 0;
  margin-bottom: rem(10px);
}

.selected-info p {
  margin: rem(5px) 0;
  color: #333;
}
</style>
