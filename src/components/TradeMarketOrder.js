import React, { useState } from 'react'
import RangeSlider from './RangeSlider'
import ValueInput from './ValueInput'
import TradeOrderButton from './TradeOrderButton'
import { floatStr } from '../common/Utils'

const TradeMarketOrder = ({ side, base, quote, fundAvbl, avgPriceEst, onOrderSubmit }) => {

  const [inputValue, setInputValue] = useState({ q: '', t: '' })
  const [inputMsg, setInputMsg] = useState({ q: '', t: '' })
  const [percent, setPercent] = useState(0)

  const checkNum = (v, replace = 0) => {
    const n = parseFloat(v)
    if (isNaN(n) || n === Infinity) return replace
    else return n
  }

  const updateValue = (name, v, fv) => {
    const validValue = checkNum(v)
    let priceEst = 0
    let newValue = { ...inputValue }
    if (name === 'q') {
      newValue.q = fv
      priceEst = avgPriceEst(validValue)
      newValue.t = checkNum(validValue * priceEst)
    }
    else if (name === 't') {
      newValue.t = fv
      priceEst = avgPriceEst(inputValue.q * checkNum(validValue / inputValue.t))
      newValue.q = checkNum(validValue / priceEst)
    }
    if (side.toUpperCase() === 'BUY') {
      if (checkNum(newValue.t) > fundAvbl) {
        if (name === 'q') setInputMsg({ ...inputMsg, q: `Max: ${checkNum(fundAvbl / priceEst)}` })
        if (name === 't') setInputMsg({ ...inputMsg, t: `Max: ${fundAvbl}` })
      }
      else { setInputMsg({ ...inputMsg, q: '', t: '' }) }
      setPercent(checkNum(newValue.t / fundAvbl * 100))
    }
    else {
      if (checkNum(newValue.q) > fundAvbl) {
        if (name === 'q') setInputMsg({ ...inputMsg, q: `Max: ${fundAvbl}` })
        if (name === 't') setInputMsg({ ...inputMsg, t: `Max: ${fundAvbl * priceEst}` })
      }
      else { setInputMsg({ ...inputMsg, q: '', t: '' }) }
      setPercent(checkNum(newValue.q / fundAvbl * 100))
    }
    setInputValue(newValue)
  }

  const onPercentChange = (pv) => {
    setPercent(pv)
    const v = fundAvbl * pv / 100
    if (side.toUpperCase() === 'BUY') { updateValue('t', v, v) }
    else { updateValue('q', v, v) }
  }

  const availableFund = () => (
    <div className='flex flex-row justify-between items-center w-full px-3 mb-1 text-xs text-c-minor select-none'>
      <span>Available</span>
      <span className='text-c-major2'>{floatStr(fundAvbl)} {side.toUpperCase() === 'BUY' ? quote : base}</span>
    </div>
  )

  return (
    <div className='flex flex-col justify-between items-center w-full bg-c-major mx-4 mt-0 mb-4'>
      {availableFund()}
      <ValueInput name='p' label='Price' ticker={quote} value='Market' disabled={true} />
      <ValueInput name='q' label={side.toUpperCase() === 'BUY' ? 'Amount EST.' : 'Amount'}
        ticker={base} value={inputValue.q} onValueChange={updateValue} message={inputMsg.q} />
      <ValueInput name='t' label={side.toUpperCase() === 'BUY' ? 'Total' : 'Total EST.'}
        ticker={quote} value={inputValue.t} onValueChange={updateValue} message={inputMsg.t} />
      <div className='w-full px-1.5 mt-0 mb-3'>
        <RangeSlider value={percent} onValueChange={onPercentChange} />
      </div>
      <TradeOrderButton side={side}
        onClicked={(btn) => {
          if (onOrderSubmit) {
            const validAmount = checkNum(inputValue.q)
            if (validAmount === 0) setInputMsg({ ...inputMsg, q: `require value > 0` })
            if (validAmount > 0)
              onOrderSubmit(side, 'market', validAmount)
          }
        }} />
    </div>
  )
}

export default TradeMarketOrder