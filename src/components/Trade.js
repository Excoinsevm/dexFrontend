import React, { useEffect } from 'react'
import Charts from './Charts'
import MarketOrderBook from './MarketOrderBook'
import TradeCreateOrder from './TradeCreateOrder'
import TickerBrief from './TickerBrief'
import MarketTradeBook from './MarketTradeBook'
import MarketQuotesMini from './MarketQuotesMini'
import UserTradeDataGroup from './UserTradeDataGroup'
import { OrderPriceContextProvider } from '../context/OrderPriceContext'
// import TVCharts from './TVCharts'

const Trade = ({ ticker }) => {

  const tradeTicker = ticker ? ticker.toUpperCase() : 'ETH-USDT'
  const [base, quote] = tradeTicker.split('-')

  useEffect(() => {
    document.title = `Trade ${tradeTicker.replace('-', '')}`
  }, [ticker])

  return (
    <OrderPriceContextProvider>
      <div className='flex flex-col justify-center max-w-screen-2xl h-fit mx-auto bg-c-major border border-t-0 border-c-weak'>
        <div className='w-auto'>
          <TickerBrief tradePair={tradeTicker} base={base} quote={quote} />
        </div>
        <div className='flex flex-row bg-c-major'>
          <div className='hidden md:block w-[20%] h-full min-w-[250px]'>
            <MarketOrderBook tradePair={tradeTicker} base={base} quote={quote} />
          </div>
          <div className='flex flex-col w-[58] min-w-[320px] container mx-auto border-x border-c-weak2'>
            <div className='min-w-[320px] h-[480px]'>
              <Charts />
            </div>
            <div className='min-w-[320px] h-full border-t border-c-weak2 bg-c-major'>
              <TradeCreateOrder base={base} quote={quote} />
            </div>
          </div>
          <div className='hidden lg:block w-[22%] min-w-[300px] h-full pt-3 bg-c-major'>
            {/* <div className='relative '> */}
            <MarketQuotesMini />
            {/* </div> */}
            <MarketTradeBook tradePair={tradeTicker} base={base} quote={quote} />
          </div>
        </div>
        {/* <div id='tvchart' className='container w-full h-full'>
          <TVCharts />
        </div> */}
        {/* <div className='sm:bg-green-500 md:bg-red-500 lg:bg-yellow-600 inset-0 h-20'></div> */}

        <div className='flex flex-col justify-center items-center border-t border-c-weak'>
          <UserTradeDataGroup tradePair={tradeTicker} base={base} quote={quote} />
        </div>
      </div>
    </OrderPriceContextProvider>
  )
}

export default Trade
