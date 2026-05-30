import { Box } from '@chakra-ui/react'
import { Hero } from '../components/Hero/Hero'
import { Products } from '../components/Products/Products'
import { VideoDemo } from '../components/VideoDemo/VideoDemo'
import { Features } from '../components/Features/Features'
import { Pricing } from '../components/Pricing/Pricing'
import { CTABanner } from '../components/CTABanner/CTABanner'

interface HomeProps {
  onRequestAccess: () => void
  onContactSales: () => void
}

export function Home({ onRequestAccess, onContactSales }: HomeProps) {
  const scrollToClinic = () =>
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <Box>
      <Hero onRequestAccess={onRequestAccess} onWatchDemo={scrollToClinic} />
      <Products onExploreClinic={scrollToClinic} />
      <VideoDemo onRequestAccess={onRequestAccess} />
      <Features onRequestAccess={onRequestAccess} showAll={false} />
      <Pricing onRequestAccess={onRequestAccess} onContactSales={onContactSales} />
      <CTABanner onRequestAccess={onRequestAccess} />
    </Box>
  )
}
