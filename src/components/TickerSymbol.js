import React from 'react'

import TokenIcon from './TokenIcon'

const TickerSymbol = ({ data }) => {
  return (
    <div className='flex flex-row flex-nowrap justify-start items-center px-2 md:px-6'>
      <div className='flex flex-row justify-center items-center rounded-full bg-c-minor2 w-[2.5rem] h-[2.5rem]'>
        <TokenIcon name={data.base} />
      </div>
      <div className='flex flex-col w-24 ml-4'>
        <div className='font-bold text-md text-c-major whitespace-nowrap'>
          {data.base} <span className='text-c-minor text-sm'>/ {data.quote}</span>
        </div>
        <div className='text-sm text-c-minor mt-0.5 hover:text-c-major-h'>
          <a href={data.tickerInfoLink} target='_blank' >{data.tickerInfo}</a>
        </div>
      </div>
    </div>
  )
}

export default TickerSymbol
