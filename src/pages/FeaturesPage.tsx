import { Box } from '@chakra-ui/react'
import { Features } from '../components/Features/Features'
import { VideoDemo } from '../components/VideoDemo/VideoDemo'
import { CTABanner } from '../components/CTABanner/CTABanner'
import { PageHeader } from '../components/UI/PageHeader/PageHeader'
import { useTranslation } from '../hooks/useTranslation'

interface FeaturesPageProps {
  onRequestAccess: () => void
}

export function FeaturesPage({ onRequestAccess }: FeaturesPageProps) {
  const { t } = useTranslation()

  return (
    <Box>
      <Box h="68px" />
      <PageHeader
        badge={t.features.badge}
        headline={t.features.headline}
      />
      <Features onRequestAccess={onRequestAccess} showAll hideIntro />
      <VideoDemo onRequestAccess={onRequestAccess} />
      <CTABanner onRequestAccess={onRequestAccess} />
    </Box>
  )
}
