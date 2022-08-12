import React, { useState } from 'react'
// import lightLogo from '../images/logo.svg'
// import darkLogo from '../images/logo.svg'
// import { ReactComponent as LogoIcon } from '../images/logo.svg'
import { SiFreelancer as LogoIcon } from 'react-icons/si'
import { IoMdWallet as WalletIcon } from 'react-icons/io'
import { ReactComponent as AdminWalletIcon } from '../images/AdminWallet.svg'
// import {MdManageAccounts as AdminIcon} from 'react-icons/md'
// import { FaUserCog as AdminIcon } from 'react-icons/fa'
// import { FaUser as UserIcon } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { AppNav, AppNavAdmin } from '../pages/AppNav'
import ThemeSwitch from './ThemeSwitch'
import { useThemeContext } from '../context/ThemeContext'
import { useWeb3Context } from '../context/Web3Context'

const TopBar = ({ openSideBar }) => {

  const { colorTheme } = useThemeContext()
  const {
    walletInstalled,
    connect,
    currentAccount,
    isAdmin,
  } = useWeb3Context()

  const connectToWallet = () => (
    <div className='pr-8 border-r border-c-weak'>
      <div
        className=' flex justify-center items-center pt-0.5 uppercase transition duration-300
                    font-medium text-xs text-c-nav border-c-btn hover:text-c-nav-h cursor-pointer'
        onClick={connect} >
        <WalletIcon className='w-6 h-6 mr-2' />
        connect
      </div>
    </div>
  )

  const [logoText, setLogoText] = useState('reedex')
  const [
    walletAddrDisplay, setWalletAddrDisplay
  ] = useState(('walletAddrDisplay' in localStorage) ? localStorage.walletAddrDisplay : 'default')

  const walletAddr = (addr) => {
    if (walletAddrDisplay === 'default') return addr.substring(0, 6) + '...' + addr.substr(-4)
    else if (walletAddrDisplay === 'blind') return '0x****...****'
    else if (walletAddrDisplay === 'long') return addr
  }

  const ConnectedAddress = () => (
    <div className='pr-8 border-r border-c-weak'>
      <div className='flex flex-row justify-between items-center text-sm'>
        {isAdmin ? <AdminWalletIcon className='w-6 h-6 mr-2' /> : <WalletIcon className='w-6 h-6 mr-2' />}
        <div className='cursor-pointer select-none'
          onClick={() => {
            const v = walletAddrDisplay === 'default' ? 'blind' : 'default'
            setWalletAddrDisplay(v)
            localStorage.walletAddrDisplay = v
            // if (walletAddrDisplay === 'default') setWalletAddrDisplay('blind')
            // else if (walletAddrDisplay === 'blind') setWalletAddrDisplay('default')
            // else if (walletAddrDisplay === 'long') setWalletAddrDisplay('default')
          }}
        >
          {walletAddr(currentAccount)}
        </div>
        {/* {isAdmin ? <AdminIcon className='w-4 h-4 mx-2' /> : <UserIcon className='w-3.5 h-3.5 mx-2' />} */}
      </div>
    </div>
  )

  return (
    <div className='py-5 px-10 flex justify-between items-center shadow-sm 
                    text-c-nav border-b border-c-nav' >
      <Link to='/'>
        {/* <img src={colorTheme === 'dark' ? darkLogo : lightLogo} alt='' className='w-20 h-20' /> */}
        <div className='relative flex justify-center items-end hover:text-c-nav-h transition duration-300'
          onPointerEnter={() => setLogoText('reedom')}
          onPointerLeave={() => setLogoText('reedex')}>
          <LogoIcon className='w-12 h-12 ml-0 -rotate-6' />
          <span className='absolute left-[65%] bottom-[5%] text-3xl italic fron-bold'>{logoText}</span>
        </div>
      </Link>
      <div className='flex justify-end items-center gap-4'>

        {walletInstalled && !currentAccount && connectToWallet()}
        {walletInstalled && currentAccount && ConnectedAddress()}

        <div className='cursor-pointer md:hidden pl-4' onClick={openSideBar}>
          {/* <FaBars className='w-8 h-8' /> */}
          <svg className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div className='hidden md:flex font-medium text-md'>
          {
            isAdmin && AppNavAdmin.map((item, index) => (
              <Link key={item.title} className='p-4 hover:text-c-nav-h transition duration-300' to={item.path}>
                {item.title}
              </Link>
            ))
          }
          {
            AppNav.map((item, index) => (
              <Link key={index} className='p-4 hover:text-c-nav-h transition duration-300' to={item.path}>
                {item.title}
              </Link>
            ))
          }
          <div className='m-4 w-6 h-6'>
            < ThemeSwitch />
          </div>
        </div>
      </div>
    </div >
  )
}

export default TopBar
