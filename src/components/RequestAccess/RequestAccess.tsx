import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link as RouterLink } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { Box, Flex, Grid, Text, VStack } from '@chakra-ui/react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { AppButton } from '../UI/AppButton/AppButton'
import { AppInput, AppTextarea } from '../UI/AppInput/AppInput'
import { PhoneInput } from '../UI/PhoneInput/PhoneInput'
import { ClinicLocationFields } from '../UI/ClinicLocationFields/ClinicLocationFields'
import { useTranslation } from '../../hooks/useTranslation'
import { checkRateLimit } from '../../utils/rateLimit'
import { CONFIG } from '../../constants/config'
import { DEFAULT_COUNTRY_ISO2, findCountry } from '../../constants/countries'
import {
  submitAccessRequest,
  validateAccessRequest,
  type AccessRequestValidationErrors,
} from '../../services/accessRequest.service'
import { REQUEST_ACCESS_TOKENS } from './RequestAccess.token'
import type { RequestAccessFormData, RequestAccessProps } from './RequestAccess.type'

const EMPTY_FORM: RequestAccessFormData = {
  fullName: '',
  email: '',
  countryIso2: DEFAULT_COUNTRY_ISO2,
  phoneNational: '',
  clinicName: '',
  clinicCountryIso2: DEFAULT_COUNTRY_ISO2,
  clinicCity: '',
  clinicStreet: '',
  location: null,
  details: '',
  agreedToTerms: false,
}

