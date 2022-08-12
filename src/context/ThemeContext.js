import React, { useEffect, useState, useContext } from 'react'

const ThemeContext = React.createContext()

export const useThemeContext = () => {
  return useContext(ThemeContext)
}

export const ThemeContextProvider = ({ children }) => {

  // ------ size
  // const screenSize = [
  //   // { name: 'xs', lv: 0, minWidth: 0, maxWidth: 480 },
  //   { name: 'sm', lv: 1, minWidth: 480, maxWidth: 768 },
  //   { name: 'md', lv: 2, minWidth: 768, maxWidth: 1024 },
  //   { name: 'lg', lv: 3, minWidth: 1024, maxWidth: 1280 },
  //   { name: 'xl', lv: 4, minWidth: 1280, maxWidth: 1536 },
  //   // { name: '2xl', lv: 5, minWidth: 1536, maxWidth: 1920 },
  // ]
  // // const [size, setSize] = useState([window.innerWidth, window.innerHeight])
  // const [sizeLv, setSizeLv] = useState([0, 0])
  // useEffect(() => {
  //   const updateSize = () => {
  //     let lv = 5
  //     for (const s of screenSize) {
  //       if (window.innerWidth <= s.maxWidth) { lv = s.lv; break; }
  //     }
  //     if (lv !== sizeLv[0]) { setSizeLv([lv, sizeLv[0]]) }
  //   }
  //   updateSize()
  //   window.addEventListener('resize', updateSize)
  //   return () => window.removeEventListener('resize', updateSize)
  // }, [])

  // ------ theme color
  const [colorTheme, setColorTheme] = useState(('theme' in localStorage) ? localStorage.theme : 'light')
  const toggleTheme = () => {
    // if (colorTheme === 'os') {
    //   setColorTheme('dark')
    // } else if (colorTheme === 'dark') {
    //   setColorTheme('light')
    // } else {
    //   setColorTheme('os')
    // }
    // if (colorTheme === 'os') {
    //   localStorage.removeItem('theme')
    // } else {
    //   localStorage.theme = colorTheme
    // }
    setColorTheme(colorTheme === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    if (colorTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.theme = colorTheme

    // // console.log('colorTheme:', colorTheme)
    // // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    // if (localStorage.theme === 'dark' ||
    //   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    //   document.documentElement.classList.add('dark')
    // } else {
    //   document.documentElement.classList.remove('dark')
    // }
  }, [colorTheme])

  return (
    <ThemeContext.Provider value={{
      colorTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
