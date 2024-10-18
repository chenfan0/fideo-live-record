import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'

import { useConfettiStore } from '@renderer/store/useConfettiStore'

export default function Confetti() {
  const { width, height } = useWindowSize()
  const { showConfetti, numberOfPieces } = useConfettiStore()

  return (
    <div className="z-[9999]  absolute top-0">
      {showConfetti && <ReactConfetti width={width} height={height} numberOfPieces={300} />}
    </div>
  )
}
