import React, { useState } from 'react'
import UserOpenOrder from './UserOpenOrder'
// import UserOrderHistory from './UserOrderHistory'
import UserTradeHistory from './UserTradeHistory'
import UserFunds from './UserFunds'
import Checkbox from './Checkbox'

const UserTradeDataGroup = ({ tradePair, base, quote }) => {

  const [hideOthers, setHideOthers] = useState(false)
  const [hideSmallAmount, setHideSmallAmount] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const tabComs = {
    'Open Order': <UserOpenOrder tradePair={tradePair} base={base} quote={quote} hideOthers={hideOthers} />,
    // 'Order History': <UserOrderHistory />,
    'Trade History': <UserTradeHistory tradePair={tradePair} base={base} quote={quote} hideOthers={hideOthers} />,
    'Funds': <UserFunds base={base} quote={quote} hideSmall={hideSmallAmount} hideOthers={hideOthers} />
  }
  const tabNames = Object.keys(tabComs)

  const controls = (index) => {
    return (
      <div className='flex flex-row justify-end'>
        <Checkbox className={`mr-6 ${index < 2 ? 'hidden' : ''}`} id='hideSmall' label='Hide small amount'
          onChange={(id, checked) => setHideSmallAmount(checked)} />
        <Checkbox className='mr-4' id='hideOthers' label='Hide others'
          onChange={(id, checked) => setHideOthers(checked)} />
      </div>
    )
  }

  const tabs = () => (
    <ul className='flex flex-nowrap px-4 pb-1 text-sm font-medium text-center text-c-btn-muted bg-c-major'>
      {
        tabNames.map((tab, index) => {
          return (
            <li key={index} className='mr-6'>
              <div className={'inline-block rounded-lg whitespace-nowrap cursor-pointer select-none ' +
                (activeTabIndex === index ? 'text-c-tab active' : 'hover:text-c-tab-muted-h')}
                onClick={() => setActiveTabIndex(index)}>
                {tab}
              </div>
            </li >
          )
        })
      }
    </ul>
  )

  const top = () => (
    <div className='flex flex-row justify-between items-center'>
      {tabs()}
      {controls(activeTabIndex)}
    </div>
  )

  return (
    <div className='flex flex-col w-full pt-4'>
      {top()}
      <div className='flex flex-row justify-around items-center mx-2'>
        {tabComs[tabNames[activeTabIndex]]}
      </div>
    </div>
  )
}

export default UserTradeDataGroup
