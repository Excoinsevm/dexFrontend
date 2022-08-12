import React, { useState } from 'react'
import { IoCaretDown as DownIcon } from 'react-icons/io5'

const Dropdown = ({
  title, options, optionRender, selectOption, clickTitle, hoverOpen,
  displaySelected, pos, rootStyle, downIconStyle, wFull }) => {
  const [open, setOpen] = useState(false)
  const [hoverMain, setHoverMain] = useState(false)
  const [hoverPopup, setHoverPopup] = useState(false)
  const [selectedOption, setSelectedOption] = useState(title)
  const updateHoverMain = (v) => {
    setHoverMain(v)
    setOpen(v || hoverPopup)
  }
  const updateHoverPopup = (v) => {
    setHoverPopup(v)
    setOpen(v || hoverMain)
  }
  const posStyle = (pos) => {
    if (!pos) return 'top-[90%]'
    if (pos === 'bl') return 'top-[90%] left-0'
    if (pos === 'br') return 'top-[90%] right-0'
    if (pos === 'tl') return 'bottom-[90%] left-0'
    if (pos === 'tr') return 'bottom-[90%] right-0'
  }
  const renderValue = (v) => optionRender ? optionRender(v) : v
  return (
    <div className={`relative flex z-20 ${rootStyle}`}>
      <div className={`flex flex-row justify-between items-center ${wFull ? 'w-full' : 'w-fit'} cursor-pointer`}
        onPointerEnter={() => { if (hoverOpen) updateHoverMain(true) }}
        onPointerLeave={() => { updateHoverMain(false) }}
        onClick={(e) => {
          if (clickTitle) e.preventDefault()
          else setOpen(!open)
        }}>
        <div className={`select-none ${clickTitle ? 'text-c-tab' : ''}`}
          onClick={() => {
            if (clickTitle) { clickTitle(); setOpen(false) }
          }}>
          {displaySelected ? renderValue(displaySelected(selectedOption)) : title}
        </div>
        <DownIcon className={`ml-2 ${open ? 'rotate-180' : ''} ${downIconStyle}`}
          onClick={() => setOpen(!open)} />
      </div>
      {open && (
        <div className={`absolute ${wFull ? 'w-full' : 'w-fit'} select-none ${posStyle(pos)}`}
          onPointerEnter={() => updateHoverPopup(true)}
          onPointerLeave={() => updateHoverPopup(false)}
        >
          <div className='relative flex flex-col justify-center items-start w-full my-2 py-2 overflow-y-scroll
                          text-left text-c-major bg-c-minor rounded-md border border-c-minor3'
          >
            {
              options.map((value, index) => (
                <div key={index} className='w-full px-4 py-2 hover:bg-c-minor3 select-none cursor-pointer'
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    // e.target.setPointerCapture(e.pointerId)
                    // e.stopPropagation()
                    // e.preventDefault()
                    setOpen(false)
                    updateHoverPopup(false)
                    setSelectedOption(value)
                    if (selectOption) selectOption(value)
                  }}
                >
                  {renderValue(value)}
                </div>
              ))
            }
          </div>
        </div>
      )
      }
    </div >
  )
}

export default Dropdown