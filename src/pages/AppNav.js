import React from 'react'
import * as FaIcons from 'react-icons/fa'
import * as AiIcons from 'react-icons/ai'
import * as IoIcons from 'react-icons/io'

import MarketPage from './MarketPage'
// import Page from './Page'
import TradePage from './TradePage'
import AnalyticsPage from './AnalyticsPage'
import AdminPage from './AdminPage'

export const AppNav = [
  {
    title: 'Market',
    path: '/',
    icon: <AiIcons.AiFillHome />,
    page: MarketPage,
  },
  {
    title: 'Trade',
    path: '/trade',
    arg: 'ticker',
    icon: <IoIcons.IoMdPeople />,
    page: TradePage,
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: <IoIcons.IoMdPeople />,
    page: AnalyticsPage,
  },
  // {
  //   title: 'About',
  //   path: 'about',
  //   icon: <FaIcons.FaEnvelopeOpenText />,
  //   page: Page,
  // },
  // {
  //   title: 'Contact',
  //   path: 'contact',
  //   icon: <FaIcons.FaEnvelopeOpenText />,
  //   page: Page,
  // }
]

export const AppNavAdmin = [
  {
    title: 'Admin',
    path: '/admin',
    icon: <IoIcons.IoMdPeople />,
    page: AdminPage,
  },
]
