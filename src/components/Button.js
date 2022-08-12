import React from 'react'

const Button = ({ text, color, disabled, onClicked }) => {
  return (
    <button className={`w-full p-2 rounded-lg font-bold text-md border-0 border-c-btn hover:border-c-minor4 uppercase select-none
                        ${disabled ? 'cursor-not-allowed text-c-minor bg-c-btn-muted-h' : color + ' text-c-btn hover:mix-blend-screen'}`}
      onClick={() => {
        if (onClicked && !disabled) onClicked(text)
      }}
    >
      {text}
    </button>
  )
}

export default Button
