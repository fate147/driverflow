interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface backdrop-blur-md border border-white/20 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  )
}