import React from 'react'
import { FaCheck as CheckIcon } from 'react-icons/fa'

const Checkbox = ({ id, label, onChange, className }) => {
  const [checked, setChecked] = React.useState(false)
  return (
    <div className={`flex flex-row justify-between items-center cursor-pointer ${className}`}
      onClick={() => {
        if (onChange) onChange(id, !checked)
        setChecked(!checked)
      }}>
      <div className='flex justify-center items-center w-3.5 h-3.5 border-2 border-c-minor4' >
        {checked && <CheckIcon className='text-c-minor' />}
      </div>
      <label htmlFor={id} className='ml-2 text-sm font-medium text-c-minor select-none cursor-pointer'>{label}</label>
    </div>
  )
}

export default Checkbox