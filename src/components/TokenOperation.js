import React, { useEffect, useState } from 'react'
import { ReactComponent as ArrowIcon } from '../images/ArrowDown.svg'
import { SiFreelancer as LogoIcon } from 'react-icons/si'
import { IoMdWallet as WalletIcon } from 'react-icons/io'
import { MdError as WarningIcon } from 'react-icons/md'
import RangeSlider from './RangeSlider'
import ValueInput from './ValueInput'
import Dropdown from './Dropdown'
import Button from './Button'
import TokenIcon from './TokenIcon'
import { floatStr } from '../common/Utils'
import { useWeb3Context } from '../context/Web3Context'
import WalletResponse from './WalletResponse'
import { Progress } from './ModalProgress'

const TokenOperation = ({ type, token, onProgressUpdate }) => {

  // -------------------------------------------------
  // ------ external variable
  const {
    currentAccount,
    tokens,
    balance,
    depositToken,
    withdrawToken,
    txResponse
  } = useWeb3Context()


  // -------------------------------------------------
  // ------ states variable
  const [selectedToken, setSelectedToken] = useState(token ? token : null)
  const [inputValue, setInputValue] = useState('')
  const [inputMsg, setInputMsg] = useState('')
  const [inputError, setInputError] = useState(false)
  const [percent, setPercent] = useState(0)

  const [progress, setProgress] = useState(Progress.WaitingInput)
  const [submitValue, setSubmitValue] = useState(0)

  const buttonText = type ? type : 'deposit'
  const isWithdraw = type === 'withdraw'


  // -------------------------------------------------
  // ------ fund available
  const fundAvailable = (ty, tk) =>
    balance[tk] !== undefined ?
      (ty === 'deposit' ? Number(balance[tk][0]) : Number(balance[tk][1]) - Number(balance[tk][2]))
      : '--'

  const [fundAvbl, setFundAvbl] = useState(selectedToken ? fundAvailable(type, selectedToken) : '--')
  useEffect(() => {
    if (progress === Progress.WaitingInput && selectedToken) {
      setFundAvbl(fundAvailable(type, selectedToken))
    }
  }, [balance, selectedToken, type])


  // -------------------------------------------------
  // ------ token operation reminder
  const wallet = () => (
    <div className='flex flex-row flex-nowrap justify-center items-center'>
      <WalletIcon className='w-6 h-6 mr-1.5' />
      <div className='select-none'>
        {currentAccount.substring(0, 6) + '...' + currentAccount.substr(-4)}
      </div>
    </div>
  )

  const logo = () => <LogoIcon className='w-7 h-7' />

  const tokenFlowIndicator = () => (
    currentAccount &&
    <div className='flex flex-col justify-center items-center w-full py-2'>
      <div className='text-sm text-c-minor pt-3'>
        {isWithdraw && 'withdraw token to your wallet' || 'deposit token to the dex'}
      </div>
      <div className='flex flex-row justify-center items-center w-full py-3 text-sm'>
        {isWithdraw && logo() || wallet()}
        <ArrowIcon
          className={`w-7 h-7 mx-6 text-c-icon-sel ${isWithdraw ? '-rotate-[135deg]' : '-rotate-45'}`}
        />
        {isWithdraw && wallet() || logo()}

      </div>
    </div>
    ||
    <div className='flex flex-row justify-center items-center w-full mt-5 pb-8'>
      <WarningIcon className='w-6 h-6 text-c-minor' />
      <div className='ml-4 font-medium text-c-minor'>No wallet connected</div>
    </div>
  )

  const availableFund = () => (
    <div className='flex flex-row justify-between items-center w-full px-3 mb-1 text-xs text-c-minor select-none'>
      <div className='flex flex-row justify-start items-center w-full mr-2'>
        {isWithdraw && <LogoIcon className='w-5 h-5 mr-1' /> || <WalletIcon className='w-5 h-5 mr-1' />}
        <span>Available</span>
      </div>
      <span className='text-c-major2 whitespace-nowrap'>{floatStr(fundAvbl)} {selectedToken}</span>
    </div>
  )


  // -------------------------------------------------
  // ------ token selection
  const optionRender = (op, textStyle = 'text-lg text-c-major', iconDivStytle = 'w-[2.0rem] h-[2.0rem] mr-4', iconStyle = 'w-5 h-5') => (
    <div className='flex flex-row justify-start items-center w-full px-3 text-xs text-c-minor select-none'>
      {op !== 'Select Token' &&
        <div className={`flex justify-center items-center rounded-full bg-c-minor2 ${iconDivStytle}`}>
          <TokenIcon name={op} className={iconStyle} />
        </div>
      }
      <span className={textStyle}>{op}</span>
    </div>
  )

  const tokenDropdown = () => (
    <div className='w-full'>
      <Dropdown
        rootStyle='w-full h-12 mb-3 border-2 bg-c-form border-c-weak hover:border-c-h focus:border-c-f rounded-lg outline-none'
        downIconStyle='mr-3'
        wFull
        title={selectedToken ? selectedToken : 'Select Token'}
        options={tokens}
        optionRender={optionRender}
        displaySelected={v => v}
        selectOption={(op) => setSelectedToken(op)} />
    </div>
  )


  // -------------------------------------------------
  // ------ value input
  const checkNum = (v, replace = 0) => {
    const n = parseFloat(v)
    if (isNaN(n) || n === Infinity) return replace
    else return n
  }

  const updateValue = (name, v, fv, updatePct = true) => {
    const validValue = checkNum(v)
    if (validValue > fundAvbl) {
      setInputError(true)
      setInputMsg(`Max: ${checkNum(fundAvbl)}`)
    }
    else {
      setInputError(false)
      setInputMsg('')
    }
    if (updatePct) {
      setPercent(checkNum(validValue / fundAvbl * 100))
    }
    setInputValue(fv)
  }

  const onPercentChange = (pv) => {
    if (selectedToken) {
      setPercent(pv)
      const v = checkNum(fundAvbl) * pv / 100
      updateValue(type, v, v, false)
    }
  }

  useEffect(() => {
    if (selectedToken && checkNum(inputValue, -1) !== -1) {
      updateValue(type, inputValue, inputValue)
    }
  }, [type, selectedToken])


  // -------------------------------------------------
  // ------ button
  const onButtonClick = (name) => {
    if (name === 'DONE' || name === 'CLOSE') {
      updateProgress(Progress.Closed)
    } else {
      const validValue = checkNum(inputValue, 0)
      if (validValue > 0 && validValue <= fundAvbl) {
        setSubmitValue(validValue)
        updateProgress(Progress.RequestSubmitted)
        if (name === 'deposit') {
          depositToken(selectedToken, validValue)
        }
        else if (name === 'withdraw') {
          withdrawToken(selectedToken, validValue)
        }
      }
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
  // ------ request snapshot
  const requestSnapshot = () => (
    <div className='flex flex-row justify-center items-center w-fit py-4 px-16 mt-1 border-t border-c-weak2'>
      <div className='flex flex-col justify-start items-end w-full text-sm text-c-major'>
        <div className='flex flex-row justify-end items-center h-10 ml-2'>
          {buttonText.toUpperCase()} :
        </div>
        <div className='flex flex-row justify-end items-center h-10 ml-2'>
          AMOUNT :
        </div>
      </div>
      <div className='flex flex-col justify-start'>
        <div className='flex flex-row justify-end items-center h-10 ml-2'>
          {optionRender(selectedToken, 'text-lg font-medium text-c-tab', 'w-[1.6rem] h-[1.6rem] mr-2', 'w-4 h-4')}
        </div>
        <div className='flex flex-row justify-start items-center h-10 ml-2 pl-3 text-c-tab font-medium'>
          {submitValue}
        </div>
      </div>
    </div>
  )


  // -------------------------------------------------
  // ------ progress view
  const progressView = () => {
    if (progress === Progress.WaitingInput) return (
      <>
        <div className='flex flex-col justify-between items-center w-full p-4 pb-3 mb-6 bg-c-minor2 rounded-lg'>
          {tokenDropdown()}
          {availableFund()}
          <ValueInput
            className='h-12 text-right' name='input' label='Amount' ticker={selectedToken}
            value={inputValue} onValueChange={updateValue} message={inputMsg} messageStyle='bg-c-msg-err text-c-msg-err'
          />
          <div className='w-full px-1.5'>
            <RangeSlider value={percent} onValueChange={onPercentChange} percentDotBdrColor='border-c-minor2' />
          </div>
        </div>
        <Button
          disabled={!currentAccount || !selectedToken || inputValue.length === 0 || inputError || checkNum(inputValue) === 0}
          text={buttonText}
          onClicked={onButtonClick}
          color={buttonText.toUpperCase() === 'DEPOSIT' ? 'bg-c-btn-bullish' : 'bg-c-btn-bearish'}
        />
      </>
    )
    else return (
      <WalletResponse
        progress={progress} requestSnapshot={requestSnapshot()}
        txResponse={txResponse} onButtonClick={onButtonClick}
      />
    )
  }


  // -------------------------------------------------
  // ------ result
  return (
    <div className='flex flex-col justify-between items-center w-full h-full bg-c-major'>
      {tokenFlowIndicator()}
      {progressView()}
    </div>
  )
}

export default TokenOperation