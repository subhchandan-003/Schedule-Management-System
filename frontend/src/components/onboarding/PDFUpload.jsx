import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { usePDFParser } from '../../hooks/usePDFParser'
import { Spinner } from '../ui/Spinner'

export function PDFUpload({ section, onExtracted }) {
  const { parsePDF, loading, error } = usePDFParser()
  const [file, setFile] = useState(null)
  const [done, setDone] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    const f = acceptedFiles[0]
    setFile(f)
    const result = await parsePDF(f, section)
    if (result) {
      setDone(true)
      onExtracted(result.courses)
    }
  }, [parsePDF, section, onExtracted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: loading,
  })

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Upload your course confirmation</h2>
        <p className="text-slate-400 text-sm">
          Upload the PDF you received from IIM Sambalpur — we'll extract your enrolled courses automatically.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-slate-600 bg-surface hover:border-primary/60 hover:bg-primary/5'}
          ${loading ? 'pointer-events-none opacity-70' : ''}
          ${done ? 'border-emerald-500 bg-emerald-500/10' : ''}
        `}
      >
        <input {...getInputProps()} />
        {loading ? (
          <>
            <Spinner size="lg" />
            <p className="text-slate-300 text-sm">Extracting courses with AI…</p>
          </>
        ) : done ? (
          <>
            <CheckCircle size={40} className="text-emerald-400" />
            <p className="text-emerald-300 font-medium">Courses extracted!</p>
            <p className="text-slate-400 text-xs">{file?.name}</p>
          </>
        ) : file ? (
          <>
            <FileText size={40} className="text-primary" />
            <p className="text-slate-300 text-sm font-medium">{file.name}</p>
          </>
        ) : (
          <>
            <Upload size={40} className="text-slate-500" />
            <div className="text-center">
              <p className="text-slate-300 font-medium">Drop your PDF here</p>
              <p className="text-slate-500 text-sm mt-1">or click to browse</p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Section {section} • PDF only</span>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 w-full">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
