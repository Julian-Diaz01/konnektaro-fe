'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center  white-background text-center px-4">
      <div className="flex-grow flex items-center justify-center w-full">
        <div className="text-center">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Oops! The page you&#39;re looking for doesn&#39;t exist. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
      </div>
      
      <div className="w-full max-w-sm flex flex-col gap-4 mb-5">
        <Button 
          variant="outlinePrimary"
          onClick={handleGoHome}
          className="w-full h-[10vh] rounded-full font-semibold text-lg sm:text-xl flex items-center justify-center gap-2"
        >
          <Home size={20} />
          Go Home
        </Button>
      </div>
    </div>
  )
} 