import React from 'react'
import ReactDom from 'react-dom'
import { ThemeContextProvider, useThemeContext } from '../context/ThemeContext'
import LoadingAnimation from './LoadingAnimation'

const LoadingOverlayer = ({ open, portal, size }) => {
  const { colorTheme } = useThemeContext()
  if (!open) return null
  if (portal) return ReactDom.createPortal(
    <ThemeContextProvider>
      <div color-theme={colorTheme} className='fixed top-0 left-0 right-0 bottom-0 bg-slate-800 z-50'>
        <div className='fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]'>
          <div className='flex flex-col justify-center items-center'>
            <LoadingAnimation className='w-32 h-32' />
          </div>
        </div>
      </div>
    </ThemeContextProvider >,
    document.getElementById('portal')
  )
  else return (
    <div className='w-full h-full z-50'>
      <div className='flex flex-col justify-center items-center'>
        <LoadingAnimation className={`w-32 h-32 ${size}`} />
      </div>
    </div>
  )
}

export default LoadingOverlayer
