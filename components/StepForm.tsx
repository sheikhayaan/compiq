'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  companyName: string
  role: string
  level: string
  yearsExp: string
  location: string
  country: string
  currency: string
  baseSalary: string
  bonus: string
  equity: string
}

const COMPANIES = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple',
  'Netflix', 'Uber', 'Airbnb', 'Stripe', 'Flipkart',
  'Infosys', 'TCS', 'Swiggy', 'Razorpay', 'Zepto',
]

const ROLES = [
  'Software Engineer', 'Senior Software Engineer',
  'Staff Engineer', 'Principal Engineer',
  'Engineering Manager', 'Product Manager',
  'Data Scientist', 'Frontend Engineer',
  'Backend Engineer', 'DevOps Engineer',
  'Mobile Engineer', 'ML Engineer',
]

const LEVELS: Record<string, string[]> = {
  Google: ['L3', 'L4', 'L5', 'L6', 'L7'],
  Meta: ['E3', 'E4', 'E5', 'E6', 'E7'],
  Amazon: ['L4', 'L5', 'L6', 'L7', 'L8'],
  Microsoft: ['59', '60', '62', '63', '65'],
  Apple: ['ICT2', 'ICT3', 'ICT4', 'ICT5', 'ICT6'],
  default: ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'],
}

