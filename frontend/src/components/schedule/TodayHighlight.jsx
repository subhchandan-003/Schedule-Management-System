export function TodayHighlight({ children }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-xl bg-primary/5 ring-1 ring-primary/30 pointer-events-none" />
      {children}
    </div>
  )
}
