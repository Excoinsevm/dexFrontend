import React, { useState, useEffect } from 'react'
import { timeStr, floatStr } from '../common/Utils'
import { useOrderPriceContext } from '../context/OrderPriceContext'
import { useWeb3Context } from '../context/Web3Context'
import WalletConnectReminder from './WalletConnectReminder'

const MarketTradeBook = ({ tradePair, base, quote }) => {

  // ------ external data
  const { updateContextPriceValue } = useOrderPriceContext()
  const {
    connect,
    currentAccount,
    scheduleMarketTradesFetch,
    cancelMarketTradesFetchSchedule,
    getMarketTrades,
    tradePairDisplayDecimal
  } = useWeb3Context()


  // ------ internal data
  const [pDecimals, qDecimals] = [
    tradePairDisplayDecimal(base, quote).quoteDecimal,
    tradePairDisplayDecimal(base, quote).baseDecimal
  ]
  const [trades, setTrades] = useState([])
  const [currentAccountTrades, setCurrentAccountTrades] = useState([])
  const [recentTradeId, setRecentTradeId] = useState(-1)

  useEffect(() => {
    scheduleMarketTradesFetch(base, quote, setRecentTradeId)
    return () => cancelMarketTradesFetchSchedule()
  }, [tradePair])

  useEffect(() => {
    if (recentTradeId >= 0) {
      // console.log('trades', recentTradeId, getMarketTrades(base, quote))
      const _trades = getMarketTrades(base, quote)
      // console.log('trade', _trades)
      setTrades(_trades)
      if (currentAccount) {
        const filtered = _trades.filter(trade =>
          trade.seller === currentAccount || trade.buyer === currentAccount
        )
        const sideRevised = filtered.map(trade => ({
          ...trade,
          side: trade.buyer === currentAccount ? 'BUY' : 'SELL'
        }))
        setCurrentAccountTrades(sideRevised)
      } else {
        setCurrentAccountTrades([])
      }
    } else {
      setTrades([])
      setCurrentAccountTrades([])
    }
  }, [recentTradeId, currentAccount])


  // ------ ui construct
  const [activeTab, setActiveTab] = useState('market')
  const tab = () => {
    const tabItems = [{ id: 'market', display: 'Market trades' }, { id: 'my', display: 'My trades' }].map((tab, index) => (
      <li key={index} className='mr-4'>
        <div className={'inline-block my-1 p-1 px-0  rounded-md whitespace-nowrap cursor-pointer select-none ' +
          (activeTab === tab.id ? 'text-c-tab active' : 'hover:text-c-tab-muted-h')}
          onClick={() => setActiveTab(tab.id)}>
          {tab.display}
        </div>
      </li >
    ))
    return (
      <ul className='flex flex-nowrap px-2 pt-2 pb-1 text-sm font-medium text-center text-c-btn-muted'>
        {tabItems}
      </ul>
    )
  }

  const header = () => {
    return (
      <div className='flex flex-row flex-nowrap justify-between mb-2 text-c-minor text-xs pl-2 pr-3.5' >
        <div className='text-left whitespace-nowrap  w-[30%] '>{'Price (' + quote + ')'}</div>
        <div className='text-right whitespace-nowrap w-[30%] '>{'Qty (' + base + ')'}</div>
        <div className='text-right whitespace-nowrap w-[30%] '>Time</div>
      </div>
    )
  }

  const table = (tab) => {
    const tradeList = activeTab === 'market' ? trades : currentAccountTrades
    return (
      <div className='flex flex-col-reverse text-c-major2 w-full px-0'>
        {tradeList.map((trade, index) => (
          <div key={index} className='relative mb-1 text-xs h-[16px] overflow-clip cursor-pointer 
                                      border-c-strong border-opacity-50 bg-opacity-80'
            onClick={() => { updateContextPriceValue(trade.p) }}
          >
            <div className='relative flex flex-row flex-nowrap justify-between px-2 z-10'>
              <div className={`text-left w-[30%] ${trade.side === 'BUY' ? 'text-c-bullish-weak' : 'text-c-bearish-weak'}`}>
                {floatStr(trade.p, pDecimals)}
              </div>
              <div className='text-right w-[30%] '>{floatStr(trade.q, qDecimals)}</div>
              <div className='text-right w-[30%] '>{timeStr(trade.t)}</div>
            </div>
          </div>
        ))
        }
        {
          (tab === 'my' && tradeList.length === 0) &&
          (
            (currentAccount && <div className='text-center text-xs text-c-minor mt-4'>No trades</div>)
            || <WalletConnectReminder onClick={connect} className='mt-4 text-xs text-c-minor' />
          )
        }
      </div >
    )
  }

  return (
    <div className='flex flex-col justify-start w-full h-full'>
      {tab()}
      {header()}
      <div className='h-full overflow-y-auto'>
        {table(activeTab)}
      </div>
    </div>
  )
}

export default MarketTradeBook
