export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 darK:bg-white/80 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
    </div>
  )
}
