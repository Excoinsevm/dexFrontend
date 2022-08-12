import React, { useState, useRef, useEffect } from 'react'
import { floatStr } from '../common/Utils'

const RangeSlider = ({ value, onValueChange, percentDotBdrColor }) => {

  const sizeOptions = {
    sm: {
      trackHeight: 'h-1',
      fixedSize: 'w-3 h-3',
      fixedBdr: 'border-[0.15rem]',
      handleSize: 'w-4 h-4',
      handleBdr: 'border-[0.2rem]',
      valueTagOffsetY: 'bottom-4',
      marginX: 'mx-0',
    },
    md: {
      trackHeight: 'h-2',
      fixedSize: 'w-4 h-4',
      fixedBdr: 'border-[0.25rem]',
      handleSize: 'w-6 h-6',
      handleBdr: 'border-[0.35rem]',
      valueTagOffsetY: 'bottom-6',
      marginX: 'mx-3',
    },
  }

  const size = sizeOptions.sm

  const [percent, setPercent] = useState(0)
  const [trackingTarget, setTrackingTarget] = useState('none')
  const [showValue, setShowValue] = useState(false)

  useEffect(() => {
    setPercent(value < 0 ? 0 : value > 100 ? 100 : value)
  }, [value])

  const wholeSliderRef = useRef(null)

  const slidePercent = (e) => {
    const rect = wholeSliderRef.current.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    const validPercent = percent < 0 ? 0 : percent > 100 ? 100 : percent
    setPercent(validPercent)
    if (onValueChange) onValueChange(validPercent)
  }

  const updatePercent = (v) => {
    setPercent(v)
    if (onValueChange) onValueChange(v)
  }

  const stepBarPointerDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    setTrackingTarget('move')
  }

  const stepBarPointerMove = (e) => {
    if (trackingTarget === 'move') { slidePercent(e) }
  }

  const stepBarPointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId)
    if (trackingTarget === 'move') { slidePercent(e) }
    setTrackingTarget('none')
  }

  const pctDotBdrColor = percentDotBdrColor ? percentDotBdrColor : 'border-c-major'

  return (
    <div className={`relative flex flex-col w-full ${size.marginX}`}>
      <div ref={wholeSliderRef}
        className={`relative justify-center items-center py-3`}
        onPointerDown={stepBarPointerDown}
        onPointerMove={stepBarPointerMove}
        onPointerUp={stepBarPointerUp}
        onPointerEnter={() => setShowValue(true)}
        onPointerLeave={() => setShowValue(false)}
      >
        <div className={`relative flex flex-row justify-between items-center bg-c-minor3 ${size.trackHeight} rounded-full`}>
          <div className={`absolute inset-0 ${size.trackHeight} bg-c-minor5`} style={{ width: `${percent}%` }}></div>
          {
            [0, 25, 50, 75, 100].map((v, i) => (
              <div key={i}
                className={`${size.fixedSize} rounded-full ${size.fixedBdr} cursor-pointer \
                          ${v <= percent ? ('bg-c-minor5 ' + pctDotBdrColor) : 'border-c-minor3 bg-c-major'}`}
                style={{ position: 'absolute', left: `${v}%`, transform: `translateX(-50%)` }}
                onPointerUp={() => { if (trackingTarget === 'fixed') updatePercent(v) }}
                onPointerDown={(e) => { e.stopPropagation(); setTrackingTarget('fixed') }}
              ></div>
            ))
          }
          <div className={`absolute ${size.handleSize} flex flex-col justify-center items-center \
                         ${size.handleBdr} border-c-minor5 bg-c-major rounded-full cursor-pointer`}
            style={{ left: `${percent}%`, transform: 'translate(-50%, 0)' }}
          >
            <div className={`${showValue ? 'opacity-100' : 'opacity-0'} ${size.valueTagOffsetY} absolute \
                             transition delay-100 px-1.5 border border-c-minor4 rounded-full bg-c-minor \
                             text-c-major text-sm select-none`}>
              {floatStr(percent, 1)}%
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default RangeSlider
