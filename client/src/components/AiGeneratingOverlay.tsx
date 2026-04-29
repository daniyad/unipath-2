import { useEffect, useState } from 'react'
import styles from './AiGeneratingOverlay.module.css'

interface Props {
  visible: boolean
  messages: string[]
}

export function AiGeneratingOverlay({ visible, messages }: Props) {
  const [index, setIndex] = useState(0)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!visible) {
      setIndex(0)
      setSlow(false)
      return
    }

    const cycleInterval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 4000)

    const slowTimeout = setTimeout(() => setSlow(true), 45000)

    return () => {
      clearInterval(cycleInterval)
      clearTimeout(slowTimeout)
    }
  }, [visible, messages.length])

  if (!visible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.dotsRow}>
          <span className={`${styles.dot} ${styles.dot1}`} />
          <span className={`${styles.dot} ${styles.dot2}`} />
          <span className={`${styles.dot} ${styles.dot3}`} />
        </div>
        <p className={styles.message}>
          {slow ? 'Still working — almost there...' : messages[index]}
        </p>
        <p className={styles.warning}>Please don&apos;t close this tab.</p>
      </div>
    </div>
  )
}
