import React, { useState } from 'react'
// import { ReactComponent as LogoAnimate } from '../images/logoAnimate.svg'
import LoadingAnimation from './LoadingAnimation'
import { MdError as WarningIcon } from 'react-icons/md'
import { BsExclamation as ExclamationIcon } from 'react-icons/bs'
import { MdCheck as CheckIcon } from 'react-icons/md'
import Button from './Button'
import { Progress } from './ModalProgress'

const WalletResponse = ({ progress, requestSnapshot, txResponse, onButtonClick }) => {

  const waitingWalletResponse = () => (
    <div className='flex flex-col justify-center items-center mt-'>
      {/* <LogoAnimate className='w-[5em] h-[3em]' /> */}
      <LoadingAnimation className='w-24 h-24' />
      <span className='mt-2'>Waiting wallet ...</span>
    </div>
  )

  const success = () => (
    <div className='flex flex-col justify-between items-center w-full h-full'>
      <div className='flex flex-col justify-start items-center mt-2 transition-all animate-popup'>
        <CheckIcon className='w-[2.5em] h-[2.5em] p-1 rounded-full text-c-major bg-c-btn-bullish' />
        <span className='mt-4 text-c-major'>Succeeded</span>
      </div>
      <Button
        text='DONE'
        onClicked={onButtonClick}
        color='bg-c-btn-bullish'
      />
    </div>
  )

  const tailorLongMsg = (msg) => (msg.length > 250) ? msg.substring(0, 250) + ' ...' : msg

  const errMsg = (response) => {
    // console.log(response)
    if (response.parsed) return (
      <div className='flex flex-col flex-wrap justify-start items-center w-full h-full break-all'>
        <div className='flex flex-row justify-start items-center w-full h-full'>
          <span className='w-14 mr-2 text-right'>Code: </span>
          <i className='text-c-tab font-medium'>{response.code}</i>
        </div><div className='flex flex-row justify-start items-center w-full h-full'>
          <span className='w-14 mr-2 text-right'>Reason:</span>
          <i className='text-c-tab font-medium'>{response.reason}</i>
        </div>
        {/* <span>Data: <i>{response.data}</i></span> */}
      </div>
    )
    else return (
      <div className='w-full h-full text-2xs break-all'>
        {tailorLongMsg(response.raw)}
      </div>
    )
  }

  const [hoverPopupIcon, setHoverPopupIcon] = useState(false)
  const [hoverPopupMsg, setHoverPopupMsg] = useState(false)

  const fail = () => (
    <div className='flex flex-col justify-between items-center w-full h-full'>
      {
        txResponse &&
        <div className='flex flex-col justify-start items-center mt-2 transition-all animate-popup'>
          <ExclamationIcon className='w-[2.5em] h-[2.5em] rounded-full text-c-major bg-c-bearish' />
          <div className='relative flex flex-row justify-start items-center mt-4'>
            Failed: <i className='mx-2 text-c-major'>{txResponse.reason}</i>
            <WarningIcon className='w-5 h-5 mt-0.5 rounded-full text-c-bearish cursor-pointer'
              onPointerEnter={() => setHoverPopupIcon(true)}
              onPointerLeave={() => setHoverPopupIcon(false)}
            />
            {(hoverPopupIcon || hoverPopupMsg) &&
              <div className='absolute right-0 bottom-[80%] w-full pb-2'
                onPointerEnter={() => setHoverPopupMsg(true)}
                onPointerLeave={() => setHoverPopupMsg(false)}
              >
                <div className='flex flex-col items-center rounded-md text-xs bg-c-minor2 
                              text-c-major px-2 py-2'>
                  {errMsg(txResponse)}
                  <div className='mt-2'><i>check your wallet for more info</i></div>
                </div>
              </div>
            }
          </div>
        </div>
      }
      <div className='mt-5 w-full'>
        <Button
          text='CLOSE'
          onClicked={onButtonClick}
          color='bg-c-btn-bearish'
        />
      </div>
    </div>
  )

  const walletStatusSkeleton = (children) => (
    <div className='flex flex-col justify-between items-center h-full'>
      {requestSnapshot}
      <div className='flex flex-col justify-start items-center w-full h-full text-c-minor'>
        {children}
      </div>
    </div>
  )

  // console.log('--->', progress)
  switch (progress) {
    case Progress.RequestSubmitted:
    case Progress.Processing: return (walletStatusSkeleton(waitingWalletResponse()))
    case Progress.Success: return (walletStatusSkeleton(success()))
    case Progress.Error: return (walletStatusSkeleton(fail()))
    default: return null
  }
}

export default WalletResponse