export function RequestAccessModal({ isOpen, onClose }: RequestAccessProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<RequestAccessFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<AccessRequestValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM)
      setErrors({})
      setStatus('idle')
      setErrorMessage('')
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const clearErrors = (...keys: (keyof AccessRequestValidationErrors)[]) => {
    setErrors((prev) => {
      let changed = false
      const next = { ...prev }
      for (const k of keys) {
        if (next[k]) {
          delete next[k]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }

  const setField =
    <K extends keyof RequestAccessFormData>(field: K) =>
    (value: RequestAccessFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (field in errors) {
        clearErrors(field as keyof AccessRequestValidationErrors)
      }
    }

  const messages = {
    phoneInvalid: t.requestAccess.form.phoneInvalid,
    locationRequired: t.requestAccess.form.locationRequired,
    privacyRequired: t.requestAccess.form.privacyRequired,
  }

  const handleSubmit = async () => {
    const { errors: nextErrors, isValid } = validateAccessRequest(form, messages)
    setErrors(nextErrors)
    if (!isValid) return

    const { allowed } = checkRateLimit('access-request', CONFIG.rateLimit.formSubmissions)
    if (!allowed) {
      setErrorMessage('Too many submissions. Please wait a minute before trying again.')
      setStatus('error')
      return
    }

    const country = findCountry(form.countryIso2)
    if (!country || !form.location) return

    setIsLoading(true)
    setStatus('idle')
    const result = await submitAccessRequest({
      fullName: form.fullName,
      email: form.email,
      countryIso2: country.iso2,
      countryCode: country.code,
      phoneNational: form.phoneNational,
      clinicName: form.clinicName,
      clinicCountryIso2: form.clinicCountryIso2,
      clinicCity: form.clinicCity,
      clinicStreet: form.clinicStreet,
      location: form.location,
      details: form.details || undefined,
    })
    setIsLoading(false)

    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMessage(result.error)
    }
  }

  return createPortal(
    <Box
      position="fixed"
      inset="0"
      zIndex={1100}
      overflowY="auto"
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      py={{ base: '20px', md: '60px' }}
      px={{ base: '16px', md: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <Box
        position="fixed"
        inset="0"
        bg={REQUEST_ACCESS_TOKENS.backdropBg}
        backdropFilter={REQUEST_ACCESS_TOKENS.backdropBlur}
        aria-hidden="true"
        onClick={onClose}
      />

      <Box
        position="relative"
        zIndex="1"
        bg="white"
        borderRadius={REQUEST_ACCESS_TOKENS.contentBorderRadius}
        shadow="xl"
        w="full"
        maxW={REQUEST_ACCESS_TOKENS.contentMaxW}
        p={REQUEST_ACCESS_TOKENS.contentPadding}
        role="dialog"
        aria-modal="true"
        aria-label={t.requestAccess.headline}
      >
        <Flex justify="space-between" align="start" mb="6">
          <Box>
            <Text fontSize={{ base: '1.375rem', md: '1.5rem' }} fontWeight="700" color="gray.900" lineHeight="1.2">
              {t.requestAccess.headline}
            </Text>
            <Text mt="2" fontSize="14px" color="gray.500" lineHeight="1.6">
              {t.requestAccess.subheadline}
            </Text>
          </Box>
          <Box
            as="button"
            onClick={onClose}
            aria-label={t.common.close}
            ms="4"
            mt="1"
            flexShrink={0}
            p="2"
            borderRadius="lg"
            color="gray.400"
            bg="transparent"
            border="none"
            cursor="pointer"
            _hover={{ bg: 'gray.100', color: 'gray.600' }}
            transition="all 0.15s ease"
          >
            <X size={20} />
          </Box>
        </Flex>

        {status === 'success' ? (
          <Flex direction="column" align="center" justify="center" gap="4" py="10" textAlign="center">
            <Box color={REQUEST_ACCESS_TOKENS.successIconColor}>
              <CheckCircle size={52} />
            </Box>
            <Box>
              <Text fontSize="18px" fontWeight="700" color="gray.900" mb="2">
                {t.common.getStarted}!
              </Text>
              <Text fontSize="15px" color="gray.600" lineHeight="1.7" maxW="400px">
                {t.requestAccess.form.success}
              </Text>
            </Box>
            <AppButton label={t.common.close} variant="outline" size="md" onClick={onClose} />
          </Flex>
        ) : (
          <VStack gap="5" align="stretch">
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap="4">
              <AppInput
                id="ra-fullName"
                label={t.requestAccess.form.fullName}
                value={form.fullName}
                onChange={setField('fullName')}
                placeholder={t.requestAccess.form.fullNamePlaceholder}
                error={errors.fullName}
                isRequired
              />
              <AppInput
                id="ra-email"
                label={t.requestAccess.form.email}
                value={form.email}
                onChange={setField('email')}
                placeholder={t.requestAccess.form.emailPlaceholder}
                type="email"
                error={errors.email}
                isRequired
              />
            </Grid>

            <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap="4">
              <PhoneInput
                id="ra-phone"
                label={t.requestAccess.form.phone}
                value={{ countryIso2: form.countryIso2, nationalNumber: form.phoneNational }}
                onChange={(v) => {
                  setForm((prev) => ({
                    ...prev,
                    countryIso2: v.countryIso2,
                    phoneNational: v.nationalNumber,
                  }))
                  clearErrors('phoneNational')
                }}
                placeholder={t.requestAccess.form.phonePlaceholder}
                error={errors.phoneNational}
                isRequired
              />
              <AppInput
                id="ra-clinicName"
                label={t.requestAccess.form.clinicName}
                value={form.clinicName}
                onChange={setField('clinicName')}
                placeholder={t.requestAccess.form.clinicNamePlaceholder}
                error={errors.clinicName}
                isRequired
              />
            </Grid>

            <ClinicLocationFields
              value={{
                countryIso2: form.clinicCountryIso2,
                city: form.clinicCity,
                street: form.clinicStreet,
                location: form.location,
              }}
              onChange={(v) => {
                setForm((prev) => ({
                  ...prev,
                  clinicCountryIso2: v.countryIso2,
                  clinicCity: v.city,
                  clinicStreet: v.street,
                  location: v.location,
                }))
                const keysToClear: (keyof AccessRequestValidationErrors)[] = []
                if (v.countryIso2) keysToClear.push('clinicCountryIso2')
                if (v.city.trim()) keysToClear.push('clinicCity')
                if (v.street.trim()) keysToClear.push('clinicStreet')
                if (v.location) keysToClear.push('location')
                if (keysToClear.length) clearErrors(...keysToClear)
              }}
              errors={{
                countryIso2: errors.clinicCountryIso2,
                city: errors.clinicCity,
                street: errors.clinicStreet,
                location: errors.location,
              }}
            />

            <AppTextarea
              id="ra-details"
              label={`${t.requestAccess.form.details} ${t.requestAccess.form.detailsOptional}`}
              value={form.details}
              onChange={setField('details')}
              placeholder={t.requestAccess.form.detailsPlaceholder}
              rows={3}
            />

            {status === 'error' && (
              <Flex
                align="center"
                gap="2"
                p="3"
                bg="red.50"
                borderRadius="lg"
                border="1px solid"
                borderColor="red.200"
                role="alert"
              >
                <AlertCircle size={16} color="var(--chakra-colors-red-500)" />
                <Text fontSize="14px" color="red.600">
                  {errorMessage || t.requestAccess.form.error}
                </Text>
              </Flex>
            )}

            <AppButton
              label={isLoading ? t.requestAccess.form.submitting : t.requestAccess.form.submit}
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              isLoading={isLoading}
              fullWidth
              type="button"
            />

            <Box>
              <Flex align="start" gap="3">
                <Box mt="1" flexShrink={0}>
                  <input
                    type="checkbox"
                    id="ra-agreed"
                    checked={form.agreedToTerms}
                    onChange={(e) => setField('agreedToTerms')(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--chakra-colors-teal-500)' }}
                  />
                </Box>
                <Text
                  as="label"
                  fontSize={REQUEST_ACCESS_TOKENS.privacyFontSize}
                  color={REQUEST_ACCESS_TOKENS.privacyColor}
                  lineHeight="1.6"
                  cursor="pointer"
                >
                  {t.requestAccess.form.privacyPrefix}
                  <RouterLink 
                    to={ROUTES.PRIVACY} 
                    style={{ color: 'var(--chakra-colors-teal-600)', fontWeight: '500', textDecoration: 'underline' }}
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                  >
                    {t.requestAccess.form.privacyLink}
                  </RouterLink>
                  {t.requestAccess.form.privacyAnd}
                  <RouterLink 
                    to={ROUTES.TERMS} 
                    style={{ color: 'var(--chakra-colors-teal-600)', fontWeight: '500', textDecoration: 'underline' }}
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                  >
                    {t.requestAccess.form.termsLink}
                  </RouterLink>
                  {t.requestAccess.form.privacySuffix}
                </Text>
              </Flex>
              {errors.agreedToTerms && (
                <Text fontSize="13px" color="red.500" mt="1.5">
                  {errors.agreedToTerms}
                </Text>
              )}
            </Box>
          </VStack>
        )}
      </Box>
    </Box>,
    document.body,
  )
}
