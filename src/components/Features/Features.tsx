import { Box, Grid, Text, Flex, VStack, chakra } from '@chakra-ui/react'

const Img = chakra('img')
import {
  Users,
  Calendar,
  FileText,
  BarChart2,
  Shield,
  Lock,
} from 'lucide-react'
import { SectionWrapper } from '../UI/SectionWrapper/SectionWrapper'
import { AppBadge } from '../UI/AppBadge/AppBadge'
import { AppButton } from '../UI/AppButton/AppButton'
import { AppCard } from '../UI/AppCard/AppCard'
import { useTranslation } from '../../hooks/useTranslation'
import { useScrollAnimationGroup } from '../../hooks/useScrollAnimation'
import { MEDIA } from '../../constants/media'
import { FEATURES_TOKENS } from './Features.token'
import type { FeaturesProps } from './Features.type'

export function Features({ onRequestAccess, showAll = false, hideIntro = false }: FeaturesProps) {
  const { t } = useTranslation()
  const groupRef = useScrollAnimationGroup<HTMLDivElement>()

  const features = [
    {
      key: 'patients',
      title: t.features.items.patients.title,
      description: t.features.items.patients.description,
      icon: <Users size={20} />,
      videoSrc: MEDIA.features.patients.video,
      thumbnailSrc: MEDIA.features.patients.thumbnail,
    },
    {
      key: 'scheduling',
      title: t.features.items.scheduling.title,
      description: t.features.items.scheduling.description,
      icon: <Calendar size={20} />,
      videoSrc: MEDIA.features.scheduling.video,
      thumbnailSrc: MEDIA.features.scheduling.thumbnail,
    },
    {
      key: 'billing',
      title: t.features.items.billing.title,
      description: t.features.items.billing.description,
      icon: <FileText size={20} />,
      videoSrc: MEDIA.features.billing.video,
      thumbnailSrc: MEDIA.features.billing.thumbnail,
    },
    {
      key: 'reports',
      title: t.features.items.reports.title,
      description: t.features.items.reports.description,
      icon: <BarChart2 size={20} />,
      videoSrc: MEDIA.features.reports.video,
      thumbnailSrc: MEDIA.features.reports.thumbnail,
    },
    {
      key: 'staff',
      title: t.features.items.staff.title,
      description: t.features.items.staff.description,
      icon: <Shield size={20} />,
      videoSrc: MEDIA.features.staff.video,
      thumbnailSrc: MEDIA.features.staff.thumbnail,
    },
  ]

  return (
    <SectionWrapper background="white" id="features">
      <Box ref={groupRef}>
        {!hideIntro && (
          <Box textAlign="center" mb="12">
            <Box className="animate-fade-up">
              <AppBadge>{t.features.badge}</AppBadge>
            </Box>
            <Text
              as="h2"
              mt="4"
              fontSize={{ base: '1.875rem', md: '2.5rem' }}
              fontWeight="700"
              color="gray.900"
              letterSpacing="-0.02em"
              className="animate-fade-up animate-delay-1"
            >
              {t.features.headline}
            </Text>
            <Text
              mt="4"
              fontSize={{ base: '1rem', md: '1.125rem' }}
              color="gray.600"
              maxW="560px"
              mx="auto"
              className="animate-fade-up animate-delay-2"
            >
              {t.features.subheadline}
            </Text>
          </Box>
        )}

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
          gap="6"
        >
          {features.map((feature) => (
            <AppCard key={feature.key} variant="default" isHoverable className="animate-fade-up">
              <VStack align="start" gap="4">
                <Flex
                  w={FEATURES_TOKENS.iconSize}
                  h={FEATURES_TOKENS.iconSize}
                  align="center"
                  justify="center"
                  borderRadius={FEATURES_TOKENS.iconBorderRadius}
                  bg={FEATURES_TOKENS.iconBg}
                  color={FEATURES_TOKENS.iconColor}
                  flexShrink={0}
                >
                  {feature.icon}
                </Flex>

                <Box>
                  <Text fontSize="16px" fontWeight="600" color="gray.900" mb="2">
                    {feature.title}
                  </Text>
                  <Text fontSize="14px" color="gray.600" lineHeight="1.65">
                    {feature.description}
                  </Text>
                </Box>

                {feature.thumbnailSrc && (
                  <Box
                    w="full"
                    h="140px"
                    borderRadius="lg"
                    overflow="hidden"
                    bg="gray.100"
                    mt="2"
                  >
                    <Img
                      src={feature.thumbnailSrc}
                      alt={feature.title}
                      w="full"
                      h="full"
                      objectFit="cover"
                    />
                  </Box>
                )}
              </VStack>
            </AppCard>
          ))}

          {!showAll && (
            <AppCard
              variant="default"
              padding={6}
            >
              <VStack align="start" gap="4" opacity={FEATURES_TOKENS.lockedOpacity}>
                <Flex
                  w={FEATURES_TOKENS.iconSize}
                  h={FEATURES_TOKENS.iconSize}
                  align="center"
                  justify="center"
                  borderRadius={FEATURES_TOKENS.iconBorderRadius}
                  bg="gray.100"
                  color="gray.400"
                  flexShrink={0}
                >
                  <Lock size={20} />
                </Flex>
                <Box>
                  <Text fontSize="16px" fontWeight="600" color="gray.700" mb="2">
                    {t.features.locked.title}
                  </Text>
                  <Text fontSize="14px" color="gray.500" lineHeight="1.65">
                    {t.features.locked.description}
                  </Text>
                </Box>
              </VStack>
              <Box mt="5">
                <Text fontSize="12px" color="teal.600" fontWeight="600" mb="3" textTransform="uppercase" letterSpacing="0.06em">
                  {t.features.lockedLabel}
                </Text>
                <AppButton
                  label={t.nav.requestAccess}
                  variant="outline"
                  size="sm"
                  onClick={onRequestAccess}
                />
              </Box>
            </AppCard>
          )}
        </Grid>

        {!showAll && (
          <Flex justify="center" mt="10" className="animate-fade-up">
            <AppButton
              label={t.features.cta}
              variant="secondary"
              size="md"
              onClick={onRequestAccess}
            />
          </Flex>
        )}
      </Box>
    </SectionWrapper>
  )
}
