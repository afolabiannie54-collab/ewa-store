export default function AdminEmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-[72px] h-[72px] rounded-full bg-olive/10 flex items-center justify-center mb-5 text-olive">
        {icon}
      </div>
      <p className="font-display font-bold text-forest text-[22px] mb-2">{title}</p>
      {description && (
        <p className="text-[14px] text-forest/50 max-w-[260px] leading-relaxed">{description}</p>
      )}
    </div>
  )
}
