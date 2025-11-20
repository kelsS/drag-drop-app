import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CardData {
  id: string
  title: string
  content: string
  x: number
  y: number
  w: number
  h: number
  i: string
}

export interface GridLayout {
  i: string
  x: number
  y: number
  w: number
  h: number
}

export const useCardStore = defineStore('cards', () => {
  // State
  const cards = ref<CardData[]>([])
  const layout = ref<GridLayout[]>([])
  const nextId = ref(1)

  // Getters
  const cardCount = computed(() => cards.value.length)
  const layoutData = computed(() => layout.value)

  // Actions
  const addCard = (title: string = 'New Card', content: string = 'Click to edit') => {
    const id = `card-${nextId.value++}`
    const newCard: CardData = {
      id,
      title,
      content,
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      i: id
    }
    
    cards.value.push(newCard)
    layout.value.push({
      i: id,
      x: newCard.x,
      y: newCard.y,
      w: newCard.w,
      h: newCard.h
    })
    
    saveToLocalStorage()
    return newCard
  }

  const updateCard = (id: string, updates: Partial<Omit<CardData, 'id' | 'i'>>) => {
    const cardIndex = cards.value.findIndex(card => card.id === id)
    if (cardIndex !== -1) {
      cards.value[cardIndex] = { ...cards.value[cardIndex], ...updates }
      saveToLocalStorage()
    }
  }

  const deleteCard = (id: string) => {
    cards.value = cards.value.filter(card => card.id !== id)
    layout.value = layout.value.filter(item => item.i !== id)
    saveToLocalStorage()
  }

  const updateLayout = (newLayout: GridLayout[]) => {
    layout.value = newLayout
    
    // Update card positions
    newLayout.forEach(item => {
      const card = cards.value.find(card => card.id === item.i)
      if (card) {
        card.x = item.x
        card.y = item.y
        card.w = item.w
        card.h = item.h
      }
    })
    
    saveToLocalStorage()
  }

  const saveToLocalStorage = () => {
    if (process.client) {
      localStorage.setItem('drag-drop-cards', JSON.stringify(cards.value))
      localStorage.setItem('drag-drop-layout', JSON.stringify(layout.value))
    }
  }

  const loadFromLocalStorage = () => {
    if (process.client) {
      try {
        const savedCards = localStorage.getItem('drag-drop-cards')
        const savedLayout = localStorage.getItem('drag-drop-layout')
        
        if (savedCards) {
          cards.value = JSON.parse(savedCards)
          // Find the highest ID to continue numbering
          const maxId = cards.value.reduce((max, card) => {
            const num = parseInt(card.id.replace('card-', ''))
            return num > max ? num : max
          }, 0)
          nextId.value = maxId + 1
        }
        
        if (savedLayout) {
          layout.value = JSON.parse(savedLayout)
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error)
        // Initialize with default cards if loading fails
        initializeDefaultCards()
      }
    } else {
      // Initialize with default cards on server
      initializeDefaultCards()
    }
  }

  const initializeDefaultCards = () => {
    // Create some default cards if none exist
    if (cards.value.length === 0) {
      addCard('Welcome!', 'Welcome to your drag & drop dashboard. You can edit this card by clicking on it.')
      addCard('Getting Started', 'Drag cards around to reorganize your layout. Resize cards by dragging the corners.')
      addCard('Add New Cards', 'Use the + button to add new cards. You can customize the title and content of each card.')
    }
  }

  const clearAll = () => {
    cards.value = []
    layout.value = []
    nextId.value = 1
    saveToLocalStorage()
  }

  const exportData = () => {
    return {
      cards: cards.value,
      layout: layout.value
    }
  }

  const importData = (data: { cards: CardData[], layout: GridLayout[] }) => {
    cards.value = data.cards || []
    layout.value = data.layout || []
    
    if (cards.value.length > 0) {
      const maxId = cards.value.reduce((max, card) => {
        const num = parseInt(card.id.replace('card-', ''))
        return num > max ? num : max
      }, 0)
      nextId.value = maxId + 1
    }
    
    saveToLocalStorage()
  }

  // Initialize store
  loadFromLocalStorage()

  return {
    // State
    cards,
    layout,
    
    // Getters
    cardCount,
    layoutData,
    
    // Actions
    addCard,
    updateCard,
    deleteCard,
    updateLayout,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearAll,
    exportData,
    importData
  }
})
