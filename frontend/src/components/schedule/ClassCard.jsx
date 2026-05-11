import { useState } from 'react'
import { MapPin, User, Hash, Clock, X, Phone, Mail } from 'lucide-react'
import { getCourseColor } from '../../lib/courseColors'

function Modal({ entry, course, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-surface border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={18} />
        </button>

        <div className="flex items-start gap-3 mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}
            style={{ backgroundColor: getCourseColor(entry.course_code).dot.replace('bg-', '') }}>
            {entry.course_code}
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg leading-tight">
              {course?.full_name || entry.course_name_raw || entry.course_code}
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Session {entry.session_number || '?'} of {course?.total_sessions || '?'}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {course?.faculty && (
            <div className="flex items-center gap-2 text-slate-300">
              <User size={14} className="text-slate-500" />
              <span>{course.faculty}</span>
              {course.faculty_email && (
                <a href={`mailto:${course.faculty_email}`} className="text-primary hover:underline ml-auto text-xs">
                  <Mail size={12} className="inline mr-0.5" />email
                </a>
              )}
            </div>
          )}
          {course?.classroom && (
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={14} className="text-slate-500" />
              <span>Room {course.classroom}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={14} className="text-slate-500" />
            <span>{entry.slot_start} – {entry.slot_end}</span>
            <span className="text-slate-500 ml-auto text-xs">{entry.slot_label}</span>
          </div>
          {course?.credits && (
            <div className="flex items-center gap-2 text-slate-300">
              <Hash size={14} className="text-slate-500" />
              <span>{course.credits} credits • {course.area || entry.section}</span>
            </div>
          )}
          {course?.group_email && (
            <div className="mt-4 pt-3 border-t border-slate-700">
              <button
                onClick={() => { navigator.clipboard.writeText(course.group_email) }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Mail size={12} />
                {course.group_email}
                <span className="text-slate-600 ml-1">• click to copy</span>
              </button>
            </div>
          )}
          {(course?.cr_a_name || course?.cr_b_name) && (
            <div className="mt-2 pt-3 border-t border-slate-700 space-y-1.5">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">CR Contacts</p>
              {course.cr_a_name && (
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span><span className="text-slate-500">A:</span> {course.cr_a_name}</span>
                  {course.cr_a_phone && (
                    <a href={`tel:${course.cr_a_phone}`} className="text-primary flex items-center gap-0.5">
                      <Phone size={10} />{course.cr_a_phone}
                    </a>
                  )}
                </div>
              )}
              {course.cr_b_name && (
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span><span className="text-slate-500">B:</span> {course.cr_b_name}</span>
                  {course.cr_b_phone && (
                    <a href={`tel:${course.cr_b_phone}`} className="text-primary flex items-center gap-0.5">
                      <Phone size={10} />{course.cr_b_phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ClassCard({ entry, course, isToday, isPast, isNext, compact = false }) {
  const [open, setOpen] = useState(false)
  const color = getCourseColor(entry.course_code)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full text-left rounded-lg border px-2.5 py-2 transition-all duration-150 group hover:shadow-md hover:-translate-y-0.5
          ${color.bg} ${color.border}
          ${isPast ? 'opacity-40' : ''}
          ${isNext ? 'ring-2 ring-emerald-400/60' : ''}
          ${isToday && !isPast ? 'shadow-sm' : ''}
        `}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {isNext && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow flex-shrink-0" />}
            <span className={`font-bold text-xs ${color.text} truncate`}>{entry.course_code}</span>
          </div>
          {entry.session_number && (
            <span className="text-slate-500 text-[10px] flex-shrink-0">#{entry.session_number}</span>
          )}
        </div>
        {!compact && (
          <p className="text-slate-300 text-[11px] leading-tight mt-0.5 line-clamp-2 group-hover:text-slate-200">
            {course?.full_name || entry.course_name_raw || ''}
          </p>
        )}
        {!compact && course?.faculty && (
          <p className="text-slate-500 text-[10px] mt-1 truncate">{course.faculty}</p>
        )}
        {!compact && course?.classroom && (
          <p className="text-slate-500 text-[10px] flex items-center gap-0.5">
            <MapPin size={9} />{course.classroom}
          </p>
        )}
      </button>

      {open && <Modal entry={entry} course={course} onClose={() => setOpen(false)} />}
    </>
  )
}
