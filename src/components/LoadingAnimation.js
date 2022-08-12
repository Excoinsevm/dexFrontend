import React from 'react'
import { ReactComponent as LoadingEffect } from '../images/freelancerEffect.svg'

const LoadingAnimation = ({ className }) => {

  return (
    <div className={`flex flex-col justify-center items-center w-20 h-20 ${className}`}>
      <LoadingEffect />
    </div>
  )
}

export default LoadingAnimation