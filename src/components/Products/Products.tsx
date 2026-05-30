import { Box, Grid, Text, VStack, HStack, Flex } from '@chakra-ui/react'
import { Stethoscope, Pill, Check, ArrowRight, Clock } from 'lucide-react'
import { SectionWrapper } from '../UI/SectionWrapper/SectionWrapper'
import { AppBadge } from '../UI/AppBadge/AppBadge'
import { AppButton } from '../UI/AppButton/AppButton'
import { useTranslation } from '../../hooks/useTranslation'
import { useScrollAnimationGroup } from '../../hooks/useScrollAnimation'

interface ProductsProps {
  onExploreClinic: () => void
}

export function Products({ onExploreClinic }: ProductsProps) {
  const { t } = useTranslation()
  const groupRef = useScrollAnimationGroup<HTMLDivElement>()

  return (
    <SectionWrapper background="gray" id="products">
      <Box ref={groupRef}>
        <Box textAlign="center" mb="12">
          <Box className="animate-fade-up">
            <AppBadge>{t.products.badge}</AppBadge>
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
            {t.products.headline}
          </Text>
          <Text
            mt="4"
            fontSize={{ base: '1rem', md: '1.125rem' }}
            color="gray.600"
            maxW="600px"
            mx="auto"
            lineHeight="1.75"
            className="animate-fade-up animate-delay-2"
          >
            {t.products.subheadline}
          </Text>
        </Box>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
          gap="6"
          maxW="900px"
          mx="auto"
        >
          {/* Ikseer Clinic — live */}
          <Box
            bg="white"
            border="1.5px solid"
            borderColor="teal.200"
            borderRadius="2xl"
            p="8"
            shadow="md"
            transition="box-shadow 0.2s ease, transform 0.2s ease"
            _hover={{ shadow: 'xl', transform: 'translateY(-3px)' }}
            display="flex"
            flexDirection="column"
            className="animate-fade-up animate-delay-1"
          >
            <HStack justify="space-between" mb="5">
              <Flex
                w="48px"
                h="48px"
                align="center"
                justify="center"
                borderRadius="xl"
                bg="teal.50"
                color="teal.700"
                flexShrink={0}
              >
                <Stethoscope size={22} />
              </Flex>
              <AppBadge variant="teal">{t.products.clinic.badge}</AppBadge>
            </HStack>

            <Text fontSize="1.375rem" fontWeight="700" color="gray.900" mb="2">
              {t.products.clinic.title}
            </Text>
            <Text fontSize="0.9375rem" color="gray.600" lineHeight="1.7" mb="6">
              {t.products.clinic.description}
            </Text>

            <VStack align="start" gap="2" mb="8" flex="1">
              {t.products.clinic.features.map((f) => (
                <HStack key={f} gap="2">
                  <Box color="teal.500" flexShrink={0}>
                    <Check size={15} />
                  </Box>
                  <Text fontSize="0.875rem" color="gray.700">
                    {f}
                  </Text>
                </HStack>
              ))}
            </VStack>

            <AppButton
              label={t.products.clinic.cta}
              variant="primary"
              size="md"
              onClick={onExploreClinic}
              rightIcon={<ArrowRight size={16} />}
            />
          </Box>

          {/* Ikseer Pharmacy — coming soon */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="2xl"
            p="8"
            shadow="sm"
            opacity={0.75}
            display="flex"
            flexDirection="column"
            className="animate-fade-up animate-delay-2"
          >
            <HStack justify="space-between" mb="5">
              <Flex
                w="48px"
                h="48px"
                align="center"
                justify="center"
                borderRadius="xl"
                bg="gray.100"
                color="gray.400"
                flexShrink={0}
              >
                <Pill size={22} />
              </Flex>
              <AppBadge variant="dark">{t.products.pharmacy.badge}</AppBadge>
            </HStack>

            <Text fontSize="1.375rem" fontWeight="700" color="gray.700" mb="2">
              {t.products.pharmacy.title}
            </Text>
            <Text fontSize="0.9375rem" color="gray.500" lineHeight="1.7" mb="6">
              {t.products.pharmacy.description}
            </Text>

            <VStack align="start" gap="2" mb="8" flex="1">
              {t.products.pharmacy.features.map((f) => (
                <HStack key={f} gap="2">
                  <Box color="gray.400" flexShrink={0}>
                    <Check size={15} />
                  </Box>
                  <Text fontSize="0.875rem" color="gray.400">
                    {f}
                  </Text>
                </HStack>
              ))}
            </VStack>

            <HStack
              gap="2"
              px="4"
              py="2.5"
              borderRadius="lg"
              bg="gray.100"
              color="gray.500"
              fontSize="0.9375rem"
              fontWeight="600"
              w="fit-content"
            >
              <Clock size={16} />
              <Text>{t.products.pharmacy.cta}</Text>
            </HStack>
          </Box>
        </Grid>
      </Box>
    </SectionWrapper>
  )
}
