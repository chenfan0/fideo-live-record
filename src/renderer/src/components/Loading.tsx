import { useLoadingStore } from '@/store/useLoadingStore'

export default function Loading() {
  const { loading } = useLoadingStore()

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[9999] dark:bg-white dark:bg-opacity-50">
          <div className="w-10 h-10 border-t-2 border-b-2 border-white rounded-full animate-spin dark:border-black"></div>
        </div>
      )}
    </>
  )
}
