import React from 'react'
import { IoMdWallet as WalletIcon } from 'react-icons/io'

const WalletConnectReminder = ({ text, onClick, className }) => {
  return (
    <div className={`flex flex-row justify-center items-center ${className}`}>
      <div
        className='flex justify-center items-center mr-2 uppercase transition duration-300
                   font-medium text-xs text-c-tab cursor-pointer'
        onClick={onClick} >
        <WalletIcon className='w-5 h-5 mr-2' />
        connect
      </div >
      {text ? text : 'to continue'}
    </div >
  )
}

export default WalletConnectReminder