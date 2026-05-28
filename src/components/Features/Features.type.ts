import type { ReactNode } from 'react'

export interface FeatureItem {
  key: string
  title: string
  description: string
  icon: ReactNode
  videoSrc?: string
  thumbnailSrc?: string
}

export interface FeaturesProps {
  onRequestAccess: () => void
  showAll?: boolean
  hideIntro?: boolean
}
