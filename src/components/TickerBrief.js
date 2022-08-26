import React, { useEffect } from 'react'
import TickerMarketBrief from './TickerMarketBrief'
import TickerSymbol from './TickerSymbol'
// import { useWeb3Context } from '../context/Web3Context'
import { web3Methods } from '../context/Web3'

const TickerBrief = ({ tradePair, base, quote }) => {

  const {
    getMarketTradePairBrief,
    tradePairDisplayDecimal
  } = web3Methods()

  const tokenInfo = {
    ETH: 'Ethereum',
    BLUE: 'Blue Token',
    CYAN: 'Cyan Token',
    PINK: 'Pink Token',
    RED: 'Red Token',
  }

  const tokenBase = {
    base: base,
    quote: quote,
    tickerInfo: tokenInfo[base],
    tickerInfoLink: 'https://etherscan.io/token/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  }

  const fiatValueOfUSDT = 0.99
  const dataInit = {
    ...tradePairDisplayDecimal(base, quote),
    fiatSymbol: '$',
    base: base,
    quote: quote,
    price: '--',
    prePrice: '--',
    change24h: '--',
    high24h: '--',
    low24h: '--',
    volume24h: '--',
    total24h: '--',
    fiatValue: '--',
    priceChange: 0,
  }

  // const checkFloat = (v) => {
  //   const n = parseFloat(v)
  //   if (isNaN(n) || n === Infinity) return false
  //   else return true
  // }

  const [data, setData] = React.useState(dataInit)

  useEffect(() => {
    const func = () => {
      const b = getMarketTradePairBrief(base, quote)
      if (b) {
        const _data = {
          ...data, ...b,
          fiatValue: b.price !== '--' ? b.price * fiatValueOfUSDT : '--',
        }
        setData(_data)
      }
    }
    func()
    const interval = setInterval(func, 1000)
    return () => clearInterval(interval)
  }, [tradePair])

  return (
    <div className='flex flex-row flex-nowrap justify-start items-center border-b border-c-weak py-2'>
      <TickerSymbol data={tokenBase} />
      <TickerMarketBrief data={data} />
    </div>
  )
}

export default TickerBrief
