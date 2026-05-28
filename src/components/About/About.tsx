import { Box, Grid, Text, VStack, Flex } from '@chakra-ui/react'
import { Heart, Target, Shield, Headphones } from 'lucide-react'
import { SectionWrapper } from '../UI/SectionWrapper/SectionWrapper'
import { AppBadge } from '../UI/AppBadge/AppBadge'
import { AppCard } from '../UI/AppCard/AppCard'
import { useTranslation } from '../../hooks/useTranslation'
import { useScrollAnimationGroup } from '../../hooks/useScrollAnimation'
import { ABOUT_TOKENS } from './About.token'
import type { AboutProps } from './About.type'

export function About({ hideIntro = false }: AboutProps = {}) {
  const { t } = useTranslation()
  const storyRef = useScrollAnimationGroup<HTMLDivElement>()
  const valuesRef = useScrollAnimationGroup<HTMLDivElement>()

  const valueIcons = [
    <Heart key="care" size={20} />,
    <Target key="precision" size={20} />,
    <Shield key="trust" size={20} />,
    <Headphones key="support" size={20} />,
  ]

  const values = [
    { key: 'care', ...t.about.values.care },
    { key: 'precision', ...t.about.values.precision },
    { key: 'trust', ...t.about.values.trust },
    { key: 'support', ...t.about.values.support },
  ]

  return (
    <>
      <SectionWrapper background="white" id="about">
        <Box ref={storyRef}>
          {hideIntro ? (
            <VStack align="start" gap="5">
              {(t.about.story as readonly string[]).map((paragraph, i) => (
                <Text
                  key={i}
                  fontSize={ABOUT_TOKENS.storyFontSize}
                  color={ABOUT_TOKENS.storyColor}
                  lineHeight={ABOUT_TOKENS.storyLineHeight}
                  className="animate-fade-up"
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  {paragraph}
                </Text>
              ))}
            </VStack>
          ) : (
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: '10', lg: '20' }} alignItems="start">
              <Box>
                <Box className="animate-fade-up">
                  <AppBadge>{t.about.badge}</AppBadge>
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
                  {t.about.headline}
                </Text>
              </Box>

              <VStack
                align="start"
                gap="5"
                pt={{ base: '0', lg: '16' }}
              >
                {(t.about.story as readonly string[]).map((paragraph, i) => (
                  <Text
                    key={i}
                    fontSize={ABOUT_TOKENS.storyFontSize}
                    color={ABOUT_TOKENS.storyColor}
                    lineHeight={ABOUT_TOKENS.storyLineHeight}
                    className="animate-fade-up"
                    style={{ transitionDelay: `${i * 0.08}s` }}
                  >
                    {paragraph}
                  </Text>
                ))}
              </VStack>
            </Grid>
          )}
        </Box>
      </SectionWrapper>

      <SectionWrapper background="gray">
        <Box ref={valuesRef}>
          <Box textAlign="center" mb="10">
            <Text
              as="h3"
              fontSize={{ base: '1.5rem', md: '2rem' }}
              fontWeight="700"
              color="gray.900"
              letterSpacing="-0.02em"
              className="animate-fade-up"
            >
              {t.about.values.headline}
            </Text>
          </Box>
          <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap="6"
          >
            {values.map((value, i) => (
              <AppCard key={value.key} variant="default" isHoverable className="animate-fade-up" padding={6}>
                <VStack align="start" gap="4">
                  <Flex
                    w="44px"
                    h="44px"
                    align="center"
                    justify="center"
                    borderRadius="lg"
                    bg={ABOUT_TOKENS.valueIconBg}
                    color={ABOUT_TOKENS.valueIconColor}
                  >
                    {valueIcons[i]}
                  </Flex>
                  <Box>
                    <Text fontSize="15px" fontWeight="600" color="gray.900" mb="2">
                      {value.title}
                    </Text>
                    <Text fontSize="14px" color="gray.600" lineHeight="1.65">
                      {value.description}
                    </Text>
                  </Box>
                </VStack>
              </AppCard>
            ))}
          </Grid>
        </Box>
      </SectionWrapper>
    </>
  )
}
