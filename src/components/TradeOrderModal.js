import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import { AiOutlineClose as CloseIcon } from 'react-icons/ai'
import OrderOperation from './OrderOperation'

const TradeOrderModal = ({ order, openct }) => {

  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(true)
  }, [openct])

  const updateProgress = (ps) => {
    if (ps === 201) {
      setOpen(false)
    }
    else if (ps === 200) {
      setTimeout(() => { setOpen(false) }, 1000)
    }
    else if (ps > 0) {
    }
  }

  const tagColor = (order) => {
    if (order.op === 'new') {
      if (order.side.toUpperCase() === 'SELL') return 'bg-c-bearish'
      else if (order.side.toUpperCase() === 'BUY') return 'bg-c-bullish'
    }
    else if (order.op === 'cancel') return 'bg-c-btn'
  }

  const tagText = (order) => {
    const sideTxt = { BUY: 'Buy', SELL: 'Sell' }
    const typeTxt = { LIMIT: 'Limit', MARKET: 'Market' }
    const t = `${typeTxt[order.type.toUpperCase()]} ${sideTxt[order.side.toUpperCase()]}`
    if (order.op === 'cancel') return `Cancel ${t}`
    else return t
  }

  return (
    <div>
      <Modal open={open} onClickOutside={() => { setOpen(false) }}>
        <div className='flex flex-col justify-center items-center min-w-[20em] mx-6 my-6'>
          <div className='relative flex flex-row justify-center items-center w-full px-[6.3em] pb-3 whitespace-nowrap bg-green-3 
                          text-left select-none'>
            {/* <div className={`w-48 px-4 py-2 rounded-b-lg rounded-t-3xl border-2  border-c-weak
                             ${order.side === 'buy' ? 'bg-c-bullish ' : 'bg-c-bearish'} saturate-[30%] text-center`}> */}
            <div className={`w-48 px-4 py-2 rounded-lg border-2  border-c-weak
                             ${tagColor(order)} saturate-[30%] text-center`}>
              {tagText(order)}
            </div>
            <div className='absolute right-0 flex justify-end items-center'>
              <CloseIcon className='w-6 h-6 text-c-major cursor-pointer hover:text-c-tab'
                onClick={() => { setOpen(false) }} />
            </div>
          </div>
          <div className='h-[26rem] flex flex-col justify-end bg-green-800'>
            <OrderOperation order={order} onProgressUpdate={updateProgress} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TradeOrderModal