export default function StepForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [form, setForm] = useState<FormData>({
    companyName: '',
    role: '',
    level: '',
    yearsExp: '',
    location: '',
    country: 'US',
    currency: 'USD',
    baseSalary: '',
    bonus: '',
    equity: '',
  })

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'companyName') setShowCompanyDropdown(true)
  }

  const filteredCompanies = COMPANIES.filter((company) =>
    company.toLowerCase().includes(form.companyName.toLowerCase())
  )
  const levels = LEVELS[form.companyName] || LEVELS.default
  const totalComp =
    (parseFloat(form.baseSalary) || 0) +
    (parseFloat(form.bonus) || 0) +
    (parseFloat(form.equity) || 0)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          role: form.role,
          level: form.level,
          yearsExp: form.yearsExp ? parseInt(form.yearsExp, 10) : undefined,
          location: form.location,
          country: form.country,
          currency: form.currency,
          baseSalary: parseFloat(form.baseSalary),
          bonus: parseFloat(form.bonus) || 0,
          equity: parseFloat(form.equity) || 0,
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (res.status === 201) {
        setSuccess(true)
        window.setTimeout(() => router.push('/salaries'), 2000)
      } else if (res.status === 409) {
        setError('You already submitted this salary recently.')
      } else {
        setError(data.error || 'Submission failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50'
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  if (success) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl text-indigo-300">Done</div>
        <h3 className="text-2xl font-bold text-white">Salary Submitted!</h3>
        <p className="text-slate-400">
          Thank you for helping the community. Redirecting to salaries...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-indigo-400 font-semibold">STEP {step} OF 3</span>
          <span className="text-white font-medium">
            {step === 1 ? 'Role Info' : step === 2 ? 'Compensation' : 'Review & Submit'}
          </span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(step / 3) * 100}%`,
              background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
            }}
          />
        </div>
        <div className="flex justify-between">
          {['Role Info', 'Compensation', 'Review & Submit'].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background:
                    step > i
                      ? 'linear-gradient(135deg, #6366f1, #22d3ee)'
                      : step === i + 1
                        ? 'rgba(99,102,241,0.3)'
                        : 'rgba(255,255,255,0.05)',
                  border: step === i + 1 ? '2px solid #6366f1' : '2px solid transparent',
                  color: step >= i + 1 ? 'white' : '#64748b',
                }}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? 'text-white font-medium' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: 'rgba(17,17,24,0.8)',
          border: '1px solid rgba(30,30,46,1)',
        }}
      >
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Role Information</h3>
            <div className="relative">
              <label className="block text-sm text-slate-400 mb-2">Company Name *</label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="e.g. Google, Meta, Amazon..."
                value={form.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                onFocus={() => setShowCompanyDropdown(true)}
                onBlur={() => window.setTimeout(() => setShowCompanyDropdown(false), 200)}
              />
              {showCompanyDropdown && form.companyName && filteredCompanies.length > 0 && (
                <div
                  className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(17,17,24,0.98)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  {filteredCompanies.map((company) => (
                    <button
                      key={company}
                      type="button"
                      className="w-full text-left px-4 py-3 text-white hover:bg-indigo-500/20 transition-colors text-sm"
                      onClick={() => {
                        update('companyName', company)
                        setShowCompanyDropdown(false)
                      }}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Job Title *</label>
              <select className={inputClass} style={inputStyle} value={form.role} onChange={(e) => update('role', e.target.value)}>
                <option value="" style={{ background: '#111118' }}>Select role...</option>
                {ROLES.map((role) => (
                  <option key={role} value={role} style={{ background: '#111118' }}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Level *
                {form.companyName && <span className="text-indigo-400 ml-2">({form.companyName} levels)</span>}
              </label>
              <select className={inputClass} style={inputStyle} value={form.level} onChange={(e) => update('level', e.target.value)}>
                <option value="" style={{ background: '#111118' }}>Select level...</option>
                {levels.map((level) => (
                  <option key={level} value={level} style={{ background: '#111118' }}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Years of Experience</label>
              <input type="number" min="0" max="40" className={inputClass} style={inputStyle} placeholder="e.g. 5" value={form.yearsExp} onChange={(e) => update('yearsExp', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">City *</label>
                <input className={inputClass} style={inputStyle} placeholder="e.g. San Francisco" value={form.location} onChange={(e) => update('location', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Country *</label>
                <select
                  className={inputClass}
                  style={inputStyle}
                  value={form.country}
                  onChange={(e) => {
                    update('country', e.target.value)
                    update('currency', e.target.value === 'IN' ? 'INR' : 'USD')
                  }}
                >
                  <option value="US" style={{ background: '#111118' }}>United States</option>
                  <option value="IN" style={{ background: '#111118' }}>India</option>
                  <option value="UK" style={{ background: '#111118' }}>United Kingdom</option>
                  <option value="CA" style={{ background: '#111118' }}>Canada</option>
                  <option value="SG" style={{ background: '#111118' }}>Singapore</option>
                  <option value="AU" style={{ background: '#111118' }}>Australia</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Compensation Details</h3>
            <div className="px-4 py-3 rounded-xl text-sm text-slate-400" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              All amounts in {form.currency}. Equity is annual vesting value. Bonus and equity default to 0 if left empty.
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Base Salary * ({form.currency})</label>
              <input type="number" min="0" className={inputClass} style={inputStyle} placeholder={form.currency === 'INR' ? 'e.g. 2500000 (25L)' : 'e.g. 185000'} value={form.baseSalary} onChange={(e) => update('baseSalary', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Annual Bonus ({form.currency}) <span className="text-slate-600 ml-1">optional</span></label>
              <input type="number" min="0" className={inputClass} style={inputStyle} placeholder="0" value={form.bonus} onChange={(e) => update('bonus', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Annual Equity / RSUs ({form.currency}) <span className="text-slate-600 ml-1">optional</span></label>
              <input type="number" min="0" className={inputClass} style={inputStyle} placeholder="0" value={form.equity} onChange={(e) => update('equity', e.target.value)} />
            </div>
            {totalComp > 0 && (
              <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))', border: '1px solid rgba(99,102,241,0.3)' }}>
                <div className="text-sm text-slate-400 mb-1">Total Compensation (auto-calculated)</div>
                <div className="text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {form.currency === 'INR' ? `₹${(totalComp / 100000).toFixed(1)}L` : `$${totalComp.toLocaleString()}`}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Review & Submit</h3>
            <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { label: 'Company', value: form.companyName },
                { label: 'Role', value: form.role },
                { label: 'Level', value: form.level },
                { label: 'Experience', value: form.yearsExp ? `${form.yearsExp} years` : 'Not specified' },
                { label: 'Location', value: `${form.location}, ${form.country}` },
                { label: 'Base Salary', value: form.currency === 'INR' ? `₹${(parseFloat(form.baseSalary) / 100000).toFixed(1)}L` : `$${parseFloat(form.baseSalary).toLocaleString()}` },
                { label: 'Total Comp', value: form.currency === 'INR' ? `₹${(totalComp / 100000).toFixed(1)}L` : `$${totalComp.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center gap-4 py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-white font-medium text-sm text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-4 rounded-xl text-sm text-slate-400" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}>
              Your submission is completely anonymous. No personal data is stored with this entry.
            </div>
            {error && (
              <div className="p-4 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-4">
        {step > 1 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Back
          </button>
        )}
        <button
          type="button"
          onClick={() => (step < 3 ? setStep((s) => s + 1) : handleSubmit())}
          disabled={loading || (step === 1 && (!form.companyName || !form.role || !form.level || !form.location)) || (step === 2 && !form.baseSalary)}
          className="flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 20px rgba(99,102,241,0.3)',
          }}
        >
          {loading ? 'Submitting...' : step < 3 ? 'Continue' : 'Submit Salary'}
        </button>
      </div>
    </div>
  )
}
