import React from 'react'

import { ReactComponent as IconETH } from '../images/TokenETH.svg'
import { ReactComponent as IconUSDT } from '../images/TokenUSDT.svg'
// import { GiTwirlyFlower as FlowerIcon } from 'react-icons/gi'
import { GiSpotedFlower as FlowerIcon } from 'react-icons/gi'
// import { BsFlower2 as FlowerIcon } from 'react-icons/bs'

const TokenIcon = ({ name, className }) => {
  const iconMap = {
    ETH: { Shape: IconETH, color: '' },
    BLUE: { Shape: FlowerIcon, color: 'text-blue-500 ' },
    CYAN: { Shape: FlowerIcon, color: 'text-cyan-400 ' },
    PINK: { Shape: FlowerIcon, color: 'text-pink-400 ' },
    RED: { Shape: FlowerIcon, color: 'text-red-400 ' },
    USDT: { Shape: IconUSDT, color: '' },
  }

  if (iconMap[name] !== undefined) {
    const { Shape, color } = iconMap[name]
    return (
      < Shape className={color + (className ? className : 'w-7 h-7')} />
    )
  } else return (
    <></>
  )
}

export default TokenIcon
