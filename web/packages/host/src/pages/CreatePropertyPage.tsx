import { useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { Input } from '../../../../shared/components/Input'
import { Radio } from '../../../../shared/components/Radio'
import { Checkbox } from '../../../../shared/components/Checkbox'
import { Button } from '../../../../shared/components/Button'
import { useCreatePropertyMutation, type PropertyType } from '../../../../shared/api/generated.graphql'
import {
  type CreatePropertyFormState,
  initialFormState,
  slugify,
  validate,
  toCreatePropertyInput,
} from './createPropertyForm'

const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
]

function focusFirstError() {
  const el = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus()
}

export function CreatePropertyPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CreatePropertyFormState>(initialFormState)
  const [slugTouched, setSlugTouched] = useState(false)
  const [touched, setTouched] = useState<Set<keyof CreatePropertyFormState>>(new Set())
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [createProperty, { data, loading, error }] = useCreatePropertyMutation()

  const errors = validate(form)
  const showError = (key: keyof CreatePropertyFormState) =>
    submitAttempted || touched.has(key) ? errors[key as keyof typeof errors] : undefined

  const descriptionId = useId()
  const descriptionErrorId = `${descriptionId}-error`
  const propertyTypeErrorId = useId()

  function updateTitle(title: string) {
    setForm((prev) => {
      if (slugTouched) return { ...prev, title }
      const nextSlug = slugify(title)
      return { ...prev, title, slug: nextSlug || prev.slug }
    })
  }

  function updateSlug(slug: string) {
    setSlugTouched(true)
    setTouched((prev) => new Set(prev).add('slug'))
    setForm((prev) => ({ ...prev, slug }))
  }

  function set<K extends keyof CreatePropertyFormState>(key: K, value: CreatePropertyFormState[K]) {
    setTouched((prev) => new Set(prev).add(key))
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSubmitAttempted(true)
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(focusFirstError)
      return
    }
    try {
      await createProperty({ variables: { input: toCreatePropertyInput(form) } })
    } catch {
      // WHY: useMutation rethrows on error; already surfaced to the user via the `error` state below.
    }
  }

  if (data?.createProperty) {
    return (
      <div className="flex flex-col gap-6 px-10 py-8 max-w-[880px]">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif font-medium text-[36px] leading-10 tracking-[-0.25px] text-ink">
            Property created
          </h1>
          <p className="text-base text-ink-secondary">Your new listing was saved as a draft.</p>
        </div>
        <div className="flex flex-col gap-3 bg-surface border border-line rounded-2xl p-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Property id</span>
            <span className="text-base text-ink">{data.createProperty.id}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Slug</span>
            <span className="text-base text-ink">{data.createProperty.slug}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink-muted">Status</span>
            <span className="text-base text-ink">{data.createProperty.status}</span>
          </div>
        </div>
        <div>
          <Button variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    )
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
        <Input label="Title" value={form.title} onChange={(e) => updateTitle(e.target.value)} error={showError('title')} />
        <Input label="Slug" value={form.slug} onChange={(e) => updateSlug(e.target.value)} error={showError('slug')}
          helperText="Lowercase words separated by hyphens, e.g. marina-gate-2-sea-view-2br" />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={descriptionId} className="text-sm font-medium text-ink">Description</label>
          <textarea
            id={descriptionId}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            aria-invalid={Boolean(showError('description'))}
            aria-describedby={showError('description') ? descriptionErrorId : undefined}
            className={`px-3.5 py-3 rounded-lg bg-surface border text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-line-focus ${
              showError('description') ? 'border-red-700' : 'border-line-strong'
            }`}
          />
          {showError('description') && (
            <div id={descriptionErrorId} className="text-xs text-red-700" role="alert">
              {showError('description')}
            </div>
          )}
        </div>
        <fieldset
          className="flex flex-col gap-2"
          data-invalid={showError('propertyType') ? 'true' : undefined}
          aria-describedby={showError('propertyType') ? propertyTypeErrorId : undefined}
        >
          <legend className="text-sm font-medium text-ink">Property type</legend>
          <div className="flex flex-wrap gap-4">
            {PROPERTY_TYPES.map(({ value, label }) => (
              <Radio
                key={value}
                name="propertyType"
                label={label}
                checked={form.propertyType === value}
                onChange={() => set('propertyType', value)}
              />
            ))}
          </div>
          {showError('propertyType') && (
            <div id={propertyTypeErrorId} className="text-xs text-red-700" role="alert">
              {showError('propertyType')}
            </div>
          )}
        </fieldset>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Bedrooms" type="number" min={0} value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} error={showError('bedrooms')} />
          <Input label="Bathrooms" type="number" min={0} step="0.5" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} error={showError('bathrooms')} />
          <Input label="Max guests" type="number" min={1} value={form.maxGuests} onChange={(e) => set('maxGuests', e.target.value)} error={showError('maxGuests')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Bed type" placeholder="e.g. Queen" value={form.bedType} onChange={(e) => set('bedType', e.target.value)} error={showError('bedType')} />
          <Input label="Number of beds" type="number" min={1} value={form.bedCount} onChange={(e) => set('bedCount', e.target.value)} error={showError('bedCount')} />
        </div>
      </section>

      <section className="flex flex-col gap-4 bg-surface border border-line rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-ink">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Area id" value={form.areaId} onChange={(e) => set('areaId', e.target.value)} error={showError('areaId')}
            helperText="Paste a known Area id — no area picker exists yet" />
          <Input label="City id" value={form.cityId} onChange={(e) => set('cityId', e.target.value)} error={showError('cityId')}
            helperText="Paste a known City id — no city picker exists yet" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Latitude" type="number" step="any" value={form.lat} onChange={(e) => set('lat', e.target.value)} error={showError('lat')} />
          <Input label="Longitude" type="number" step="any" value={form.lng} onChange={(e) => set('lng', e.target.value)} error={showError('lng')} />
        </div>
      </section>

      <section className="flex flex-col gap-4 bg-surface border border-line rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-ink">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Base price per night (AED)" type="number" min={0} value={form.basePriceAed} onChange={(e) => set('basePriceAed', e.target.value)} error={showError('basePriceAed')} />
          <Input label="Cleaning fee (AED)" type="number" min={0} value={form.cleaningFeeAed} onChange={(e) => set('cleaningFeeAed', e.target.value)} error={showError('cleaningFeeAed')}
            helperText="Optional" />
        </div>
        <Checkbox label="Allow instant booking" checked={form.isInstantBook} onChange={(e) => set('isInstantBook', e.target.checked)} />
      </section>

      <section className="flex flex-col gap-4 bg-surface border border-line rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-ink">DET & compliance</h2>
        <Input
          label="DET permit number"
          value={form.detPermitNumber}
          onChange={(e) => set('detPermitNumber', e.target.value)}
          error={showError('detPermitNumber')}
          helperText="Optional here — required before this listing can go live"
        />
        <Input
          label="Tourism Dirham Fee (AED per bedroom per night)"
          type="number"
          min={0}
          value={form.tdfPerBedroom}
          onChange={(e) => set('tdfPerBedroom', e.target.value)}
          error={showError('tdfPerBedroom')}
          helperText="Optional"
        />
      </section>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-700 rounded-lg p-4" role="alert">
          {error.message}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => navigate('/')}>
          Discard
        </Button>
        <Button variant="secondary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
