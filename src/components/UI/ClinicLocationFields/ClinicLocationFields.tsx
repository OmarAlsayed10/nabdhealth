import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Grid, Text, chakra } from '@chakra-ui/react'
import { Crosshair, AlertCircle } from 'lucide-react'
import { AppInput } from '../AppInput/AppInput'
import { LocationPickerLazy } from '../LocationPicker/LocationPicker.lazy'
import { COUNTRIES } from '../../../constants/countries'
import { useTranslation } from '../../../hooks/useTranslation'
import { forwardGeocode, reverseGeocode } from '../../../services/geocode.service'
import { INPUT_TOKENS } from '../AppInput/AppInput.token'
import type { ClinicLocationFieldsProps, ClinicLocationValue } from './ClinicLocationFields.type'

const Label = chakra('label')
const Btn = chakra('button')
const Select = chakra('select')

const GEOCODE_DEBOUNCE_MS = 800

export function ClinicLocationFields({ value, onChange, errors }: ClinicLocationFieldsProps) {
  const { t, lang } = useTranslation()
  const [locating, setLocating] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const lastGeocodeKeyRef = useRef<string>('')

  const update = (patch: Partial<ClinicLocationValue>) => onChange({ ...value, ...patch })

  useEffect(() => {
    const { countryIso2, city, street } = value
    if (!countryIso2 || !city.trim() || !street.trim()) return

    const key = `${countryIso2}|${city.trim()}|${street.trim()}`
    if (key === lastGeocodeKeyRef.current) return

    const timer = window.setTimeout(async () => {
      lastGeocodeKeyRef.current = key
      setGeocoding(true)
      setGeocodeError(null)
      const res = await forwardGeocode({ countryIso2, city, street })
      setGeocoding(false)
      if (res.success) {
        onChange({ ...value, countryIso2, city, street, location: res.data })
      } else {
        setGeocodeError(t.requestAccess.form.locationNotFound)
      }
    }, GEOCODE_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.countryIso2, value.city, value.street])

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    setGeocodeError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const reverse = await reverseGeocode(lat, lng)
        let next: ClinicLocationValue = { ...value, location: { lat, lng } }
        if (reverse.success) {
          const r = reverse.data
          const knownIso2 = r.countryIso2 && COUNTRIES.some((c) => c.iso2 === r.countryIso2)
            ? r.countryIso2!
            : value.countryIso2
          next = {
            countryIso2: knownIso2,
            city: r.city ?? value.city,
            street: r.street ?? value.street,
            location: { lat, lng },
          }
          lastGeocodeKeyRef.current = `${knownIso2}|${next.city.trim()}|${next.street.trim()}`
        } else {
          setGeocodeError(t.requestAccess.form.locationReverseFailed)
        }
        onChange(next)
        setLocating(false)
      },
      () => {
        setLocating(false)
        setGeocodeError(t.requestAccess.form.locationDenied)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const onMapClick = async (loc: { lat: number; lng: number } | null) => {
    if (!loc) {
      onChange({ ...value, location: null })
      return
    }
    onChange({ ...value, location: loc })
    setGeocoding(true)
    setGeocodeError(null)
    const reverse = await reverseGeocode(loc.lat, loc.lng)
    setGeocoding(false)
    if (reverse.success) {
      const r = reverse.data
      const knownIso2 = r.countryIso2 && COUNTRIES.some((c) => c.iso2 === r.countryIso2)
        ? r.countryIso2!
        : value.countryIso2
      const next: ClinicLocationValue = {
        countryIso2: knownIso2,
        city: r.city ?? value.city,
        street: r.street ?? value.street,
        location: loc,
      }
      lastGeocodeKeyRef.current = `${knownIso2}|${next.city.trim()}|${next.street.trim()}`
      onChange(next)
    }
  }

  const countryError = errors?.countryIso2
  const cityError = errors?.city
  const streetError = errors?.street

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="3" gap="3" wrap="wrap">
        <Text fontSize="14px" fontWeight="600" color="gray.800">
          {t.requestAccess.form.clinicLocation}
        </Text>
        <Btn
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          display="inline-flex"
          alignItems="center"
          gap="1.5"
          px="3"
          py="1.5"
          fontSize="13px"
          fontWeight="500"
          color="teal.700"
          bg="teal.50"
          border="1px solid"
          borderColor="teal.200"
          borderRadius="md"
          cursor={locating ? 'wait' : 'pointer'}
          _hover={{ bg: 'teal.100' }}
          _disabled={{ opacity: 0.6, cursor: 'wait' }}
        >
          <Crosshair size={14} />
          {locating ? t.common.loading : t.requestAccess.form.locationUseMine}
        </Btn>
      </Flex>

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }} gap="4" mb="4">
        <Box>
          <Label
            htmlFor="ra-clinic-country"
            display="block"
            mb="1.5"
            fontSize={INPUT_TOKENS.labelFontSize}
            fontWeight={INPUT_TOKENS.labelFontWeight}
            color={INPUT_TOKENS.labelColor}
          >
            {t.requestAccess.form.clinicCountry}
            <Text as="span" color="red.500" ms="1">*</Text>
          </Label>
          <Select
            id="ra-clinic-country"
            value={value.countryIso2}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              update({ countryIso2: e.target.value })
            }
            w="full"
            h={INPUT_TOKENS.height}
            px="3"
            fontSize={INPUT_TOKENS.fontSize}
            bg={INPUT_TOKENS.bg}
            border="1px solid"
            borderColor={countryError ? INPUT_TOKENS.errorBorderColor : INPUT_TOKENS.borderColor}
            borderRadius={INPUT_TOKENS.borderRadius}
            cursor="pointer"
            _focus={{
              borderColor: countryError ? INPUT_TOKENS.errorBorderColor : INPUT_TOKENS.focusBorderColor,
              outline: 'none',
              boxShadow: countryError
                ? '0 0 0 3px rgba(229,53,53,0.12)'
                : '0 0 0 3px rgba(13,152,170,0.12)',
            }}
          >
            <option value="">{t.requestAccess.form.clinicCountryPlaceholder}</option>
            {COUNTRIES.map((c) => (
              <option key={c.iso2} value={c.iso2}>
                {c.flag} {lang === 'ar' ? c.nameAr : c.nameEn}
              </option>
            ))}
          </Select>
          {countryError && (
            <Text mt="1.5" fontSize={INPUT_TOKENS.errorFontSize} color="red.500" role="alert">
              {countryError}
            </Text>
          )}
        </Box>

        <AppInput
          id="ra-clinic-city"
          label={t.requestAccess.form.clinicCity}
          value={value.city}
          onChange={(v) => update({ city: v })}
          placeholder={t.requestAccess.form.clinicCityPlaceholder}
          error={cityError}
          isRequired
        />

        <AppInput
          id="ra-clinic-street"
          label={t.requestAccess.form.clinicStreet}
          value={value.street}
          onChange={(v) => update({ street: v })}
          placeholder={t.requestAccess.form.clinicStreetPlaceholder}
          error={streetError}
          isRequired
        />
      </Grid>

      <LocationPickerLazy
        id="ra-location"
        label=""
        value={value.location}
        onChange={onMapClick}
        error={errors?.location}
      />

      {(geocoding || geocodeError) && (
        <Flex mt="2" align="center" gap="2">
          {geocoding && (
            <Text fontSize="12px" color="gray.500">
              {t.requestAccess.form.locationSearching}
            </Text>
          )}
          {geocodeError && (
            <Flex align="center" gap="1.5" fontSize="12px" color="orange.600">
              <AlertCircle size={12} />
              <Text as="span">{geocodeError}</Text>
            </Flex>
          )}
        </Flex>
      )}

      <Text mt="2" fontSize="11px" color="gray.400" lineHeight="1.5">
        {t.requestAccess.form.locationAttribution}
      </Text>
    </Box>
  )
}
