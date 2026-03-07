export default function Container({ children, className = "" }) {
  return (
    <div className={`max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}