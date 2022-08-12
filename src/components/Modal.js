import React from 'react'
import ReactDom from 'react-dom'
import { ThemeContextProvider, useThemeContext } from '../context/ThemeContext'

const Modal = ({ open, onClickOutside, children }) => {
  const { colorTheme } = useThemeContext()
  if (!open) return null
  return ReactDom.createPortal(
    <ThemeContextProvider>
      <div color-theme={colorTheme} className='fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 z-50'
        onClick={() => { if (onClickOutside) onClickOutside() }}>
        <div className='fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]'
          onClick={(e) => e.stopPropagation()}>
          <div className='pd-28 md:pd-48 rounded-2xl text-c-major bg-c-major z-50 animate-popup'>
            <div className='flex flex-col justify-center items-center w-full h-full'>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ThemeContextProvider >,
    document.getElementById('portal')
  )
}

export default Modal