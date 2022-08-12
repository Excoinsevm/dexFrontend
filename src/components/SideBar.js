import React from 'react'
import { Link } from 'react-router-dom'
import { AppNav, AppNavAdmin } from '../pages/AppNav'
import { AiOutlineClose as CloseIcon } from 'react-icons/ai'
import { useWeb3Context } from '../context/Web3Context'
import ThemeSwitch from './ThemeSwitch'

const SideBar = ({ eventRef, opened, close }) => {
  const {
    isAdmin,
  } = useWeb3Context()
  return (
    // <div ref={eventRef} className={opened ? 'font-medium rounded-l-2xl border-b-2 border-t-2 border-l-2 shadow-2xl \
    //                 justify-center items-center text-mydarkblue bg-myyellow fixed top-0 right-0 \
    //                 transition ease-in-out duration-400'
    //   : 'fixed top-0 -right-full translate-x-full ease-in-out duration-300'} >
    <div ref={eventRef}
      className={`font-medium rounded-l-2xl border-b-2 border-t-2 border-l-2 shadow-2xl z-10
                  justify-center items-center text-c-drawer bg-c-drawer fixed top-0 right-0
                  transition ${opened ? 'translate-x-0' : 'translate-x-full'} ease-in-out duration-300`}>
      <div className='h-16 pt-4 flex justify-center items-center'>
        <CloseIcon className='w-6 h-6 text-white cursor-pointer' onClick={close} />
      </div>
      <ul className='w-full pb-8'>
        {
          isAdmin && AppNavAdmin.map((item, index) => (
            <li key={index}>
              <Link key={index} className='' to={item.path}>
                <div className='py-3 px-16 block hover:bg-c-drawer-h'>
                  {item.title}
                </div>
              </Link>
            </li>
          ))
        }
        {
          AppNav.map((item, index) => (
            <li key={index}>
              <Link key={index} className='' to={item.path}>
                <div className='py-3 px-16 block hover:bg-c-drawer-h'>
                  {item.title}
                </div>
              </Link>
            </li>
          ))
        }
        <div className='m-4 w-6 h-6 pl-14'>
          <ThemeSwitch onSideBar='yes' />
        </div>
      </ul>
    </div >
  )
}

export default SideBar
