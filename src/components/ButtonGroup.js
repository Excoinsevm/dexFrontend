import React from 'react'

const ButtonGroup = ({ names, activeIndex, bgColors, onButtonClicked, disabled }) => {
  const btnNums = names.length
  const roundedStyle = (idx) => {
    if (idx === 0) return 'rounded-l-md'
    if (idx === names.length - 1) return 'rounded-r-md'
    else return 'rounded-none'
  }
  const activeStyle = (idx) =>
    activeIndex === idx ? `text-c-major active ${bgColors[idx]}` :
      `${disabled ? '' : 'bg-c-btn-muted hover:text-c-btn-muted-h hover:grayscale-[70%] ' + bgColors[idx + btnNums]}`
  return (
    <div className={`flex flex-nowrap border-2 rounded-lg overflow-clip text-sm
                     font-medium text-center text-c-btn-muted bg-c-form ${disabled ? 'border-c-btn-disabled' : 'border-c-weak'}`}>
      {
        names.map((name, index) => (
          <div key={index}
            className={`inline-block w-24 px-4 py-2 text-center whitespace-nowrap select-none
              ${disabled ? 'cursor-not-allowed text-c-minor brightness-[60%] saturate-[50%]' : 'cursor-pointer'}
              ${activeStyle(index)} ${roundedStyle(index)}`}
            onClick={() => {
              if (!disabled && onButtonClicked) onButtonClicked(name, index)
            }}
          >
            {name}
          </div>
        ))
      }
    </div>
  )
}

export default ButtonGroup
