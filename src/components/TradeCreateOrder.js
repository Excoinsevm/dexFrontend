import React, { useState } from 'react'
import TradeLimitOrder from './TradeLimitOrder'
import TradeMarketOrder from './TradeMarketOrder'
import { useOrderPriceContext } from '../context/OrderPriceContext'
import { useWeb3Context } from '../context/Web3Context'
import TradeOrderModal from './TradeOrderModal'

const TradeCreateOrder = ({ base, quote }) => {

  // ------ external data
  const { balance, createLimitOrder, createMarketOrder } = useWeb3Context()
  const { contextPriceValue } = useOrderPriceContext()

  // ------ internal data
  const [dexAvblBase, dexAvblQuote] = (balance && balance[base] && balance[quote]) ?
    [balance[base][1] - balance[base][2], balance[quote][1] - balance[quote][2]] : ['--', '--']
  const orderTypes = ['Limit', 'Market']
  const [activeOrderTypeIndex, setActiveOrderTypeIndex] = useState(0)

  const [order, setOrder] = useState(false)
  const [modalOpenCount, setModalOpenCount] = useState(0)
  const openModal = () => setModalOpenCount(modalOpenCount + 1)

  const onOrderSubmit = (side, type, amount, price) => {
    setOrder({ base, quote, side, type, amount, price, op: 'new' })
    // console.log(order)
    const SIDE = { BUY: 0, SELL: 1 };
    const _side = SIDE[side.toUpperCase()]
    if (type === 'limit') {
      createLimitOrder(base, quote, amount, price, _side)
    }
    else if (type === 'market') {
      createMarketOrder(base, quote, amount, _side)
    }
    openModal()
  }

  const limitOrders = () => (
    <>
      <TradeLimitOrder side='buy' base={base} quote={quote} fundAvbl={dexAvblQuote} price={contextPriceValue}
        onOrderSubmit={onOrderSubmit} />
      <TradeLimitOrder side='sell' base={base} quote={quote} fundAvbl={dexAvblBase} price={contextPriceValue}
        onOrderSubmit={onOrderSubmit} />
    </>
  )

  const priceEst = (volumn) => {
    return 1000
  }

  const marketOrders = () => (
    <>
      <TradeMarketOrder side='buy' base={base} quote={quote} fundAvbl={dexAvblQuote} avgPriceEst={priceEst}
        onOrderSubmit={onOrderSubmit} />
      <TradeMarketOrder side='sell' base={base} quote={quote} fundAvbl={dexAvblBase} avgPriceEst={priceEst}
        onOrderSubmit={onOrderSubmit} />
    </>
  )

  const orderTypeTabs = () => {
    const tabItems = orderTypes.map((tab, index) => {
      return (
        <li key={index} className='mr-6'>
          <div className={'inline-block my-1 py-1.5 rounded-lg whitespace-nowrap cursor-pointer select-none ' +
            (activeOrderTypeIndex === index ? 'text-c-tab active' : 'hover:text-c-tab-muted-h')}
            onClick={() => setActiveOrderTypeIndex(index)}>
            {tab}
          </div>
        </li >
      )
    })
    return (
      <ul className='flex flex-nowrap px-6 pt-4 text-sm font-medium text-center text-c-btn-muted bg-c-major'>
        {tabItems}
      </ul>
    )
  }

  return (
    <div className='flex flex-col w-full'>
      {orderTypeTabs()}
      <div className='flex flex-row justify-around items-center mt-2'>
        {orderTypes[activeOrderTypeIndex] === 'Limit' ? limitOrders() : marketOrders()}
      </div>
      {order && <TradeOrderModal order={order} openct={modalOpenCount} />}
    </div>
  )
}

export default TradeCreateOrder