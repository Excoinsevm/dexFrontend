import React, { useEffect, useState } from 'react'
import { useWeb3Context } from '../context/Web3Context'
import Button from '../components/Button'
import { ReactComponent as LoadingSpinner } from '../images/LoadingSpinner.svg'
import Dropdown from '../components/Dropdown'
import TokenIcon from '../components/TokenIcon'
import AdminOperationModal from '../components/AdminOperationModal'

const AdminPage = () => {

  const {
    isAdmin,
    tokens,
    isValidAddress,
    loadTokenSymbol,
    addToken,
    approveQuoteToken,
  } = useWeb3Context()

  const [selectedToken, setSelectedToken] = useState(null)
  const [address, setAddress] = useState('')
  const [symbol, setSymbol] = useState('')
  const [errMsg, setErrMsg] = useState(false)
  const [loadingSymbol, setLoadingSymbol] = useState(false)

  const [adminOperation, setAdminOperation] = useState(false)
  const [adminOperationOpenCount, setAdminOperationOpenCount] = useState(0)
  const openAdminOperation = () => setAdminOperationOpenCount(adminOperationOpenCount + 1)

  useEffect(() => {
    document.title = 'Admin'
  }, [])


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
        downIconStyle='mr-3 text-c-major'
        wFull
        title={selectedToken ? selectedToken : 'Select Token'}
        options={tokens}
        optionRender={optionRender}
        displaySelected={v => v}
        selectOption={(op) => setSelectedToken(op)} />
    </div>
  )


  // -------------------------------------------------
  // ------ add token to dex
  const delay = ms => new Promise(res => setTimeout(res, ms));

  const loadingSpinner = () => (
    <LoadingSpinner className='h-5 w-5 mr-3' />
  )

  const tokenAddressChanged = async (addr) => {
    setAddress(addr)
    if (addr === '') {
      setErrMsg(false)
      setSymbol('')
    } else {
      if (isValidAddress(addr)) {
        setLoadingSymbol(true)
        // await delay(1000)
        const symbol = await loadTokenSymbol(addr)
        if (!symbol) {
          setErrMsg('May not be a valid token address')
        } else {
          setErrMsg(false)
          setSymbol(symbol)
        }
        setLoadingSymbol(false)
      } else {
        setErrMsg('Invalid address')
      }
    }
  }

  const addTokenToDex = () => (
    <div className='flex flex-col justify-center items-center w-[410px] bg-c-minor2 rounded-xl p-4'>
      <div className='text-c-major text-md select-none mb-2 pl-1'>
        Add token to dex
      </div>

      <div className='flex flex-row justify-between items-center w-full px-1'>
        <div className='mb-2 text-c-minor text-sm select-none'>
          Token Address
        </div>
        <div className='mb-2 text-c-bearish text-sm select-none'>
          {errMsg && errMsg}
        </div>
      </div>

      <div className='relative flex flex-row justify-center items-center w-full'>
        {/* <div className='absolute left-4 text-c-minor text-sm select-none'>
        Token Address
      </div> */}
        <input className={`w-full h-10 py-2.5 px-4 border-2 rounded-lg outline-none 
                         text-sm text-left text-c-major bg-c-form border-c-weak hover:border-c-h`}
          type='text'
          pattern='\w*'
          value={address}
          onChange={(e) => {
            if (e.target.validity.valid && tokenAddressChanged)
              tokenAddressChanged(e.target.value)
          }}
        >
        </input >
      </div >

      <div className='flex flex-row justify-between items-center w-full mt-4 mb-4 px-1'>
        <div className='text-sm text-c-minor'>
          Token Symbol
        </div>
        <div className='mr-2 text-sm text-c-major-h'>
          {loadingSymbol && loadingSpinner() || symbol}
        </div>
      </div>
      <Button
        text='Add' color='bg-c-btn' disabled={symbol.length === 0}
        onClicked={() => {
          setAdminOperation({ type: 'addToken', title: 'Add Token', tokenSymbol: symbol, tokenAddress: address })
          addToken(symbol, address)
          openAdminOperation()
        }}
      />
    </div>
  )


  // -------------------------------------------------
  // ------ add token to dex
  const approveTokenAsQuote = () => (
    <div className='flex flex-col justify-center items-center w-[410px] bg-c-minor2 rounded-xl p-4 mt-10'>
      <div className='text-c-major text-md select-none mb-2 pl-1'>
        Approve quote token
      </div>

      <div className='flex flex-row justify-between items-center w-full px-1'>
        <div className='mb-2 text-c-minor text-sm select-none'>
          Select token to approve
        </div>
        <div className='mb-2 text-c-bearish text-sm select-none'>
          {errMsg && errMsg}
        </div>
      </div>

      <div className='relative flex flex-row justify-center items-center w-full mb-3'>
        {tokenDropdown()}
      </div >
      <Button
        text='Approve' color='bg-c-btn' disabled={!selectedToken}
        onClicked={() => {
          setAdminOperation({ type: 'approveQuote', title: 'Approve Quote', tokenSymbol: selectedToken })
          approveQuoteToken(selectedToken)
          openAdminOperation()
        }}
      />
    </div>
  )


  // -------------------------------------------------
  // ------ layout
  const adminContent = () => (
    <div className='flex flex-col justify-center items-center'>
      <h1 className='mb-5 text-2xl text-c-heading uppercase font-bold'>
        Admin Operations
      </h1>
      {addTokenToDex()}
      {approveTokenAsQuote()}
    </div>
  )

  const nonAdminContent = () => (
    <div className='flex flex-col justify-center items-center'>
      <h1 className="text-5xl text-c-heading uppercase font-bold ">
        Admin Only
      </h1>
    </div>
  )

  return (
    <>
      <div className='mt-10'>
        {isAdmin && adminContent() || nonAdminContent()}
      </div>
      {adminOperation && <AdminOperationModal operation={adminOperation} openct={adminOperationOpenCount} />}
    </>
  )
}

export default AdminPage
