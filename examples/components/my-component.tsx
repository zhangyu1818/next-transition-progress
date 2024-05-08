'use client'
import { startTransition, useState } from 'react'
import { useProgress } from 'next-transition-progress'

export default function MyComponent() {
  const progress = useProgress()
  const [count, setCount] = useState(0)
  return (
    <>
      <p className='mb-4'>
        Current count: <span className='font-bold'>{count}</span>
      </p>
      <button
        onClick={() => {
          progress.start()
          startTransition(async () => {
            progress.done()
            // Introduces artificial slowdown
            await new Promise((resolve) => setTimeout(resolve, 2000))
            setCount((count) => count + 1)
          })
        }}
      >
        Trigger artificially slow transition
      </button>
    </>
  )
}
