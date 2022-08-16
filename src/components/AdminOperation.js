import React, { useEffect, useState } from 'react'
import { IoMdWallet as WalletIcon } from 'react-icons/io'
import { MdError as WarningIcon } from 'react-icons/md'
import TokenIcon from './TokenIcon'
import { Progress } from './ModalProgress'
import WalletResponse from './WalletResponse'
import { useWeb3Context } from '../context/Web3Context'

const AdminOperation = ({ operation, onProgressUpdate }) => {

  // -------------------------------------------------
  // ------ external variable
  const {
    currentAccount,
    txResponse
  } = useWeb3Context()


  // -------------------------------------------------
  // ------ states variable
  const [progress, setProgress] = useState(Progress.RequestSubmitted)
  const addToken = operation.type === 'addToken'
  const approveQuote = operation.type === 'approveQuote'


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

  const operationIndicator = () => (
    (currentAccount &&
      <div className='flex flex-col justify-center items-center w-full py-2'>
        <div className='text-sm text-c-minor pt-3'>
          {(addToken && 'add/list token to dex') || (approveQuote && 'approve token as quote')}
        </div>
        <div className='flex flex-row justify-center items-center w-full py-3 text-sm'>
          {walletAccount()}
          <div className={`pl-2 pr-3 py-1 ml-4 border border-c-weak rounded-l-lg rounded-r-3xl
                         text-left whitespace-nowrap text-sm text-c-major select-none bg-c-btn`}>
            {(addToken && 'add token') || (approveQuote && 'approve quote')}
          </div>
        </div>
      </div>)
    ||
    <div className='flex flex-row justify-center items-center w-full mt-5 pb-8'>
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
    <div className='flex flex-row justify-center items-center w-fit py-4 px-2 mt-1 border-t border-c-weak2'>
      <div className='flex flex-col justify-start items-end w-full text-sm text-c-major'>
        <div className='flex flex-row justify-end items-center h-10 ml-2'>
          TOKEN :
        </div>
        {addToken &&
          <div className='flex flex-row justify-end items-center h-10 ml-2'>
            ADDRESS :
          </div>
        }
      </div>
      <div className='flex flex-col justify-start items-start'>
        <div className='flex flex-row justify-end items-center h-10 ml-2'>
          {tokenRender(operation.tokenSymbol, 'text-sm font-medium text-c-tab', 'w-[1.5rem] h-[1.5rem] mr-2', 'w-4 h-4')}
        </div>
        {addToken &&
          <div className='flex flex-row justify-start items-center h-10 pl-3 text-sm text-c-tab font-medium'>
            {operation.tokenAddress}
          </div>
        }
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

export default AdminOperation
