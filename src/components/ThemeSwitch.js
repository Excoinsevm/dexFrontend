import React from 'react'
import { useThemeContext } from '../context/ThemeContext'
import { IoSunnySharp as LightIcon, IoMoonSharp as DarkIcon } from 'react-icons/io5'

const ThemeSwitch = ({ onSideBar }) => {
  const { colorTheme, toggleTheme } = useThemeContext()
  return (
    <div className=''>
      {
        colorTheme === 'light' ?
          (<DarkIcon
            className={`w-6 h-6 scale-75 cursor-pointer transition duration-300
                        ${onSideBar ? ' text-c-drawer hover:text-c-drawer-h' : 'text-c-nav hover:text-c-nav-h'}`}
            onClick={toggleTheme}
          />) :
          (<LightIcon
            className={`w-6 h-6 cursor-pointer transition duration-300
                        ${onSideBar ? 'text-c-drawer hover:text-c-drawer-h' : 'text-c-nav hover:text-c-nav-h'}`}
            onClick={toggleTheme}
          />)
      }
    </div>
  )
}

export default ThemeSwitch