<template>
  <main class="app">
    <!-- <h1>{{ title }}</h1> -->
    <div class="grid__Wrapper">
      <div class="grid">

      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Tetris, Size } from '@/ts/tetris'

onMounted(() => {
  const grid = document.querySelector('.grid')
  if (grid) {
    new Tetris(Size.Medium, grid as HTMLElement)
  }
})
</script>

<style scoped lang="scss">
@use '@/scss/variables' as *;

.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-color;
}
</style>
