<template>
  <div class="card-manager">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p class="text-gray-600 dark:text-gray-300 mt-1">
            Manage your cards and customize your layout
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Theme Toggle -->
          <button
            class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleTheme"
          >
            <Icon :name="isDarkMode ? 'heroicons:sun' : 'heroicons:moon'" class="w-5 h-5" />
          </button>

          <!-- Add Card Button -->
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
            @click="showAddCardModal = true"
          >
            <Icon name="heroicons:plus" class="w-4 h-4" />
            <span>Add Card</span>
          </button>

          <!-- More Actions Dropdown -->
          <div class="relative">
            <button
              ref="dropdownButton"
              class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              :aria-label="showDropdown ? 'Close menu' : 'Open menu'"
              @click="toggleDropdown"
            >
              <Icon name="heroicons:ellipsis-horizontal" class="w-5 h-5" />
            </button>

            <!-- Dropdown Menu -->
            <Transition name="dropdown">
              <div
                v-if="showDropdown"
                ref="dropdownMenu"
                class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
              >
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  @click="exportLayout"
                >
                  <Icon name="heroicons:arrow-up-tray" class="w-4 h-4" />
                  <span>Export Layout</span>
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  @click="showImportModal = true"
                >
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                  <span>Import Layout</span>
                </button>
                <hr class="my-1 border-gray-200 dark:border-gray-600" />
                <button
                  class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                  @click="showClearModal = true"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                  <span>Clear All Cards</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <Icon name="heroicons:squares-2x2" class="w-8 h-8 text-blue-600" />
            <div>
              <p class="text-2xl font-bold text-blue-600">{{ cardStore.cardCount }}</p>
              <p class="text-sm text-blue-600/70">Total Cards</p>
            </div>
          </div>
        </div>
        
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <Icon name="heroicons:clock" class="w-8 h-8 text-green-600" />
            <div>
              <p class="text-2xl font-bold text-green-600">{{ lastSaved }}</p>
              <p class="text-sm text-green-600/70">Last Saved</p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-purple-600" />
            <div>
              <p class="text-2xl font-bold text-purple-600">{{ gridCols }}</p>
              <p class="text-sm text-purple-600/70">Grid Columns</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Card Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddCardModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click="closeAddCardModal"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            @click.stop
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Card
            </h3>
            
            <form @submit.prevent="addCard">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    ref="titleInput"
                    v-model="newCardTitle"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter card title..."
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    v-model="newCardContent"
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white"
                    placeholder="Enter card content..."
                  />
                </div>
              </div>

              <div class="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  @click="closeAddCardModal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Import Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showImportModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click="closeImportModal"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            @click.stop
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Import Layout
            </h3>
            
            <form @submit.prevent="importLayout">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste JSON Data
                  </label>
                  <textarea
                    ref="importTextarea"
                    v-model="importData"
                    rows="6"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm dark:bg-gray-700 dark:text-white"
                    placeholder="Paste your exported layout data here..."
                    required
                  />
                </div>
                
                <div v-if="importError" class="text-red-600 dark:text-red-400 text-sm">
                  {{ importError }}
                </div>
              </div>

              <div class="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  @click="closeImportModal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Import
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Clear Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showClearModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click="closeClearModal"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            @click.stop
          >
            <div class="flex items-center space-x-3 mb-4">
              <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 text-red-600" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Clear All Cards
              </h3>
            </div>
            
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete all cards? This action cannot be undone.
            </p>

            <div class="flex justify-end space-x-3">
              <button
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                @click="closeClearModal"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                @click="clearAllCards"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useCardStore } from '~/stores/cards'

// Store
const cardStore = useCardStore()

// State
const showAddCardModal = ref(false)
const showImportModal = ref(false)
const showClearModal = ref(false)
const showDropdown = ref(false)
const newCardTitle = ref('')
const newCardContent = ref('')
const importData = ref('')
const importError = ref('')
const isDarkMode = ref(false)

// Template refs
const titleInput = ref<HTMLInputElement>()
const importTextarea = ref<HTMLTextAreaElement>()
const dropdownButton = ref<HTMLButtonElement>()
const dropdownMenu = ref<HTMLDivElement>()

// Computed properties
const lastSaved = computed(() => {
  // This would be updated when the store saves
  return 'Just now'
})

const gridCols = computed(() => {
  // This would be calculated based on screen size
  return 12
})

// Methods
const addCard = async () => {
  if (newCardTitle.value.trim()) {
    cardStore.addCard(newCardTitle.value.trim(), newCardContent.value.trim())
    closeAddCardModal()
  }
}

const closeAddCardModal = () => {
  showAddCardModal.value = false
  newCardTitle.value = ''
  newCardContent.value = ''
}

const exportLayout = () => {
  const data = cardStore.exportData()
  const jsonString = JSON.stringify(data, null, 2)
  
  // Create and trigger download
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dashboard-layout-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  showDropdown.value = false
}

const importLayout = () => {
  try {
    const data = JSON.parse(importData.value)
    if (data.cards && data.layout) {
      cardStore.importData(data)
      closeImportModal()
    } else {
      importError.value = 'Invalid format. Please ensure the JSON contains "cards" and "layout" properties.'
    }
  } catch (error) {
    importError.value = 'Invalid JSON format. Please check your data and try again.'
  }
}

const closeImportModal = () => {
  showImportModal.value = false
  importData.value = ''
  importError.value = ''
}

const clearAllCards = () => {
  cardStore.clearAll()
  closeClearModal()
}

const closeClearModal = () => {
  showClearModal.value = false
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  // In a real app, this would update a global theme store or use a composable
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = (event: Event) => {
  if (!dropdownButton.value?.contains(event.target as Node) && 
      !dropdownMenu.value?.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

// Focus management
watch(showAddCardModal, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    titleInput.value?.focus()
  }
})

watch(showImportModal, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    importTextarea.value?.focus()
  }
})

// Lifecycle
onMounted(() => {
  // Initialize theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  } else {
    // Respect system preference
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

// Keyboard shortcuts
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'n':
        event.preventDefault()
        showAddCardModal.value = true
        break
      case 'e':
        event.preventDefault()
        exportLayout()
        break
      case 'i':
        event.preventDefault()
        showImportModal.value = true
        break
    }
  }
  
  if (event.key === 'Escape') {
    showDropdown.value = false
    if (showAddCardModal.value) closeAddCardModal()
    if (showImportModal.value) closeImportModal()
    if (showClearModal.value) closeClearModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>

<style scoped>
/* Transition animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9) translateY(-20px);
}

/* Dark mode improvements */
@media (prefers-color-scheme: dark) {
  .card-manager {
    color-scheme: dark;
  }
}

/* Focus improvements for accessibility */
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
