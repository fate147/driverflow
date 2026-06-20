interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm text-muted">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-lg bg-surface backdrop-blur-md border border-white/20 
          text-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors
          ${className}`}
        {...props}
      />
    </div>
  )
}