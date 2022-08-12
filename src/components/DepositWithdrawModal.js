import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import { AiOutlineClose as CloseIcon } from 'react-icons/ai'
import TokenOperation from './TokenOperation'
import ButtonGroup from './ButtonGroup'


const DepositWithdrawModal = ({ type, token, openct }) => {

  const [open, setOpen] = useState(true)
  const buttonNames = ['Deposit', 'Withdraw']
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const indexOfType = t => buttonNames.findIndex(n => n.toLowerCase() === type.toLowerCase())
  const [activeIdx, setActiveIdx] = useState(indexOfType(type))

  useEffect(() => {
    setActiveIdx(indexOfType(type))
    setOpen(true)
  }, [openct])

  const updateProgress = (ps) => {
    if (ps === 201) {
      setOpen(false)
      setButtonDisabled(false)
    }
    else if (ps > 0) {
      setButtonDisabled(true)
    }
  }

  const coms = {
    'Deposit': <TokenOperation type='deposit' token={token} onProgressUpdate={updateProgress} />,
    'Withdraw': <TokenOperation type='withdraw' token={token} onProgressUpdate={updateProgress} />
  }

  return (
    <div>
      <Modal open={open} onClickOutside={() => { setOpen(false); setButtonDisabled(false); }}>
        <div className='flex flex-col justify-center items-center min-w-[20em] mx-6 my-6'>
          <div className='relative flex flex-row justify-center items-center w-full px-[6.3em] pb-3 whitespace-nowrap bg-green-3 
                          text-left select-none'>
            <ButtonGroup names={buttonNames} activeIndex={activeIdx}
              onButtonClicked={((btn, index) => setActiveIdx(index))} disabled={buttonDisabled}
              bgColors={['bg-c-btn-bullish', 'bg-c-btn-bearish', 'hover:bg-c-bullish', 'hover:bg-c-bearish']}
            />
            <div className='absolute right-0 flex justify-end items-center'>
              <CloseIcon className='w-6 h-6 text-c-major cursor-pointer hover:text-c-tab'
                onClick={() => { setOpen(false); setButtonDisabled(false); }} />
            </div>
          </div>
          <div className='h-[23em] flex flex-col justify-end'>
            {coms[buttonNames[activeIdx]]}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DepositWithdrawModal