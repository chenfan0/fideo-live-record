import { create } from 'zustand'

interface ConfettiStore {
  showConfetti: boolean
  numberOfPieces: number
  setShowConfetti: (showConfetti: boolean) => void
  setNumberOfPieces: (numberOfPieces: number) => void
}

export const useConfettiStore = create<ConfettiStore>((set) => ({
  showConfetti: false,
  numberOfPieces: 500,
  setShowConfetti: (showConfetti) => {
    set({ showConfetti })
    let numberOfPieces = 500
    let timer: NodeJS.Timeout
    if (showConfetti) {
      timer = setInterval(() => {
        numberOfPieces -= 10
        set({ numberOfPieces })
        if (numberOfPieces <= 0) {
          clearInterval(timer)
          set({ showConfetti: false, numberOfPieces: 500 })
        }
      }, 100)
    }
  },
  setNumberOfPieces: (numberOfPieces) => set({ numberOfPieces })
}))
