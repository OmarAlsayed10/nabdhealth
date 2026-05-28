import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, Grid, Text, chakra } from '@chakra-ui/react'
import { Crosshair, AlertCircle } from 'lucide-react'
import { AppInput } from '../AppInput/AppInput'
import { LocationPickerLazy } from '../LocationPicker/LocationPicker.lazy'
import { COUNTRIES } from '../../../constants/countries'
import { useTranslation } from '../../../hooks/useTranslation'
import { reverseGeocode } from '../../../services/geocode.service'
import { INPUT_TOKENS } from '../AppInput/AppInput.token'
import type { ClinicLocationFieldsProps, ClinicLocationValue } from './ClinicLocationFields.type'

const Label = chakra('label')
const Btn = chakra('button')
const Select = chakra('select')

interface CityEntry {
  name: string
  latitude: string
  longitude: string
}

export function ClinicLocationFields({ value, onChange, errors }: ClinicLocationFieldsProps) {
  const { t, lang } = useTranslation()
  const [locating, setLocating] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [cities, setCities] = useState<CityEntry[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const lastIso2Ref = useRef<string>('')

  useEffect(() => {
    const iso2 = value.countryIso2
    if (!iso2) {
      setCities([])
      return
    }
    if (lastIso2Ref.current === iso2 && cities.length > 0) return
    let cancelled = false
    setCitiesLoading(true)
    ;(async () => {
      const mod = await import('country-state-city')
      if (cancelled) return
      const list = (mod.City.getCitiesOfCountry(iso2) ?? []) as CityEntry[]
      list.sort((a, b) => a.name.localeCompare(b.name))
      lastIso2Ref.current = iso2
      setCities(list)
      setCitiesLoading(false)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.countryIso2])

  const update = (patch: Partial<ClinicLocationValue>) => onChange({ ...value, ...patch })

  const onCityChange = (cityName: string) => {
    if (!cityName) {
      update({ city: '' })
      return
    }
    const city = cities.find((c) => c.name === cityName)
    if (city) {
      onChange({
        ...value,
        city: cityName,
        location: { lat: parseFloat(city.latitude), lng: parseFloat(city.longitude) },
      })
    } else {
      update({ city: cityName })
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    setGeocodeError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const reverse = await reverseGeocode(lat, lng)
        let nextCountry = value.countryIso2
        if (reverse.success && reverse.data.countryIso2) {
          const matched = COUNTRIES.find((c) => c.iso2 === reverse.data.countryIso2)
          if (matched) nextCountry = matched.iso2
        }
        onChange({
          ...value,
          countryIso2: nextCountry,
          location: { lat, lng },
        })
        setLocating(false)
      },
      () => {
        setLocating(false)
        setGeocodeError(t.requestAccess.form.locationDenied)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const onMapClick = (loc: { lat: number; lng: number } | null) => {
    onChange({ ...value, location: loc })
  }

  const countryError = errors?.countryIso2
  const cityError = errors?.city
  const streetError = errors?.street

  const cityOptions = useMemo(
    () =>
      cities.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name}
        </option>
      )),
    [cities],
  )

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
              onChange({ ...value, countryIso2: e.target.value, city: '' })
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

        <Box>
          <Label
            htmlFor="ra-clinic-city"
            display="block"
            mb="1.5"
            fontSize={INPUT_TOKENS.labelFontSize}
            fontWeight={INPUT_TOKENS.labelFontWeight}
            color={INPUT_TOKENS.labelColor}
          >
            {t.requestAccess.form.clinicCity}
            <Text as="span" color="red.500" ms="1">*</Text>
          </Label>
          <Select
            id="ra-clinic-city"
            value={value.city}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCityChange(e.target.value)}
            disabled={!value.countryIso2 || citiesLoading}
            w="full"
            h={INPUT_TOKENS.height}
            px="3"
            fontSize={INPUT_TOKENS.fontSize}
            bg={INPUT_TOKENS.bg}
            border="1px solid"
            borderColor={cityError ? INPUT_TOKENS.errorBorderColor : INPUT_TOKENS.borderColor}
            borderRadius={INPUT_TOKENS.borderRadius}
            cursor={!value.countryIso2 || citiesLoading ? 'not-allowed' : 'pointer'}
            _disabled={{ opacity: 0.6 }}
            _focus={{
              borderColor: cityError ? INPUT_TOKENS.errorBorderColor : INPUT_TOKENS.focusBorderColor,
              outline: 'none',
              boxShadow: cityError
                ? '0 0 0 3px rgba(229,53,53,0.12)'
                : '0 0 0 3px rgba(13,152,170,0.12)',
            }}
          >
            <option value="">
              {citiesLoading ? t.common.loading : t.requestAccess.form.clinicCityPlaceholder}
            </option>
            {cityOptions}
          </Select>
          {cityError && (
            <Text mt="1.5" fontSize={INPUT_TOKENS.errorFontSize} color="red.500" role="alert">
              {cityError}
            </Text>
          )}
        </Box>

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

      {geocodeError && (
        <Flex mt="2" align="center" gap="1.5" fontSize="12px" color="orange.600">
          <AlertCircle size={12} />
          <Text as="span">{geocodeError}</Text>
        </Flex>
      )}

      <Text mt="2" fontSize="11px" color="gray.400" lineHeight="1.5">
        {t.requestAccess.form.locationAttribution}
      </Text>
    </Box>
  )
}
