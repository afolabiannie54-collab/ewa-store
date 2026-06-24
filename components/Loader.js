export default function Loader({ size = 'md', color = 'olive', className = '' }) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
  const gap = size === 'sm' ? 'gap-1' : size === 'lg' ? 'gap-2' : 'gap-1.5'
  const dotColor = color === 'cream' ? 'bg-cream' : 'bg-olive'

  return (
    <div className={`flex items-center justify-center ${gap} ${className}`} role="status" aria-label="Loading">
      <span className={`${dotSize} rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '0ms' }} />
      <span className={`${dotSize} rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '150ms' }} />
      <span className={`${dotSize} rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  )
}