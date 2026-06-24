export default function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-[12px] font-medium text-error mt-1.5">{message}</p>
  )
}