import type { CreatePropertyInput, PropertyType } from '../../../../shared/api/generated.graphql'

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

export type CreatePropertyFormState = {
  title: string
  slug: string
  description: string
  propertyType: PropertyType | ''
  bedrooms: string
  bathrooms: string
  maxGuests: string
  bedType: string
  bedCount: string
  areaId: string
  cityId: string
  lat: string
  lng: string
  basePriceAed: string
  cleaningFeeAed: string
  isInstantBook: boolean
  detPermitNumber: string
  tdfPerBedroom: string
}

export const initialFormState: CreatePropertyFormState = {
  title: '',
  slug: '',
  description: '',
  propertyType: '',
  bedrooms: '',
  bathrooms: '',
  maxGuests: '',
  bedType: '',
  bedCount: '',
  areaId: '',
  cityId: '',
  lat: '',
  lng: '',
  basePriceAed: '',
  cleaningFeeAed: '',
  isInstantBook: true,
  detPermitNumber: '',
  tdfPerBedroom: '',
}

export type CreatePropertyFormErrors = Partial<
  Record<
    | 'title'
    | 'slug'
    | 'description'
    | 'propertyType'
    | 'bedrooms'
    | 'bathrooms'
    | 'maxGuests'
    | 'bedType'
    | 'bedCount'
    | 'areaId'
    | 'cityId'
    | 'lat'
    | 'lng'
    | 'basePriceAed'
    | 'cleaningFeeAed'
    | 'detPermitNumber'
    | 'tdfPerBedroom',
    string
  >
>

// Mirrors api/src/property/dto/create-property.input.ts's class-validator constraints.
export function validate(form: CreatePropertyFormState): CreatePropertyFormErrors {
  const errors: CreatePropertyFormErrors = {}

  if (!form.title.trim()) errors.title = 'Title is required'
  else if (form.title.length > 200) errors.title = 'Title must be 200 characters or fewer'

  if (!form.slug.trim()) errors.slug = 'Slug is required'
  else if (form.slug.length > 80) errors.slug = 'Slug must be 80 characters or fewer'
  else if (!SLUG_PATTERN.test(form.slug)) {
    errors.slug = 'Slug must be lowercase alphanumeric words separated by hyphens'
  }

  if (!form.description.trim()) errors.description = 'Description is required'
  else if (form.description.length > 5000) errors.description = 'Description must be 5000 characters or fewer'

  if (!form.propertyType) errors.propertyType = 'Choose a property type'

  const bedrooms = Number(form.bedrooms)
  if (form.bedrooms === '' || !Number.isInteger(bedrooms) || bedrooms < 0) {
    errors.bedrooms = 'Enter a whole number of 0 or more'
  }

  const bathrooms = Number(form.bathrooms)
  if (form.bathrooms === '' || Number.isNaN(bathrooms) || bathrooms < 0) {
    errors.bathrooms = 'Enter a number of 0 or more'
  }

  const maxGuests = Number(form.maxGuests)
  if (form.maxGuests === '' || !Number.isInteger(maxGuests) || maxGuests < 1) {
    errors.maxGuests = 'Enter a whole number of 1 or more'
  }

  if (!form.bedType.trim()) errors.bedType = 'Bed type is required'
  else if (form.bedType.length > 40) errors.bedType = 'Bed type must be 40 characters or fewer'

  const bedCount = Number(form.bedCount)
  if (form.bedCount === '' || !Number.isInteger(bedCount) || bedCount < 1) {
    errors.bedCount = 'Enter a whole number of 1 or more'
  }

  if (!form.areaId.trim()) errors.areaId = 'Area id is required'
  if (!form.cityId.trim()) errors.cityId = 'City id is required'

  const lat = Number(form.lat)
  if (form.lat === '' || Number.isNaN(lat) || lat < -90 || lat > 90) {
    errors.lat = 'Enter a latitude between -90 and 90'
  }

  const lng = Number(form.lng)
  if (form.lng === '' || Number.isNaN(lng) || lng < -180 || lng > 180) {
    errors.lng = 'Enter a longitude between -180 and 180'
  }

  const basePriceAed = Number(form.basePriceAed)
  if (form.basePriceAed === '' || !Number.isInteger(basePriceAed) || basePriceAed < 0) {
    errors.basePriceAed = 'Enter a whole AED amount of 0 or more'
  }

  if (form.cleaningFeeAed !== '') {
    const cleaningFeeAed = Number(form.cleaningFeeAed)
    if (!Number.isInteger(cleaningFeeAed) || cleaningFeeAed < 0) {
      errors.cleaningFeeAed = 'Enter a whole AED amount of 0 or more'
    }
  }

  if (form.detPermitNumber.length > 64) {
    errors.detPermitNumber = 'DET permit number must be 64 characters or fewer'
  }

  if (form.tdfPerBedroom !== '') {
    const tdfPerBedroom = Number(form.tdfPerBedroom)
    if (!Number.isInteger(tdfPerBedroom) || tdfPerBedroom < 0) {
      errors.tdfPerBedroom = 'Enter a whole AED amount of 0 or more'
    }
  }

  return errors
}

export function toCreatePropertyInput(form: CreatePropertyFormState): CreatePropertyInput {
  return {
    slug: form.slug,
    title: form.title,
    description: form.description,
    propertyType: form.propertyType as PropertyType,
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    maxGuests: Number(form.maxGuests),
    beds: [{ type: form.bedType, count: Number(form.bedCount) }],
    areaId: form.areaId,
    cityId: form.cityId,
    lat: Number(form.lat),
    lng: Number(form.lng),
    basePriceAed: Number(form.basePriceAed),
    cleaningFeeAed: form.cleaningFeeAed === '' ? undefined : Number(form.cleaningFeeAed),
    isInstantBook: form.isInstantBook,
    detPermitNumber: form.detPermitNumber === '' ? undefined : form.detPermitNumber,
    tdfPerBedroom: form.tdfPerBedroom === '' ? undefined : Number(form.tdfPerBedroom),
  }
}
