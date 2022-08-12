import React, { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppNav, AppNavAdmin } from './pages/AppNav'
import { AppConsts } from './Consts'
import TopBar from './components/TopBar'
import SideBar from './components/SideBar'
import BackgroundEffect from './components/BackgroundEffect'
import { Web3ContextProvider } from './context/Web3Context'
import { useThemeContext } from './context/ThemeContext'

function App() {
  const { colorTheme } = useThemeContext()
  const [screenShrinked, setScreenShrinked] = useState(false)
  const [sideBarOpened, setSideBarOpened] = useState(false)
  const openSideBar = () => setSideBarOpened(true)
  const closeSideBar = () => setSideBarOpened(false)

  const sideBarRef = useRef()
  useEffect(() => {
    const onWindowResized = () => {
      if (window.innerWidth > 768) {
        setScreenShrinked(false)
        closeSideBar()
      }
    }
    const onClicked = (event) => {
      if (!sideBarRef.current.contains(event.target)) {
        closeSideBar()
      }
    }
    window.addEventListener('resize', onWindowResized)
    document.addEventListener('mousedown', onClicked)
    return () => {
      window.removeEventListener('resize', onWindowResized)
      document.removeEventListener('mousedown', onClicked)
    }
  })

  const routeMap = (navMap) => navMap.map((item, index) => (
    <Route
      key={index}
      exact
      path={item.path}
      element={<item.page pageContent={item.title} />} >
      {item.arg ? (<Route path={':' + item.arg} element={<item.page />} />) : ''}
    </Route>
  ))

  return (
    <BrowserRouter>
      <Web3ContextProvider>
        <div id={AppConsts.id} color-theme={colorTheme} className='absolute w-full min-h-full bg-gradient-to-tl from-c-gr-f to-c-gr-t'>
          <TopBar shrinked={screenShrinked} openSideBar={openSideBar} />
          <SideBar eventRef={sideBarRef} opened={sideBarOpened} close={closeSideBar} />
          <BackgroundEffect />
          <Routes>
            {routeMap(AppNavAdmin)}
            {routeMap(AppNav)}
          </Routes>
        </div>
      </Web3ContextProvider>
    </BrowserRouter>
  );
}

export default App
