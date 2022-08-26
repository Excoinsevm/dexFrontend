import React, { useEffect, useState } from 'react'
import RangeSlider from './RangeSlider'
import ValueInput from './ValueInput'
import TradeOrderButton from './TradeOrderButton'
import { floatStr } from '../common/Utils'
import { web3Methods } from '../context/Web3'

const TradeLimitOrder = ({ side, base, quote, fundAvbl, price, onOrderSubmit }) => {

  const { tokenBalanceDecimal } = web3Methods()

  const [inputValue, setInputValue] = useState({ p: '', q: '', t: '' })
  const [inputMsg, setInputMsg] = useState({ p: '', q: '', t: '' })
  const [percent, setPercent] = useState(0)

  const checkNum = (v, replace = 0) => {
    const n = parseFloat(v)
    if (isNaN(n) || n === Infinity) return replace
    else return n
  }

  const updateValue = (name, v, fv) => {
    const validValue = checkNum(v)
    // console.log('updateValue', side, name, v, validValue)
    let newValue = { ...inputValue }
    if (name === 'p') {
      newValue.p = fv
      newValue.t = checkNum(validValue * inputValue.q)
    }
    else if (name === 'q') {
      newValue.q = fv
      newValue.t = checkNum(validValue * inputValue.p)
    }
    else if (name === 't') {
      newValue.t = fv
      newValue.q = checkNum(validValue / inputValue.p)
    }
    if (side.toUpperCase() === 'BUY') {
      // console.log('updateValue', side, name, v, validValue, inputValue)
      if (checkNum(newValue.t) > fundAvbl) {
        if (name === 'q') setInputMsg({ ...inputMsg, q: `Max: ${checkNum(fundAvbl / inputValue.p)}` })
        if (name === 't') setInputMsg({ ...inputMsg, t: `Max: ${fundAvbl}` })
      }
      else { setInputMsg({ ...inputMsg, p: '', q: '', t: '' }) }
      setPercent(checkNum(newValue.t / fundAvbl * 100))
    }
    else {
      if (checkNum(newValue.q) > fundAvbl) {
        if (name === 'q') setInputMsg({ ...inputMsg, q: `Max: ${fundAvbl}` })
        if (name === 't') setInputMsg({ ...inputMsg, t: `Max: ${fundAvbl * checkNum(inputValue.p)}` })
      }
      else { setInputMsg({ ...inputMsg, p: '', q: '', t: '' }) }
      setPercent(checkNum(newValue.q / fundAvbl * 100))
    }
    setInputValue(newValue)
  }

  useEffect(() => {
    updateValue('p', price, price)
  }, [price])

  const onPercentChange = (pv) => {
    setPercent(pv)
    const v = fundAvbl * pv / 100
    if (side.toUpperCase() === 'BUY') { updateValue('t', v, v) }
    else { updateValue('q', v, v) }
  }

  const avlbFundStr = () => (side.toUpperCase() === 'BUY') ?
    floatStr(fundAvbl, tokenBalanceDecimal(quote)) + ' ' + quote :
    floatStr(fundAvbl, tokenBalanceDecimal(base)) + ' ' + base

  const availableFund = () => (
    <div className='flex flex-row justify-between items-center w-full px-3 mb-1 text-xs text-c-minor select-none'>
      <span>Available</span>
      <span className='text-c-major2'>{avlbFundStr()}</span>
    </div>
  )

  return (
    <div className='flex flex-col justify-between items-center w-full bg-c-major mx-4 mt-0 mb-4'>
      {availableFund()}
      <ValueInput name='p' label='Price' ticker={quote} value={inputValue.p} onValueChange={updateValue} message={inputMsg.p} />
      <ValueInput name='q' label='Amount' ticker={base} value={inputValue.q} onValueChange={updateValue} message={inputMsg.q} />
      <div className='w-full px-1.5 mt-0 mb-3'>
        <RangeSlider value={percent} onValueChange={onPercentChange} />
      </div>
      <ValueInput name='t' label='Total' ticker={quote} value={inputValue.t} onValueChange={updateValue} message={inputMsg.t} />
      <TradeOrderButton side={side}
        onClicked={(btn) => {
          if (onOrderSubmit) {
            const validAmount = checkNum(inputValue.q)
            const validPrice = checkNum(inputValue.p)
            if (validAmount === 0) setInputMsg({ ...inputMsg, q: `require value > 0` })
            if (validPrice === 0) setInputMsg({ ...inputMsg, p: `require value > 0` })
            if (validAmount > 0 && validPrice > 0)
              onOrderSubmit(side, 'limit', validAmount, validPrice)
          }
        }} />
    </div>
  )
}

export default TradeLimitOrder