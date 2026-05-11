import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { SectionPicker } from '../components/onboarding/SectionPicker'
import { PDFUpload } from '../components/onboarding/PDFUpload'
import { CourseSelector } from '../components/onboarding/CourseSelector'
import { useScheduleStore } from '../store/useScheduleStore'
import { MOCK_COURSES } from '../lib/mockData'

const STEPS = ['section', 'pdf', 'courses']

export default function Home() {
  const [step, setStep] = useState('section')
  const [extractedCourses, setExtractedCourses] = useState([])
  const { section, setEnrolledCourses, setOnboardingDone } = useScheduleStore()
  const navigate = useNavigate()

  const handleSection = () => setStep('pdf')
  const handleExtracted = (courses) => {
    setExtractedCourses(courses)
    setStep('courses')
  }
  const handleSkipPDF = () => setStep('courses')
  const handleConfirm = (courses) => {
    setEnrolledCourses(courses)
    setOnboardingDone(true)
    navigate('/schedule')
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Logo + title */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
              <BookOpen size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white">IIM Sambalpur</h1>
            <p className="text-slate-400 mt-1">MBA Schedule Platform · Batch 2024–26</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all ${
                  STEPS.indexOf(step) >= i ? 'bg-primary' : 'bg-slate-700'
                }`} />
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-800" />}
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === 'section' && <SectionPicker onSelect={handleSection} />}
          {step === 'pdf' && (
            <div className="flex flex-col gap-4">
              <PDFUpload section={section} onExtracted={handleExtracted} />
              <button
                onClick={handleSkipPDF}
                className="text-slate-500 hover:text-slate-300 text-sm text-center transition-colors"
              >
                Skip — I'll select courses manually →
              </button>
            </div>
          )}
          {step === 'courses' && (
            <CourseSelector
              extractedCourses={extractedCourses}
              allCourses={MOCK_COURSES}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-slate-700 text-xs">
        IIM Sambalpur · MBA 2024–26
      </div>
    </div>
  )
}
