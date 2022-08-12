import React, { useState } from 'react'

const ValueInput = ({ name, label, ticker, value, onValueChange, className, message = '', messageStyle, disabled = false }) => {

  const [focused, setFocused] = useState(false)

  const formalize = (v) => {
    // if (v === '') return v
    const v1 = v.toString().replace(/^(-|\+|[eE])/, '') // remove leading sign (plus, minus, exponent)
    const v2 = v1.replace(/^0+/, '0')                   // remove redudant leading zeros
    const v3 = v2.replace(/^(\.|\+\.)/, '0.')           // add leading zero if missing
    // const v4 = v3.replace(/(?<![eE])[\+-]/, '')         // remove trailing sign (plus, minus) if not preceded by exponent (safari bug)
    // const v5 = v4.replace(/(?<=[eE][\+-]?)(0+)$/, '')   // remove trailing zeros after exponent (safari bug)
    const matchV3 = v3.match(/[^eE][+-]/)
    const v4 = matchV3 ? v3.replace(matchV3[0], matchV3[0].slice(0, -1)) : v3
    const matchV4 = v4.match(/[eE][+|-]?0\d+/)
    const v5 = matchV4 ? v4.replace(matchV4[0], matchV4[0].replace(/\d+/, matchV4[0].substr(-1))) : v4
    // console.log(v, 'v1:', v1, 'v2:', v2, 'v3:', v3, 'matchV3:', matchV3, 'v4:', v4, 'matchV4:', matchV4, 'v5:', v5)
    return v5
  }

  const bdr = message ? 'border-c-err' : 'border-c-weak hover:border-c-h focus:border-c-f'
  return (
    <div className='relative flex flex-row justify-between items-center w-full mb-3'>
      <input className={`relative w-full ${className ? className : 'h-10 text-sm text-right'} p-2.5 px-14 border-2 rounded-lg outline-none 
                         text-c-form bg-c-form hover:border-2 focus:border-2 ${bdr} ${disabled ? 'pointer-events-none' : ''}`}
        type='text'
        pattern='\+?\d*\.?\d*[eE]?[\+-]?\d*'
        // pattern='[\d\.eE\-\+]*'
        value={value}
        onChange={(e) => {
          if (e.target.validity.valid && onValueChange)
            onValueChange(name, e.target.value, formalize(e.target.value))
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
      >
      </input >
      <div className='absolute left-3 text-c-minor text-sm select-none'>
        {label}
      </div>
      <div className='absolute right-3 text-c-major text-sm select-none'>
        {ticker}
      </div>
      {message && focused &&
        <div className={`absolute bottom-12 right-6 ${messageStyle ? messageStyle : 'bg-c-msg text-c-msg'} text-sm select-none px-2 py-1 rounded-md`}>
          <svg
            className='absolute right-8 -bottom-2 z-20 w-4 h-4 fill-current stroke-current'
            width='8' height='8' viewBox='0 0 8 8'>
            <rect x='2' y='2' width='4' height='4' fill='' strokeWidth='0' transform='rotate(45, 4, 4)' />
          </svg>
          <span className='text-c-major'>{message}</span>
        </div>
      }
    </div >
  )
}

export default ValueInput
