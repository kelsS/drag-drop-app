<template>
  <div
    :class="cardClasses"
    :tabindex="0"
    role="article"
    :aria-label="`Card: ${card.title}`"
    @click="startEditing"
    @keydown="handleKeydown"
    @focus="onFocus"
    @blur="onBlur"
  >
    <!-- Card Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex-1">
        <input
          v-if="isEditingTitle"
          ref="titleInput"
          v-model="editTitle"
          class="w-full font-semibold text-lg bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
          :aria-label="`Edit title for card ${card.id}`"
          @blur="saveTitle"
          @keydown.enter="saveTitle"
          @keydown.escape="cancelTitleEdit"
        />
        <h3
          v-else
          class="font-semibold text-lg text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
          @click.stop="editTitle"
        >
          {{ card.title }}
        </h3>
      </div>
      
      <!-- Card Actions -->
      <div class="flex items-center space-x-2 ml-2">
        <button
          class="p-1 text-gray-400 hover:text-blue-600 focus:text-blue-600 focus:outline-none rounded transition-colors"
          :aria-label="`Edit card ${card.id}`"
          @click.stop="startEditing"
        >
          <Icon name="heroicons:pencil-square" class="w-4 h-4" />
        </button>
        <button
          class="p-1 text-gray-400 hover:text-red-600 focus:text-red-600 focus:outline-none rounded transition-colors"
          :aria-label="`Delete card ${card.id}`"
          @click.stop="deleteCard"
        >
          <Icon name="heroicons:trash" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Card Content -->
    <div class="flex-1">
      <textarea
        v-if="isEditingContent"
        ref="contentTextarea"
        v-model="editContent"
        class="w-full h-full min-h-[80px] bg-transparent border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none resize-none"
        :aria-label="`Edit content for card ${card.id}`"
        @blur="saveContent"
        @keydown.escape="cancelContentEdit"
        @keydown.ctrl.enter="saveContent"
      />
      <div
        v-else
        class="text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 transition-colors min-h-[80px]"
        @click.stop="editContent"
      >
        <p v-if="card.content" class="whitespace-pre-wrap">{{ card.content }}</p>
        <p v-else class="text-gray-400 italic">Click to add content...</p>
      </div>
    </div>

    <!-- Resize Handle (bottom-right corner) -->
    <div 
      class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
      :aria-label="`Resize card ${card.id}`"
    >
      <Icon name="heroicons:arrows-pointing-out" class="w-3 h-3 text-gray-400" />
    </div>

    <!-- Focus Indicator -->
    <div 
      v-show="isFocused"
      class="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded-lg"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useCardStore, type CardData } from '~/stores/cards'

interface Props {
  card: CardData
  isDragging?: boolean
}

const props = defineProps<Props>()

const cardStore = useCardStore()

// Editing state
const isEditingTitle = ref(false)
const isEditingContent = ref(false)
const editTitle = ref(props.card.title)
const editContent = ref(props.card.content)
const isFocused = ref(false)

// Template refs
const titleInput = ref<HTMLInputElement>()
const contentTextarea = ref<HTMLTextAreaElement>()

// Computed properties
const cardClasses = computed(() => [
  'drag-card',
  'relative',
  'h-full',
  'flex',
  'flex-col',
  {
    'dragging': props.isDragging,
    'ring-2': isFocused.value,
    'ring-blue-500': isFocused.value,
  }
])

// Watch for card updates
watch(() => props.card.title, (newTitle) => {
  editTitle.value = newTitle
})

watch(() => props.card.content, (newContent) => {
  editContent.value = newContent
})

// Methods
const startEditing = () => {
  if (!isEditingTitle.value && !isEditingContent.value) {
    editContent()
  }
}

const editTitle = async () => {
  isEditingTitle.value = true
  editTitle.value = props.card.title
  await nextTick()
  titleInput.value?.focus()
  titleInput.value?.select()
}

const saveTitle = () => {
  if (editTitle.value.trim() !== props.card.title) {
    cardStore.updateCard(props.card.id, { title: editTitle.value.trim() || 'Untitled' })
  }
  isEditingTitle.value = false
}

const cancelTitleEdit = () => {
  editTitle.value = props.card.title
  isEditingTitle.value = false
}

const editContent = async () => {
  isEditingContent.value = true
  editContent.value = props.card.content
  await nextTick()
  contentTextarea.value?.focus()
}

const saveContent = () => {
  if (editContent.value !== props.card.content) {
    cardStore.updateCard(props.card.id, { content: editContent.value })
  }
  isEditingContent.value = false
}

const cancelContentEdit = () => {
  editContent.value = props.card.content
  isEditingContent.value = false
}

const deleteCard = () => {
  if (confirm(`Are you sure you want to delete "${props.card.title}"?`)) {
    cardStore.deleteCard(props.card.id)
  }
}

const onFocus = () => {
  isFocused.value = true
}

const onBlur = () => {
  // Delay to allow clicking on child elements
  setTimeout(() => {
    if (!isEditingTitle.value && !isEditingContent.value) {
      isFocused.value = false
    }
  }, 100)
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      if (!isEditingTitle.value && !isEditingContent.value) {
        event.preventDefault()
        startEditing()
      }
      break
    case 'Delete':
    case 'Backspace':
      if (!isEditingTitle.value && !isEditingContent.value) {
        event.preventDefault()
        deleteCard()
      }
      break
    case 'Escape':
      if (isEditingTitle.value) {
        cancelTitleEdit()
      } else if (isEditingContent.value) {
        cancelContentEdit()
      }
      break
  }
}

// Expose methods for parent components
defineExpose({
  startEditing,
  editTitle,
  editContent
})
</script>

<style scoped>
.drag-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.drag-card:hover {
  transform: translateY(-1px);
}

.dragging {
  transform: rotate(2deg) scale(1.02);
  z-index: 1000;
}

/* Improve textarea appearance */
textarea {
  font-family: inherit;
  line-height: 1.5;
}

/* Custom scrollbar for webkit browsers */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
