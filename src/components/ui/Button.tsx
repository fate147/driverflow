interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
}

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50'
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90',
    secondary: 'bg-surface backdrop-blur-md border border-white/20 text-white',
    outline: 'border border-white/30 text-white hover:bg-white/10'
  }
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}