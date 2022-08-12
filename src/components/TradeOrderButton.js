import React from 'react'
import Button from './Button'

const TradeOrderButton = ({ side, onClicked }) => {
  return (
    <div className='w-full mt-2'>
      <Button
        text={side}
        color={side.toUpperCase() === 'BUY' ? 'bg-c-btn-bullish' : 'bg-c-btn-bearish'}
        onClicked={onClicked}
      />
    </div>
  )
}

export default TradeOrderButton
