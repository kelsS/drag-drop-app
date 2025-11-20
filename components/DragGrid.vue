<template>
  <div class="drag-grid-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="cardStore.cardCount === 0" class="empty-state">
      <div class="text-center py-16">
        <Icon name="heroicons:squares-2x2" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No cards yet</h3>
        <p class="text-gray-500 mb-6">Create your first card to get started</p>
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          @click="addNewCard"
        >
          <Icon name="heroicons:plus" class="w-4 h-4 inline mr-2" />
          Add Your First Card
        </button>
      </div>
    </div>

    <!-- Grid Layout -->
    <ClientOnly>
      <template #default>
        <div v-if="!isLoading && cardStore.cardCount > 0" class="simple-grid">
          <div 
            v-for="card in cardStore.cards" 
            :key="card.id"
            class="grid-item-simple"
          >
            <DragCard :card="card" />
          </div>
        </div>
      </template>
      
      <template #fallback>
        <div class="flex items-center justify-center h-64">
          <div class="text-center">
            <div class="animate-pulse rounded-lg bg-gray-200 h-32 w-48 mx-auto mb-4"></div>
            <p class="text-gray-600">Initializing grid layout...</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Grid Controls -->
    <div v-if="!isLoading && cardStore.cardCount > 0" class="grid-controls">
      <div class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-6">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Grid Lock
            </label>
            <button
              :class="lockClasses"
              :aria-label="isDraggable ? 'Lock grid layout' : 'Unlock grid layout'"
              @click="toggleLock"
            >
              <Icon :name="isDraggable ? 'heroicons:lock-open' : 'heroicons:lock-closed'" class="w-4 h-4" />
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Responsive
            </label>
            <button
              :class="responsiveClasses"
              :aria-label="isResponsive ? 'Disable responsive layout' : 'Enable responsive layout'"
              @click="toggleResponsive"
            >
              <Icon name="heroicons:device-phone-mobile" class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ cardStore.cardCount }} {{ cardStore.cardCount === 1 ? 'card' : 'cards' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout-v3'
import { useCardStore, type GridLayout as GridLayoutType } from '~/stores/cards'

// Store
const cardStore = useCardStore()

// State
const isLoading = ref(true)
const isDraggable = ref(true)
const isResizable = ref(true)
const isResponsive = ref(true)
const draggingItem = ref<string | null>(null)
const isDropTarget = ref(false)

// Grid configuration
const rowHeight = ref(60)
const colNum = ref(12)

// Responsive breakpoints
const breakpoints = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
}

const responsiveCols = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
}

// Computed properties
const layoutData = computed(() => cardStore.layoutData)

const lockClasses = computed(() => [
  'p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
  {
    'bg-red-100 text-red-600 hover:bg-red-200': !isDraggable.value,
    'bg-green-100 text-green-600 hover:bg-green-200': isDraggable.value
  }
])

const responsiveClasses = computed(() => [
  'p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
  {
    'bg-blue-100 text-blue-600 hover:bg-blue-200': isResponsive.value,
    'bg-gray-100 text-gray-600 hover:bg-gray-200': !isResponsive.value
  }
])

// Methods
const getCardById = (id: string) => {
  return cardStore.cards.find(card => card.id === id)
}

const addNewCard = () => {
  cardStore.addCard('New Card', 'Click to edit this card content...')
}

const toggleLock = () => {
  isDraggable.value = !isDraggable.value
  // Also toggle resize when locking
  isResizable.value = isDraggable.value
}

const toggleResponsive = () => {
  isResponsive.value = !isResponsive.value
}

// Event handlers
const onLayoutUpdate = (newLayout: GridLayoutType[]) => {
  cardStore.updateLayout(newLayout)
}

const onLayoutReady = () => {
  console.log('Grid layout is ready')
}

const onItemResize = (i: string, newH: number, newW: number, newHPx: number, newWPx: number) => {
  console.log(`Resizing item ${i}: ${newW}x${newH} (${newWPx}x${newHPx}px)`)
}

const onItemMove = (i: string, newX: number, newY: number) => {
  draggingItem.value = i
  isDropTarget.value = true
}

const onItemMoved = (i: string, newX: number, newY: number) => {
  console.log(`Moved item ${i} to ${newX}, ${newY}`)
  draggingItem.value = null
  isDropTarget.value = false
}

const onItemResized = (i: string, newH: number, newW: number, newHPx: number, newWPx: number) => {
  console.log(`Resized item ${i}: ${newW}x${newH} (${newWPx}x${newHPx}px)`)
}

const onCardMouseDown = (cardId: string) => {
  draggingItem.value = cardId
}

const onCardTouchStart = (cardId: string) => {
  draggingItem.value = cardId
}

// Lifecycle
onMounted(async () => {
  // Simulate loading time for smooth UX
  await new Promise(resolve => setTimeout(resolve, 500))
  isLoading.value = false
  
  // Initialize with default cards if none exist
  await nextTick()
  if (cardStore.cardCount === 0) {
    // The store will automatically create default cards
  }
})

// Auto-save functionality
let saveTimeout: NodeJS.Timeout | null = null
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    cardStore.saveToLocalStorage()
  }, 1000)
}

// Watch for layout changes
watch(layoutData, () => {
  debouncedSave()
}, { deep: true })

// Keyboard shortcuts
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'n':
        event.preventDefault()
        addNewCard()
        break
      case 'l':
        event.preventDefault()
        toggleLock()
        break
      case 'r':
        event.preventDefault()
        toggleResponsive()
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts)
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
})
</script>

<style scoped>
.drag-grid-container {
  @apply w-full min-h-screen bg-gray-50 dark:bg-gray-900;
}

.simple-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4;
}

.grid-item-simple {
  @apply h-64;
}

.grid-layout {
  @apply w-full;
}

.grid-item {
  @apply transition-all duration-200 ease-out;
}

.grid-item-dragging {
  @apply opacity-80 transform scale-105;
}

.empty-state {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 m-4;
}

.grid-controls {
  @apply sticky bottom-4 mx-4;
}

/* Animation improvements */
.grid-item {
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease !important;
}

.grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-layout {
    @apply px-2;
  }
  
  .grid-controls {
    @apply mx-2;
  }
}

/* Dark mode improvements */
@media (prefers-color-scheme: dark) {
  .grid-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

/* Focus and accessibility */
.grid-item:focus-within {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

/* Loading animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
