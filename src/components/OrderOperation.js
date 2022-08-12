import React, { useEffect, useState } from 'react'
import { IoMdWallet as WalletIcon } from 'react-icons/io'
import { MdError as WarningIcon } from 'react-icons/md'
import TokenIcon from './TokenIcon'
import { Progress } from './ModalProgress'
import WalletResponse from './WalletResponse'
import { useWeb3Context } from '../context/Web3Context'

const OrderOperation = ({ order, onProgressUpdate }) => {

  // -------------------------------------------------
  // ------ external variable
  const {
    currentAccount,
    txResponse
  } = useWeb3Context()


  // -------------------------------------------------
  // ------ states variable
  const [progress, setProgress] = useState(Progress.RequestSubmitted)


  // -------------------------------------------------
  // ------ order operation reminder
  const tokenRender = (
    op,
    textStyle = 'text-sm text-c-major',
    iconDivStytle = 'w-6 h-6 mr-1',
    iconStyle = 'w-4 h-4'
  ) => (
    <div className='flex flex-row justify-center items-center text-xs text-c-minor'>
      <div className={`flex justify-center items-center rounded-full bg-c-minor2 ${iconDivStytle}`}>
        <TokenIcon name={op} className={iconStyle} />
      </div>
      <span className={textStyle}>{op}</span>
    </div>
  )

  const walletAccount = () => (
    <div className='flex flex-row flex-nowrap justify-center items-center text-sm'>
      <WalletIcon className='w-6 h-6 mr-1.5' />
      <div className='select-none'>
        {currentAccount.substring(0, 6) + '...' + currentAccount.substr(-4)}
      </div>
    </div>
  )

  const tagColor = (order) => {
    if (order.op === 'new') {
      if (order.side.toUpperCase() === 'SELL') return 'bg-c-bearish'
      else if (order.side.toUpperCase() === 'BUY') return 'bg-c-bullish'
    }
    else if (order.op === 'cancel') return 'bg-c-btn'
  }

  const tagText = (order) => {
    let ret = []
    if (order.side.toUpperCase() === 'SELL') ret = ['sell', 'in']
    else if (order.side.toUpperCase() === 'BUY') ret = ['buy', 'with']
    if (order.op === 'cancel') ret[0] = 'cancel ' + ret[0]
    return ret
  }

  const operationIndicator = () => (
    currentAccount &&
    <div className='flex flex-col justify-center items-center w-full py-3 pb-5 border-b border-c-weak2'>
      {walletAccount()}
      <div className='flex flex-row justify-center items-center w-full mt-3'>
        <div className={`pl-2 pr-3 py-0.5 mr-1 text-left border border-c-weak rounded-l-lg rounded-r-3xl
                         text-sm text-c-major whitespace-nowrap select-none ${tagColor(order)}`}>
          {tagText(order)[0]}
        </div>
        <div className='w-[5.6rem]'>
          {tokenRender(order.base)}
        </div>
        <div className='w-[2.2rem] text-center text-c-minor select-none'>
          {tagText(order)[1]}
        </div>
        <div className='w-[5.6rem]'>
          {tokenRender(order.quote)}
        </div>
      </div>
    </div>
    ||
    <div className='flex flex-row justify-center items-center w-full mt-5 pb-8 border-b border-c-weak2'>
      <WarningIcon className='w-6 h-6 text-c-minor' />
      <div className='ml-4 font-medium text-c-minor'>No wallet connected</div>
    </div>
  )


  // -------------------------------------------------
  // ------ button
  const onButtonClick = (name) => {
    if (name === 'DONE' || name === 'CLOSE') {
      updateProgress(Progress.Closed)
    } else { // only used for tx init here
      updateProgress(Progress.RequestSubmitted)
    }
  }


  // -------------------------------------------------
  // ------ wallet response
  const updateProgress = (p) => {
    setProgress(p)
    if (onProgressUpdate) onProgressUpdate(p)
  }

  useEffect(() => {
    if (progress !== Progress.WaitingInput) {
      if (txResponse.sts === 'processing') {
        updateProgress(Progress.Processing)
      }
      else if (txResponse.sts === 'success') {
        updateProgress(Progress.Success)
      }
      else {
        updateProgress(Progress.Error)
      }
    }
  }, [txResponse])


  // -------------------------------------------------
  // ------ progress view
  const requestSnapshot = () => (
    <div className='flex flex-row justify-center items-center w-fit py-4 px-16'>
      <div className='flex flex-col justify-start items-end w-full text-sm text-c-major'>
        {order.op === 'cancel' &&
          <div className='flex flex-row justify-end items-start w-full h-6 pt-1 pr-2'>
            ORDER ID :
          </div>
        }
        {order.type.toUpperCase() === 'LIMIT' &&
          <div className='flex flex-row justify-end items-start w-full h-14 pt-1 pr-2'>
            PRICE :
          </div>
        }
        <div className='flex flex-row justify-end items-start h-14 pt-1 pr-2'>
          AMOUNT :
        </div>
      </div>
      <div className='flex flex-col justify-start font-medium'>
        {order.op === 'cancel' &&
          <div className='flex flex-col justify-start items-start h-6'>
            <div className='flex flex-row justify-start pt-0.5 pl-2 text-c-tab'>
              {order.id}
            </div>
          </div>
        }
        {order.type.toUpperCase() === 'LIMIT' &&
          <div className='flex flex-col justify-start items-start h-14 '>
            <div className='flex flex-row justify-start pt-0.5 pl-2 text-c-tab'>
              {order.price}
            </div>
            <div className='scale-75'>
              {tokenRender(order.quote)}
            </div>
          </div>
        }
        <div className='flex flex-col justify-start items-start h-14'>
          <div className='flex flex-row justify-start pt-0.5 pl-2 text-c-tab'>
            {order.amount}
          </div>
          <div className='scale-75 flex justify-start'>
            {tokenRender(order.base)}
          </div>
        </div>
      </div>
    </div>
  )


  // -------------------------------------------------
  // ------ result
  return (
    <div className='flex flex-col justify-start items-center w-full h-full bg-c-major'>
      {operationIndicator()}
      <WalletResponse
        progress={progress} requestSnapshot={requestSnapshot()}
        txResponse={txResponse} onButtonClick={onButtonClick}
      />
    </div>
  )
}

export default OrderOperation
