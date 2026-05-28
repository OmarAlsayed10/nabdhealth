import { Box } from '@chakra-ui/react'
import { About } from '../components/About/About'
import { CTABanner } from '../components/CTABanner/CTABanner'
import { PageHeader } from '../components/UI/PageHeader/PageHeader'
import { useTranslation } from '../hooks/useTranslation'

interface AboutPageProps {
  onRequestAccess: () => void
}

export function AboutPage({ onRequestAccess }: AboutPageProps) {
  const { t } = useTranslation()

  return (
    <Box>
      <Box h="68px" />
      <PageHeader
        badge={t.about.badge}
        headline={t.about.headline}
        align="left"
      />
      <About hideIntro />
      <CTABanner onRequestAccess={onRequestAccess} />
    </Box>
  )
}
