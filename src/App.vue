<template>
  <main class="game" :class="themeClass">
    <div class="game__layout">
      <div class="game__arena">
        <div ref="boardHost" class="game__board-host"></div>

        <div v-if="showStart" class="game__overlay game__overlay--start">
          <button class="game__btn" type="button" @click="startGame">
            Начать игру
          </button>
        </div>

        <div v-if="showGameOver" class="game__overlay game__overlay--game-over">
          <h2 class="game__title">Game Over</h2>
          <button class="game__btn" type="button" @click="restartToMenu">
            Рестарт
          </button>
        </div>
      </div>

      <aside class="game__themes">
        <div class="game__themes-label">Стиль</div>
        <button
          v-for="theme in THEMES"
          :key="theme.id"
          type="button"
          class="game__theme-btn"
          :class="{ 'game__theme-btn--active': activeTheme === theme.id }"
          @click="activeTheme = theme.id"
        >
          {{ theme.label }}
        </button>
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import {
  DEFAULT_THEME,
  isThemeId,
  THEME_STORAGE_KEY,
  THEMES,
  type ThemeId,
} from '@/constants/themes'
import { Size, Tetris } from '@/ts/tetris'

const boardHost = ref<HTMLElement | null>(null)
const showStart = ref(true)
const showGameOver = ref(false)

const storedTheme = useLocalStorage<ThemeId>(THEME_STORAGE_KEY, DEFAULT_THEME)
const activeTheme = computed<ThemeId>({
  get: () => (isThemeId(storedTheme.value) ? storedTheme.value : DEFAULT_THEME),
  set: (value) => { storedTheme.value = value },
})

const themeClass = computed(() => `game--theme-${activeTheme.value}`)

let tetris: Tetris | null = null

onMounted(() => {
  if (!boardHost.value) return

  tetris = new Tetris(Size.Medium, boardHost.value, {
    onGameOver: () => {
      showGameOver.value = true
    },
  })
})

function startGame(): void {
  showStart.value = false
  showGameOver.value = false
  tetris?.startGame()
}

function restartToMenu(): void {
  tetris?.reset()
  showGameOver.value = false
  showStart.value = true
}
</script>
