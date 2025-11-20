<template>
  <div class="app-container">
    <!-- Page Header with Card Manager -->
    <CardManager />
    
    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Drag and Drop Grid -->
      <DragGrid />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center space-x-4">
            <span>&copy; 2024 Drag & Drop Dashboard</span>
            <span class="hidden md:inline">•</span>
            <span class="hidden md:inline">Built with Vue 3 & Nuxt 3</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Keyboard Shortcuts Info -->
            <button
              class="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              @click="showKeyboardShortcuts = !showKeyboardShortcuts"
            >
              <Icon name="heroicons:keyboard" class="w-4 h-4" />
              <span class="hidden sm:inline">Shortcuts</span>
            </button>
            
            <!-- Status Indicator -->
            <div class="flex items-center space-x-2">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                ]"
              />
              <span class="hidden sm:inline">
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Keyboard Shortcuts Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showKeyboardShortcuts"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click="showKeyboardShortcuts = false"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            @click.stop
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <button
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="showKeyboardShortcuts = false"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">Add new card</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+N</kbd>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">Export layout</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+E</kbd>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">Import layout</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+I</kbd>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">Toggle grid lock</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+L</kbd>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                <span class="text-sm text-gray-700 dark:text-gray-300">Toggle responsive</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+R</kbd>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm text-gray-700 dark:text-gray-300">Close dialogs</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Notification Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="notification"
          class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        >
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
          <span>{{ notification }}</span>
        </div>
      </Transition>
    </Teleport>

    <!-- PWA Install Prompt (if supported) -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div
          v-if="showPwaPrompt"
          class="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50"
        >
          <div class="flex items-start space-x-3">
            <Icon name="heroicons:device-phone-mobile" class="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <h4 class="font-medium mb-1">Install App</h4>
              <p class="text-sm text-blue-100 mb-3">
                Add this dashboard to your home screen for quick access.
              </p>
              <div class="flex space-x-2">
                <button
                  class="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm font-medium transition-colors"
                  @click="installPwa"
                >
                  Install
                </button>
                <button
                  class="px-3 py-1 bg-transparent border border-blue-300 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                  @click="dismissPwaPrompt"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            <button
              class="text-blue-200 hover:text-white"
              @click="dismissPwaPrompt"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCardStore } from '~/stores/cards'

// SEO Meta
useHead({
  title: 'Drag & Drop Dashboard',
  meta: [
    { 
      name: 'description', 
      content: 'A modern drag and drop dashboard built with Vue 3 and Nuxt 3. Organize your content with customizable cards and responsive layouts.' 
    },
    { name: 'keywords', content: 'drag and drop, dashboard, Vue 3, Nuxt 3, grid layout, cards' },
    { name: 'author', content: 'Drag Drop Dashboard' },
    { property: 'og:title', content: 'Drag & Drop Dashboard' },
    { property: 'og:description', content: 'Modern drag and drop dashboard application' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'theme-color', content: '#3b82f6' },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'manifest', href: '/manifest.json' }
  ]
})

// Store
const cardStore = useCardStore()

// State
const showKeyboardShortcuts = ref(false)
const notification = ref('')
const isOnline = ref(true)
const showPwaPrompt = ref(false)
const deferredPrompt = ref<any>(null)

// PWA functionality
const installPwa = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      showNotification('App installed successfully!')
    }
    
    deferredPrompt.value = null
    showPwaPrompt.value = false
  }
}

const dismissPwaPrompt = () => {
  showPwaPrompt.value = false
  localStorage.setItem('pwa-dismissed', 'true')
}

// Notifications
const showNotification = (message: string, duration = 3000) => {
  notification.value = message
  setTimeout(() => {
    notification.value = ''
  }, duration)
}

// Network status
const updateOnlineStatus = () => {
  const wasOnline = isOnline.value
  isOnline.value = navigator.onLine
  
  if (!wasOnline && isOnline.value) {
    showNotification('Back online!')
  } else if (wasOnline && !isOnline.value) {
    showNotification('Working offline')
  }
}

// Error handling
const handleError = (error: Error) => {
  console.error('Application error:', error)
  showNotification('Something went wrong. Please try again.', 5000)
}

// Lifecycle
onMounted(() => {
  // PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    
    // Show prompt if not previously dismissed
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (!dismissed) {
      setTimeout(() => {
        showPwaPrompt.value = true
      }, 10000) // Show after 10 seconds
    }
  })

  // Network status monitoring
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // Global error handling
  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', (e) => handleError(new Error(e.reason)))

  // Initialize app state
  updateOnlineStatus()
  
  // Show welcome notification for new users
  if (cardStore.cardCount === 0) {
    setTimeout(() => {
      showNotification('Welcome! Create your first card to get started.', 5000)
    }, 2000)
  }
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  window.removeEventListener('error', handleError)
  window.removeEventListener('unhandledrejection', (e) => handleError(new Error(e.reason)))
})

// Keyboard shortcuts (global)
const handleGlobalKeyboardShortcuts = (event: KeyboardEvent) => {
  // Only handle if not focused on input elements
  const activeElement = document.activeElement
  const isInputFocused = activeElement?.tagName === 'INPUT' || 
                        activeElement?.tagName === 'TEXTAREA' ||
                        activeElement?.contentEditable === 'true'
  
  if (!isInputFocused) {
    switch (event.key) {
      case '?':
        event.preventDefault()
        showKeyboardShortcuts.value = true
        break
      case 'h':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault()
          showKeyboardShortcuts.value = true
        }
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyboardShortcuts)
})

// Expose global methods for debugging in development
if (process.dev) {
  ;(window as any).cardStore = cardStore
  ;(window as any).showNotification = showNotification
}
</script>

<style scoped>
.app-container {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200;
}

.main-content {
  @apply flex-1;
}

.app-footer {
  @apply bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200;
}

/* Transition animations */
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Keyboard shortcut styles */
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus improvements */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading and error states */
.loading-skeleton {
  @apply animate-pulse bg-gray-200 dark:bg-gray-700 rounded;
}

/* Print styles */
@media print {
  .app-footer,
  .grid-controls {
    display: none !important;
  }
  
  .drag-card {
    break-inside: avoid;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
