import { type ReactNode, useRef } from 'react'
import { motion, useInView, type Variant } from 'framer-motion'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  variants?: Record<string, unknown>
  delay?: number
}

export default function AnimatedSection({
  children,
  className = '',
  variants,
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const defaultVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={(variants as Record<string, Variant>) || defaultVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}
