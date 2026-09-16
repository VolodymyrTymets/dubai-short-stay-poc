import { useMemo, useState } from 'react'
import { Input } from '../../../../shared/components/Input'
import { Radio } from '../../../../shared/components/Radio'
import { Checkbox } from '../../../../shared/components/Checkbox'
import type { PropertyType } from '../../../../shared/api/generated.graphql'

const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
]

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export type CreatePropertyFormState = {
  title: string
  slug: string
  slugTouched: boolean
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
}

const initialFormState: CreatePropertyFormState = {
  title: '',
  slug: '',
  slugTouched: false,
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
    | 'cleaningFeeAed',
    string
  >
>

// Mirrors api/src/property/dto/create-property.input.ts's class-validator constraints.
function validate(form: CreatePropertyFormState): CreatePropertyFormErrors {
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

  return errors
}

export function CreatePropertyPage() {
  const [form, setForm] = useState<CreatePropertyFormState>(initialFormState)
  const errors = useMemo(() => validate(form), [form])

  function updateTitle(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slugTouched ? prev.slug : slugify(title),
    }))
  }

  function updateSlug(slug: string) {
    setForm((prev) => ({ ...prev, slug, slugTouched: true }))
  }

  function set<K extends keyof CreatePropertyFormState>(key: K, value: CreatePropertyFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6 px-10 py-8 max-w-[880px]">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif font-medium text-[36px] leading-10 tracking-[-0.25px] text-ink">
          Create property
        </h1>
        <p className="text-base text-ink-secondary">
          Add a new home listing. It starts as a draft — you can publish it once it's ready.
        </p>
      </div>

      <section className="flex flex-col gap-4 bg-surface border border-line rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-ink">Basics</h2>
        <Input label="Title" value={form.title} onChange={(e) => updateTitle(e.target.value)} error={errors.title} />
        <Input label="Slug" value={form.slug} onChange={(e) => updateSlug(e.target.value)} error={errors.slug}
          helperText="Lowercase words separated by hyphens, e.g. marina-gate-2-sea-view-2br" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            className={`px-3.5 py-3 rounded-lg bg-surface border text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-line-focus ${
              errors.description ? 'border-red-700' : 'border-line-strong'
            }`}
          />
          {errors.description && <div className="text-xs text-red-700">{errors.description}</div>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">Property type</span>
          <div className="flex flex-wrap gap-4">
            {PROPERTY_TYPES.map(({ value, label }) => (
              <Radio
                key={value}
                label={label}
                checked={form.propertyType === value}
                onChange={() => set('propertyType', value)}
              />
            ))}
          </div>
          {errors.propertyType && <div className="text-xs text-red-700">{errors.propertyType}</div>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Bedrooms" type="number" min={0} value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} error={errors.bedrooms} />
          <Input label="Bathrooms" type="number" min={0} step="0.5" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} error={errors.bathrooms} />
          <Input label="Max guests" type="number" min={1} value={form.maxGuests} onChange={(e) => set('maxGuests', e.target.value)} error={errors.maxGuests} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Bed type" placeholder="e.g. Queen" value={form.bedType} onChange={(e) => set('bedType', e.target.value)} error={errors.bedType} />
          <Input label="Number of beds" type="number" min={1} value={form.bedCount} onChange={(e) => set('bedCount', e.target.value)} error={errors.bedCount} />
        </div>
      </section>

      <section className="flex flex-col gap-4 bg-surface border border-line rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-ink">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Area id" value={form.areaId} onChange={(e) => set('areaId', e.target.value)} error={errors.areaId}
            helperText="Paste a known Area id — no area picker exists yet" />
          <Input label="City id" value={form.cityId} onChange={(e) => set('cityId', e.target.value)} error={errors.cityId}
            helperText="Paste a known City id — no city picker exists yet" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Latitude" type="number" step="any" value={form.lat} onChange={(e) => set('lat', e.target.value)} error={errors.lat} />
          <Input label="Longitude" type="number" step="any" value={form.lng} onChange={(e) => set('lng', e.target.value)} error={errors.lng} />
        </div>
      </section>

      <section className="flex flex-col gap-4 bg-surface border border-line rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-ink">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Base price per night (AED)" type="number" min={0} value={form.basePriceAed} onChange={(e) => set('basePriceAed', e.target.value)} error={errors.basePriceAed} />
          <Input label="Cleaning fee (AED)" type="number" min={0} value={form.cleaningFeeAed} onChange={(e) => set('cleaningFeeAed', e.target.value)} error={errors.cleaningFeeAed}
            helperText="Optional" />
        </div>
        <Checkbox label="Allow instant booking" checked={form.isInstantBook} onChange={(e) => set('isInstantBook', e.target.checked)} />
      </section>
    </div>
  )
}
