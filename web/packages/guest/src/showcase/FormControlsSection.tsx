import { useState } from 'react'
import { Input } from '../../../../shared/components/Input'
import { Checkbox } from '../../../../shared/components/Checkbox'
import { Radio } from '../../../../shared/components/Radio'
import { Switch } from '../../../../shared/components/Switch'
import { Tabs } from '../../../../shared/components/Tabs'
import { Section, Card } from './layout'

export function FormControlsSection() {
  const [checked, setChecked] = useState(true)
  const [radioValue, setRadioValue] = useState<'a' | 'b'>('a')
  const [switchOn, setSwitchOn] = useState(true)
  const [tabId, setTabId] = useState('upcoming')

  return (
    <Section title="Form controls">
      <Card className="grid grid-cols-4 gap-6">
        <Input label="Default" placeholder="Placeholder" helperText="Helper text" />
        <Input label="Focus" defaultValue="layla.ahmed@email.com" helperText="Helper text" />
        <Input label="Error" defaultValue="12345" error="Enter a valid DET permit number" />
        <Input label="Prefix / suffix" defaultValue="800" prefix="AED" suffix="per night" helperText="Before 5% VAT" />

        <div className="flex flex-col gap-3.5">
          <Checkbox label="Checkbox" checked={checked} onChange={() => setChecked((v) => !v)} />
          <Checkbox label="Checkbox" checked={!checked} onChange={() => setChecked((v) => !v)} />
        </div>

        <div className="flex flex-col gap-3.5">
          <Radio label="Radio" checked={radioValue === 'a'} onChange={() => setRadioValue('a')} name="demo-radio" />
          <Radio label="Radio" checked={radioValue === 'b'} onChange={() => setRadioValue('b')} name="demo-radio" />
        </div>

        <div className="flex flex-col gap-3.5">
          <Switch checked={switchOn} onChange={setSwitchOn} aria-label="Demo switch on" />
          <Switch checked={false} onChange={() => {}} aria-label="Demo switch off" />
        </div>

        <Tabs
          tabs={[
            { id: 'upcoming', label: 'Upcoming', count: 3 },
            { id: 'past', label: 'Past', count: 5 },
          ]}
          activeId={tabId}
          onChange={setTabId}
        />
      </Card>
    </Section>
  )
}
