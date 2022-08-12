import React, { useEffect } from 'react'
import LoadingAnimation from '../components/LoadingAnimation'

const AnalyticsPage = () => {
  useEffect(() => {
    document.title = 'Analytics'
  }, [])

  return (
    <div className="flex flex-col justify-center items-center pt-10">
      <h1 className="text-5xl text-c-heading uppercase font-bold ">
        Token Analytics
      </h1>
      <span className='my-5 text-xl text-c-heading lowercase'>coming soon ... </span>
      <LoadingAnimation className='w-32 h-32' />
    </div>
  )
}

export default AnalyticsPage