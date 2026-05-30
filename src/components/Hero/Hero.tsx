import { Box, Grid, Text, HStack, VStack, chakra } from '@chakra-ui/react'

const Img = chakra('img')
import { Play } from 'lucide-react'
import { AppButton } from '../UI/AppButton/AppButton'
import { AppBadge } from '../UI/AppBadge/AppBadge'
import { useTranslation } from '../../hooks/useTranslation'
import { useScrollAnimationGroup } from '../../hooks/useScrollAnimation'
import { MEDIA } from '../../constants/media'
import { HERO_TOKENS } from './Hero.token'
import type { HeroProps } from './Hero.type'

export function Hero({ onRequestAccess, onWatchDemo }: HeroProps) {
  const { t } = useTranslation()
  const groupRef = useScrollAnimationGroup<HTMLDivElement>()

  return (
    <Box
      as="section"
      minH={HERO_TOKENS.minHeight}
      display="flex"
      alignItems="center"
      pt="68px"
      bg="white"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset="0"
        style={{ background: HERO_TOKENS.gradientBg }}
        pointerEvents="none"
        aria-hidden
      />

      <Box maxW="1200px" mx="auto" px={{ base: '20px', md: '40px', lg: '60px' }} w="full">
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={{ base: '12', lg: '16' }}
          alignItems="center"
          py={{ base: '14', md: '20' }}
        >
          <Box ref={groupRef}>
            <Box className="animate-fade-up">
              <AppBadge variant={HERO_TOKENS.badgeVariant}>{t.hero.badge}</AppBadge>
            </Box>

            <Text
              as="h1"
              mt="5"
              fontSize={HERO_TOKENS.headlineSizes}
              fontWeight={HERO_TOKENS.headlineFontWeight}
              lineHeight={HERO_TOKENS.headlineLineHeight}
              color="gray.900"
              letterSpacing="-0.02em"
              className="animate-fade-up animate-delay-1"
            >
              {t.hero.headline}
            </Text>

            <Text
              mt="6"
              fontSize={HERO_TOKENS.subheadlineSizes}
              color={HERO_TOKENS.subheadlineColor}
              lineHeight="1.75"
              maxW={HERO_TOKENS.subheadlineMaxW}
              className="animate-fade-up animate-delay-2"
            >
              {t.hero.subheadline}
            </Text>

            <HStack
              mt="8"
              gap="3"
              flexWrap="wrap"
              className="animate-fade-up animate-delay-3"
            >
              <AppButton
                label={t.hero.primaryCta}
                variant="primary"
                size="lg"
                onClick={onRequestAccess}
              />
              <AppButton
                label={t.hero.secondaryCta}
                variant="outline"
                size="lg"
                onClick={onWatchDemo}
                leftIcon={<Play size={16} />}
              />
            </HStack>

            <HStack
              mt="12"
              gap="8"
              className="animate-fade-up animate-delay-4"
              flexWrap="wrap"
            >
              {[
                { value: '50+', label: t.hero.stats.clinics },
                { value: '10K+', label: t.hero.stats.appointments },
                { value: '99.9%', label: t.hero.stats.uptime },
              ].map((stat) => (
                <VStack key={stat.label} align="start" gap="0">
                  <Text fontSize="1.75rem" fontWeight="700" color="teal.700" lineHeight="1">
                    {stat.value}
                  </Text>
                  <Text fontSize="13px" color="gray.500" mt="1">
                    {stat.label}
                  </Text>
                </VStack>
              ))}
            </HStack>
          </Box>

          <Box
            display={{ base: 'none', lg: 'block' }}
            className="animate-fade-in animate-delay-2"
          >
            <Box
              borderRadius={HERO_TOKENS.mockupBorderRadius}
              overflow="hidden"
              style={{ boxShadow: HERO_TOKENS.mockupShadow }}
              border="1px solid"
              borderColor="gray.100"
            >
              {MEDIA.hero.mockup ? (
                <Img
                  src={MEDIA.hero.mockup}
                  alt="Ikseer Health platform interface"
                  w="full"
                  display="block"
                />
              ) : (
                <MockupPlaceholder />
              )}
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}

function MockupPlaceholder() {
  return (
    <Box
      bg="gray.900"
      p="3"
      borderRadius="16px"
    >
      <Box
        bg="linear-gradient(135deg, #0D98AA 0%, #085E6B 100%)"
        borderRadius="10px"
        h="380px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="40px"
          bg="rgba(255,255,255,0.08)"
          display="flex"
          alignItems="center"
          px="4"
          gap="2"
        >
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <Box key={c} w="10px" h="10px" borderRadius="full" bg={c} />
          ))}
        </Box>
        <VStack gap="3" opacity={0.6}>
          <Img src={MEDIA.logo} alt="" h="48px" />
          <Text color="white" fontSize="14px" fontWeight="500">
            Ikseer Health
          </Text>
        </VStack>
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            position="absolute"
            bottom={`${24 + i * 44}px`}
            left="16px"
            right="16px"
            h="32px"
            bg="rgba(255,255,255,0.07)"
            borderRadius="6px"
          />
        ))}
      </Box>
    </Box>
  )
}
