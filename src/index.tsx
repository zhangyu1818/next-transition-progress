'use client'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/**
 * Internal context for the progress bar.
 */
const ProgressBarContext = createContext<ReturnType<
  typeof useProgressInternal
> | null>(null)

/**
 * Reads the progress bar context.
 */
function useProgressBarContext() {
  const progress = useContext(ProgressBarContext)

  if (progress === null) {
    throw new Error(
      'Make sure to use `ProgressBarProvider` before using the progress bar.',
    )
  }

  return progress
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * This function calculates a difference (`diff`) based on the input number (`current`).
 *
 * - If `current` is exactly 0, `diff` is set to 15.
 * - If `current` is less than 50 (but not 0), `diff` is set to a random number between 1 and 10.
 * - If `current` is 50 or more, `diff` is set to a random number between 1 and 5.
 */
function getDiff(
  /** The current number used to calculate the difference. */
  current: number,
): number {
  let diff: number
  if (current === 0) {
    diff = 15
  } else if (current < 50) {
    diff = random(1, 10)
  } else {
    diff = random(1, 5)
  }

  return diff
}

type ProgressState = 'initial' | 'in-progress' | 'completing' | 'complete'

/**
 * Custom hook for managing progress state and animation.
 * @returns An object containing the current state, spring animation, and functions to start and complete the progress.
 */
export function useProgressInternal() {
  const [state, setState] = useState<ProgressState>('initial')
  const [value, setValue] = useState(0)

  useInterval(
    () => {
      let currentValue = value

      setValue(Math.min(currentValue + getDiff(currentValue), 99))
    },
    state === 'in-progress' ? 750 : null,
  )

  useEffect(() => {
    if (state === 'initial') {
      setValue(0)
    } else if (state === 'completing') {
      setValue(100)
    }
  }, [state])

  useEffect(() => {
    if (value === 100) {
      setState('complete')
    }
  }, [value])

  /**
   * Start the progress.
   */
  function start() {
    if (state === 'complete') {
      setValue(0)
    }
    setState('in-progress')
  }

  function done() {
    setState(
      state === 'initial' || state === 'in-progress' ? 'completing' : state,
    )
  }

  return { state, value, start, done }
}

/**
 * Custom hook that sets up an interval to call the provided callback function.
 *
 * @param callback - The function to be called at each interval.
 * @param delay - The delay (in milliseconds) between each interval. Pass `null` to stop the interval.
 */
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      savedCallback.current()
    }

    if (delay !== null) {
      tick()

      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

/**
 * Provides the progress value to the child components.
 *
 * @param children - The child components to render.
 * @returns The rendered ProgressBarContext.Provider component.
 */
export function ProgressBarProvider({ children }: { children: ReactNode }) {
  const progress = useProgressInternal()
  return (
    <ProgressBarContext.Provider value={progress}>
      {children}
    </ProgressBarContext.Provider>
  )
}

/**
 * Renders a progress bar component.
 *
 * @param className - The CSS class name for the progress bar.
 * @returns The rendered progress bar component.
 */
export function ProgressBar({ className }: { className: string }) {
  const progress = useProgressBarContext()
  const width = `${progress.value}%`

  return (
    <div data-state={progress.state} style={{ width }} className={className} />
  )
}

/**
 * A custom hook that returns a function to start the progress. Call the start function in a transition to track it.
 *
 * @returns The function to start the progress. Call this function in a transition to track it.
 */
export function useProgress() {
  const progress = useProgressBarContext()

  return {
    start: progress.start,
    done: progress.done,
  }
}
