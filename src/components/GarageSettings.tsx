'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Building2,
  DollarSign,
  Clock,
  Bell,
  FileText,
  Wrench,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkshopProfile {
  name: string;
  legalName: string;
  nif: string;          // Número de Identificação Fiscal
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  licenceNumber: string;
}

interface BusinessSettings {
  currency: string;
  vatRate: number;       // %
  labourRateStandard: number;
  labourRatePriority: number;
  invoicePrefix: string;
  quotePrefix: string;
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
  paymentTermsDays: number;
  appointmentSlotMinutes: number;
}

interface WorkingHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

interface NotificationSettings {
  appointmentReminderHours: number;
  sendSmsReminders: boolean;
  sendEmailReminders: boolean;
  notifyOnNewAppointment: boolean;
  notifyOnJobComplete: boolean;
  adminEmail: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: WorkshopProfile = {
  name: 'AutoGP Luanda — Sede',
  legalName: 'AutoGP Lda.',
  nif: '5417891234',
  address: 'Rua Comandante Gika, 45',
  city: 'Luanda',
  country: 'Angola',
  phone: '+244 923 456 789',
  email: 'luanda@autogp.ao',
  website: 'www.autogp.ao',
  licenceNumber: 'OF-2022-001',
};

const DEFAULT_BUSINESS: BusinessSettings = {
  currency: 'AOA',
  vatRate: 14,
  labourRateStandard: 4500,
  labourRatePriority: 7000,
  invoicePrefix: 'FT',
  quotePrefix: 'OR',
  nextInvoiceNumber: 1001,
  nextQuoteNumber: 501,
  paymentTermsDays: 30,
  appointmentSlotMinutes: 60,
};

const DEFAULT_HOURS: WorkingHours[] = [
  { day: 'Monday',    open: true,  from: '08:00', to: '18:00' },
  { day: 'Tuesday',   open: true,  from: '08:00', to: '18:00' },
  { day: 'Wednesday', open: true,  from: '08:00', to: '18:00' },
  { day: 'Thursday',  open: true,  from: '08:00', to: '18:00' },
  { day: 'Friday',    open: true,  from: '08:00', to: '18:00' },
  { day: 'Saturday',  open: true,  from: '08:00', to: '13:00' },
  { day: 'Sunday',    open: false, from: '09:00', to: '13:00' },
];

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  appointmentReminderHours: 24,
  sendSmsReminders: false,
  sendEmailReminders: true,
  notifyOnNewAppointment: true,
  notifyOnJobComplete: true,
  adminEmail: 'luanda@autogp.ao',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <label className="text-sm font-medium text-slate-700 text-right">{label}</label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GarageSettings() {
  const [profile, setProfile]             = useState<WorkshopProfile>(DEFAULT_PROFILE);
  const [business, setBusiness]           = useState<BusinessSettings>(DEFAULT_BUSINESS);
  const [hours, setHours]                 = useState<WorkingHours[]>(DEFAULT_HOURS);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [saved, setSaved]                 = useState(false);

  const p = <K extends keyof WorkshopProfile>(k: K, v: WorkshopProfile[K]) =>
    setProfile(prev => ({ ...prev, [k]: v }));
  const b = <K extends keyof BusinessSettings>(k: K, v: BusinessSettings[K]) =>
    setBusiness(prev => ({ ...prev, [k]: v }));
  const n = <K extends keyof NotificationSettings>(k: K, v: NotificationSettings[K]) =>
    setNotifications(prev => ({ ...prev, [k]: v }));

  const updateHour = <K extends keyof WorkingHours>(index: number, key: K, value: WorkingHours[K]) =>
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [key]: value } : h));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setBusiness(DEFAULT_BUSINESS);
    setHours(DEFAULT_HOURS);
    setNotifications(DEFAULT_NOTIFICATIONS);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Garage Settings
          </h1>
          <p className="text-slate-500 mt-1">Configure your workshop profile, rates, hours, and notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1.5" /> Reset
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-300" /> Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-1.5 text-xs">
            <DollarSign className="h-3.5 w-3.5" /> Business
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5" /> Hours
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* ── Workshop Profile ─────────────────────────────────────── */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Section
            title="Workshop Identity"
            description="Display name and legal details printed on invoices and quotes"
          >
            <FieldRow label="Workshop Name">
              <Input value={profile.name} onChange={e => p('name', e.target.value)} />
            </FieldRow>
            <FieldRow label="Legal Name">
              <Input value={profile.legalName} onChange={e => p('legalName', e.target.value)} />
            </FieldRow>
            <FieldRow label="NIF (Tax ID)">
              <Input value={profile.nif} onChange={e => p('nif', e.target.value)} placeholder="Número de Identificação Fiscal" />
            </FieldRow>
            <FieldRow label="Licence Number">
              <Input value={profile.licenceNumber} onChange={e => p('licenceNumber', e.target.value)} />
            </FieldRow>
          </Section>

          <Section title="Contact & Location">
            <FieldRow label="Address">
              <Input value={profile.address} onChange={e => p('address', e.target.value)} />
            </FieldRow>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium text-slate-700 text-right">City / Country</label>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <Input value={profile.city} onChange={e => p('city', e.target.value)} placeholder="City" />
                <Input value={profile.country} onChange={e => p('country', e.target.value)} placeholder="Country" />
              </div>
            </div>
            <FieldRow label="Phone">
              <Input value={profile.phone} onChange={e => p('phone', e.target.value)} placeholder="+244 9xx xxx xxx" />
            </FieldRow>
            <FieldRow label="Email">
              <Input type="email" value={profile.email} onChange={e => p('email', e.target.value)} />
            </FieldRow>
            <FieldRow label="Website">
              <Input value={profile.website} onChange={e => p('website', e.target.value)} placeholder="www.example.ao" />
            </FieldRow>
          </Section>
        </TabsContent>

        {/* ── Business Settings ────────────────────────────────────── */}
        <TabsContent value="business" className="space-y-4 mt-4">
          <Section
            title="Currency & Tax"
            description="Applied to all invoices and quotes"
          >
            <FieldRow label="Currency">
              <div className="flex gap-2">
                {['AOA', 'USD', 'EUR'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => b('currency', c)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      business.currency === c
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="VAT Rate (%)">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={business.vatRate}
                  onChange={e => b('vatRate', Number(e.target.value))}
                  className="w-28"
                />
                <Badge variant="outline" className="text-xs">{business.vatRate}% IVA</Badge>
              </div>
            </FieldRow>
            <FieldRow label="Payment Terms">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  value={business.paymentTermsDays}
                  onChange={e => b('paymentTermsDays', Number(e.target.value))}
                  className="w-28"
                />
                <span className="text-sm text-slate-500">days</span>
              </div>
            </FieldRow>
          </Section>

          <Section
            title="Labour Rates"
            description="Hourly rates billed to customers (excluding VAT)"
          >
            <FieldRow label={`Standard Rate (${business.currency}/h)`}>
              <Input
                type="number"
                min={0}
                value={business.labourRateStandard}
                onChange={e => b('labourRateStandard', Number(e.target.value))}
                className="w-40"
              />
            </FieldRow>
            <FieldRow label={`Priority Rate (${business.currency}/h)`}>
              <Input
                type="number"
                min={0}
                value={business.labourRatePriority}
                onChange={e => b('labourRatePriority', Number(e.target.value))}
                className="w-40"
              />
            </FieldRow>
          </Section>

          <Section
            title="Document Numbering"
            description="Prefix and starting number for invoices and quotes"
          >
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium text-slate-700 text-right">Invoice</label>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Prefix</p>
                  <Input value={business.invoicePrefix} onChange={e => b('invoicePrefix', e.target.value)} placeholder="FT" className="w-28" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Next Number</p>
                  <Input
                    type="number"
                    min={1}
                    value={business.nextInvoiceNumber}
                    onChange={e => b('nextInvoiceNumber', Number(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium text-slate-700 text-right">Quote / Order</label>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Prefix</p>
                  <Input value={business.quotePrefix} onChange={e => b('quotePrefix', e.target.value)} placeholder="OR" className="w-28" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Next Number</p>
                  <Input
                    type="number"
                    min={1}
                    value={business.nextQuoteNumber}
                    onChange={e => b('nextQuoteNumber', Number(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
            </div>
            <FieldRow label="Appointment Slot">
              <div className="flex gap-2">
                {[30, 60, 90, 120].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => b('appointmentSlotMinutes', m)}
                    className={`px-3 py-1.5 rounded-lg text-sm border-2 transition-all ${
                      business.appointmentSlotMinutes === m
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </FieldRow>
          </Section>
        </TabsContent>

        {/* ── Working Hours ────────────────────────────────────────── */}
        <TabsContent value="hours" className="mt-4">
          <Section
            title="Working Hours"
            description="Set opening hours for each day of the week"
          >
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-[140px_1fr_1fr_1fr] items-center gap-3 pb-1 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Day</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Open</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">From</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">To</span>
              </div>

              {hours.map((h, i) => (
                <div key={h.day} className="grid grid-cols-[140px_1fr_1fr_1fr] items-center gap-3">
                  <span className={`text-sm font-medium ${h.open ? 'text-slate-700' : 'text-slate-400'}`}>
                    {h.day}
                  </span>
                  <Toggle checked={h.open} onChange={v => updateHour(i, 'open', v)} />
                  <Input
                    type="time"
                    value={h.from}
                    disabled={!h.open}
                    onChange={e => updateHour(i, 'from', e.target.value)}
                    className="w-32 disabled:opacity-40"
                  />
                  <Input
                    type="time"
                    value={h.to}
                    disabled={!h.open}
                    onChange={e => updateHour(i, 'to', e.target.value)}
                    className="w-32 disabled:opacity-40"
                  />
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>

        {/* ── Notifications ────────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Section
            title="Customer Reminders"
            description="Automatic reminders sent to customers before their appointment"
          >
            <FieldRow label="Reminder lead time">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={notifications.appointmentReminderHours}
                  onChange={e => n('appointmentReminderHours', Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-slate-500">hours before</span>
              </div>
            </FieldRow>
            <FieldRow label="Email reminders">
              <Toggle checked={notifications.sendEmailReminders} onChange={v => n('sendEmailReminders', v)} />
            </FieldRow>
            <FieldRow label="SMS reminders">
              <div className="flex items-center gap-3">
                <Toggle checked={notifications.sendSmsReminders} onChange={v => n('sendSmsReminders', v)} />
                {notifications.sendSmsReminders && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Requires SMS provider</Badge>
                )}
              </div>
            </FieldRow>
          </Section>

          <Section
            title="Internal Alerts"
            description="Notifications sent to the admin / workshop team"
          >
            <FieldRow label="Admin email">
              <Input
                type="email"
                value={notifications.adminEmail}
                onChange={e => n('adminEmail', e.target.value)}
                className="max-w-xs"
              />
            </FieldRow>
            <FieldRow label="New appointment">
              <Toggle checked={notifications.notifyOnNewAppointment} onChange={v => n('notifyOnNewAppointment', v)} />
            </FieldRow>
            <FieldRow label="Job completed">
              <Toggle checked={notifications.notifyOnJobComplete} onChange={v => n('notifyOnJobComplete', v)} />
            </FieldRow>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
