import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const data = ref(read()) as Ref<T>

  watch(
    data,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    { deep: true },
  )

  return data
}
