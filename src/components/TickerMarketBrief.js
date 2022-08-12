import { floatStr } from '../common/Utils'
import React from 'react'

const TickerMarketBrief = ({ data }) => {

  const columns = [
    {
      label: (v) => floatStr(v.price, v.precision),
      value: (v) => v.fiatSymbol + floatStr(v.fiatValue)
    },
    {
      label: () => '24h Change',
      value: (v) => change24h(v.change24h, v.precision, v.change24hPercent)
    },
    {
      label: () => '24h High',
      value: (v) => floatStr(v.high24h, v.precision)
    },
    {
      label: () => '24h Low',
      value: (v) => floatStr(v.low24h, v.precision)
    },
    {
      label: (v) => '24h Vol (' + v.base + ')',
      value: (v) => floatStr(v.volume24h)
    },
    {
      label: (v) => '24h Vol (' + v.quote + ')',
      value: (v) => floatStr(v.total24h)
    }
  ]

  const changeColor = (change) => {
    if (change > 0) return ' text-c-bullish';
    else if (change < 0) return ' text-c-bearish';
    else return ' text-c-neutral';
  }

  const change24h = (change24h, precision, change24hPercent) => {
    return (
      <div className={'flex flex-row justify-start ' + changeColor(change24hPercent)}>
        {floatStr(change24h, precision)}
        <span className='ml-1 font-bold'>
          {change24hPercent !== '--' ? floatStr(change24hPercent * 100) + '%' : '--'}
        </span>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 pl-2 md:pl-6 border-l border-c-weak'>
      {
        columns.map(({ label, value }, index) => {
          if (index === 0) return (
            <div className='grid grid-rows-2 justify-items-start place-items-center' key={index}>
              <div className={'text-md font-bold' + changeColor(data.price - data.prePrice)}>{label(data)}</div>
              <div className='text-xs text-c-major'>{value(data)}</div>
            </div>
          )
          else return (
            <div className='grid grid-rows-2 justify-items-start text-c-minor text-xs' key={index}>
              <div className='py-1 uppercase whitespace-nowrap'>{label(data)}</div>
              <div className='mr-6 text-xs text-c-major'>{value(data)}</div>
            </div>
          )
        })
      }
    </div>
  )
}

export default TickerMarketBrief
