import React, { useState, useEffect, useRef } from 'react'
import { roundf, floatStr } from '../common/Utils'
import { useThemeContext } from '../context/ThemeContext'
import { useOrderPriceContext } from '../context/OrderPriceContext'
// import { useWeb3Context } from '../context/Web3Context'
import { ReactComponent as ArrowUp } from '../images/ArrowUp.svg'
// import { web3Methods } from '../context/Web3'
import { useWeb3Context } from '../context/Web3Context'

const MarketOrderBook = ({ tradePair, base, quote }) => {

  // ------ external data
  const { colorTheme } = useThemeContext()
  const { updateContextPriceValue } = useOrderPriceContext()
  const {
    currentAccount,
    scheduleMarketOrdersFetch,
    cancelMarketOrdersFetchSchedule,
    markCurrentAccountOrders,
    getMarketOrders,
    getMarketTradePairBrief
  } = useWeb3Context()
  // const {
  //   scheduleMarketOrdersFetch,
  //   cancelMarketOrdersFetchSchedule,
  //   markCurrentAccountOrders,
  //   getMarketOrders
  // } = web3Methods()

  // ------ states data
  const [ordersUID, setOrdersUID] = useState(false)
  const fiatValueOfUSDT = 0.99
  const tradeBriefInit = {
    prePrice: '--',
    price: '--',
    fiatValue: '--',
  }
  const [tradeBrief, setTradeBrief] = useState(tradeBriefInit)
  const recentTradePair = useRef(false)
  // console.log('-------->', tradePair, ordersUID)

  useEffect(() => {
    setTradeBrief(tradeBriefInit)
    const func = () => {
      const b = getMarketTradePairBrief(base, quote)
      if (b) {
        const _brief = {
          ...tradeBrief, ...b,
          fiatValue: b.price !== '--' ? b.price * fiatValueOfUSDT : '--',
        }
        if (recentTradePair.current !== tradePair) {
          // console.log('-------->', tradePair, recentTradePair, _brief.price)
          updateContextPriceValue(_brief.price !== '--' ? _brief.price : 0)
          recentTradePair.current = tradePair
        }
        setTradeBrief(_brief)
      }
    }

    scheduleMarketOrdersFetch(base, quote, setOrdersUID, 2000)

    func()
    if (ordersUID) genDisplayCache(priceScale)
    const interval = setInterval(func, 1000)

    return () => {
      cancelMarketOrdersFetchSchedule()
      clearInterval(interval)
    }
  }, [tradePair])

  useEffect(() => {
    // console.log('ordersUID:', ordersUID, currentAccount)
    if (ordersUID) {
      genDisplayCache(priceScale)
    }
  }, [ordersUID, currentAccount])


  // ------ tab control
  const [activeTab, setActiveTab] = useState('both')

  // ------ price display
  const priceScales = ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001']
  const priceDecimals = priceScales.map((d) => { if (d >= 1) return 0; else return Math.log10(1 / d) })
  const [priceScale, setPriceScale] = useState('0.01')

  // ------ order table pane display
  const [displayDecimals, setDisplayDecimals] = useState({ p: 2, q: 2, t: 4 })
  const [orderDisplayCache, setOrderDisplayCache] = useState({ bids: [], asks: [] })
  const [maxQty, setMaxQty] = useState({ bids: 1, asks: 1 })

  // ------ helper methods
  const findMaxQty = (o) => o.reduce((acc, cur) => acc.q > cur.q ? acc : cur, [0])

  const genDisplayCache = (ps) => {
    markCurrentAccountOrders(base, quote)
    const orders = getMarketOrders(base, quote)
    const bids = orders ? orders.b : []
    const asks = orders ? orders.s : []
    const mergedBids = orderMerge(structuredClone(bids), ps)
    const mergedAsks = orderMerge(structuredClone(asks), ps)
    // console.log('merged:', mergedBids, mergedAsks)
    setOrderDisplayCache({ bids: mergedBids, asks: mergedAsks })
    // setMaxQty({ bids: findMaxQty(mergedBids), asks: findMaxQty(mergedAsks) })

    const maxQtyBids = findMaxQty(mergedBids)
    const maxQtyAsks = findMaxQty(mergedAsks)
    const max = maxQtyBids.q > maxQtyAsks.q ? maxQtyBids : maxQtyAsks
    setMaxQty({ bids: max, asks: max })
  }

  const updatePriceScale = (v) => {
    if (v !== priceScale) {
      setPriceScale(v)
      setDisplayDecimals({ ...displayDecimals, ...{ p: priceDecimals[priceScales.indexOf(v)] } })
      genDisplayCache(v)
    }
  }

  const orderMerge = (_orders, roundexp) => {
    if (roundexp === undefined) {
      let ret = _orders.reduce((acc, cur) => {
        if (acc.at(-1).p === cur.p) { acc.at(-1).q += cur.q; acc.at(-1).m = (acc.at(-1).m + cur.m) / 2 }
        else acc.push(cur)
        return acc
      }, [{ p: 0, q: 0, m: 0 }])
      ret.shift() // return ret.slice(1)
      return ret
    }
    else {
      let ret = _orders.reduce((acc, cur) => {
        const tailP = roundf(acc.at(-1).p, roundexp)
        const curP = roundf(cur.p, roundexp)
        if (tailP === curP) { acc.at(-1).p = curP; acc.at(-1).q += cur.q; acc.at(-1).m = (acc.at(-1).m + cur.m) / 2 }
        else { cur.p = curP; acc.push(cur) }
        return acc
      }, [{ p: 0, q: 0, m: 0 }])
      ret.shift() // return ret.slice(1)
      return ret
    }
  }


  // -------------------------------------------------
  // ------ top control pane
  const sideIcon = (side, active) => {
    const darkTheme = colorTheme === 'dark'
    const askscolor = active ? '#ff737f' : (darkTheme ? '#5f3236' : '#7f5256')
    const bidsColor = active ? '#32d993' : (darkTheme ? '#1b4f39' : '#3b6f59')
    const bdrColor = active ? (darkTheme ? '#ddd' : '#111') : (darkTheme ? '#777' : '#333')
    const bgColor = darkTheme ? '#1e293b' : '#f1f5f9'
    const color1 = side === 'bids' ? bidsColor : askscolor
    // const color2 = side === 'both' ? bdrColor : color1
    const color3 = side === 'asks' ? askscolor : bidsColor
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <g fill="currentcolor">
          <rect x="0" y="0" width="24" height="24" stroke={bdrColor} strokeWidth="2" fill={bgColor} />
          {/* <rect x="3" y="3" width="18" height="2" fill={color1} />
          <rect x="3" y="7" width="18" height="2" fill={color1} />
          <rect x="3" y="11" width="18" height="2" fill={color2} />
          <rect x="3" y="15" width="18" height="2" fill={color3} />
          <rect x="3" y="19" width="18" height="2" fill={color3} /> */}
          <rect x="3" y="3" width="18" height="8" fill={color1} />
          <rect x="3" y="13" width="18" height="8" fill={color3} />
        </g>
      </svg>
    )
  }

  const dropdown = () => {
    return (
      <div className='text-sm bg-transparent'>
        <select style={{ cursor: 'pointer' }}
          className='text-left text-c-major bg-transparent pr-1' value={priceScale}
          onChange={(e) => updatePriceScale(e.target.value)}
        >
          {
            priceScales.map((scale, index) => (
              <option className='bg-c-major' key={index} value={scale}>{scale}</option>
            ))
          }
        </select>
      </div>
    )
  }

  const panel = () => {
    const tradeSides = ['both', 'bids', 'asks']
    return (
      <div className='flex flex-row justify-between items-center h-12 py-2 px-4'>
        <div className='flex flex-row flex-nowrap'>
          {tradeSides.map((name, index) => (
            <div key={index} className='mr-2 cursor-pointer'
              onClick={() => setActiveTab(name)}>
              {sideIcon(name, activeTab === name)}
            </div>
          ))}
        </div>
        {dropdown()}
      </div>
    )
  }


  // -------------------------------------------------
  // ------ order volume table

  // --- aggregate popup
  const [hoveredOnAggregate, setHoveredOnAggregate] = useState(false)
  const [aggregateOffsetY, setAggregateOffsetY] = useState(0)
  const [hoverIndex, setHoverIndex] = useState({ bids: -1, asks: -1 })
  const [recentHoverIndex, setRecentHoverIndex] = useState({ bids: -1, asks: -1 })
  const updateHoverIndex = (side, index) => {
    if (index === -1) {
      setRecentHoverIndex({ ...hoverIndex })
      setHoverIndex({ bids: -1, asks: -1 })
    } else {
      setRecentHoverIndex({ bids: -1, asks: -1 })
      setHoverIndex({ ...{ bids: -1, asks: -1 }, [side]: index })
      calculateAggregateData(side, index)
    }
  }
  const onAggregateHovered = (hovered) => {
    if (!hovered) setRecentHoverIndex({ bids: -1, asks: -1 })
    setHoveredOnAggregate(hovered)
  }
  const onOrderHovered = (side, index, top, height) => {
    updateHoverIndex(side, index)
    setAggregateOffsetY(top + ((side === 'bids') ? height : 0))
  }

  const [aggregateData, setAggregateData] = useState({ q: 0, t: 0, a: 0 })
  const calculateAggregateData = (side, index) => {
    const ret = orderDisplayCache[side].reduce((acc, order, i) => {
      if (i <= index) { acc.q += order.q; acc.t += order.p * order.q }
      return acc
    }, { p: 0, q: 0, t: 0 })
    setAggregateData({ q: ret.q, t: ret.t, a: ret.t / ret.q })
  }

  const aggregate = () => {
    const sideColor = (hoverIndex.bids >= 0 || recentHoverIndex.bids >= 0) ? '#363' : '#633'
    return (
      <div className='relative z-10' style={{ transform: `translate(0px, ${aggregateOffsetY}px)` }}
        onPointerEnter={() => onAggregateHovered(true)}
        onPointerLeave={() => onAggregateHovered(false)}>
        <div className='absolute right-0 z-10 pl-2 flex flex-row justify-start items-center  
                        text-sm leading-tight translate-x-full -translate-y-1/2'>
          <svg
            className='absolute -left-0 z-20 w-4 h-4 fill-current stroke-current'
            width='8' height='8' viewBox='0 0 8 8'>
            <rect x='2' y='2' width='4' height='4' fill={sideColor} strokeWidth='0' transform='rotate(45, 4, 4)' />
          </svg>
          <div className='flex flex-col rounded-lg z-10 px-5 py-3 text-sm text-left text-white shadow-lg min-w-[17em]'
            style={{ backgroundColor: sideColor }}>
            <div className='flex flex-row flex-nowrap justify-between py-1'>
              <div className='whitespace-nowrap'>Sum {base}:</div>
              <div className='ml-4 text-right'>{floatStr(aggregateData.q)}</div>
            </div>
            <div className='flex flex-row flex-nowrap justify-between py-1'>
              <div className='whitespace-nowrap'>Sum {quote}:</div>
              <div className='ml-4 text-right'>{floatStr(aggregateData.t)}</div>
            </div>
            <div className='flex flex-row flex-nowrap justify-between py-1 px-2 border cursor-pointer'
              onClick={() => { updateContextPriceValue(aggregateData.a) }}>
              <div className='whitespace-nowrap'>Avg. Price:</div>
              <div className='ml-4 text-right'>{floatStr(aggregateData.a)}</div>
            </div>
          </div>
        </div>
      </div >
    )
  }

  // --- header (Price, Qty, Total)
  const header = () => {
    return (
      <div className='flex flex-row flex-nowrap justify-between mb-2 text-c-minor text-xs px-2' >
        <div className='text-left whitespace-nowrap  w-[30%] pr-8'>{'Price (' + quote + ')'}</div>
        <div className='text-right whitespace-nowrap w-[30%] '>{'Qty (' + base + ')'}</div>
        <div className='text-right whitespace-nowrap w-[40%] pl-8'>{'Total (' + quote + ')'}</div>
      </div>
    )
  }

  const sideTable = (list, side) => {
    const widthPercent = (v, side) => v * 100 / maxQty[side].q + '%'
    const hSize = (activeTab === 'both') ? 'h-[350px]' : 'h-[700px]'
    const tColor = side === 'asks' ? 'text-c-bearish' : 'text-c-bullish'
    const bColor = side === 'asks' ? 'bg-c-bearish' : 'bg-c-bullish'
    const hoverBdr = side === 'asks' ? 'hover:border-t border-dashed' : 'hover:border-b border-dashed'
    const bgColor = (idx) => (hoverIndex[side] >= idx || (hoveredOnAggregate && recentHoverIndex[side] >= idx)) ?
      'bg-c-minor' : ''
    const holdOnBdr = (idx) => {
      if (hoveredOnAggregate && idx === recentHoverIndex[side]) {
        return side === 'asks' ? 'border-t border-dashed' : 'border-b border-dashed'
      } else {
        return ''
      }
    }
    const mdot = (m) => {
      if (m === 100) return 'border border-c-strong bg-c-minor5'
      else if (m === 0) return ''
      else return 'border border-c-strong'
    }

    return (
      <div className={`flex ${side === 'asks' ? 'flex-col-reverse' : 'flex-col'} ${hSize}`}>
        <div className={`flex ${side === 'asks' ? 'flex-col-reverse' : 'flex-col'} text-c-major2 w-full`}
          onPointerLeave={() => updateHoverIndex(side, -1)}>
          {list.map((order, index) => (
            <div key={index} className={`relative mb-0.5 text-xs h-[16px] overflow-clip cursor-pointer 
                                       border-c-strong border-opacity-50 bg-opacity-80
                                       ${hoverBdr} ${bgColor(index)} ${holdOnBdr(index)}`}
              onPointerEnter={(e) => {
                const parentRect = orderVolumePaneRef.current.getBoundingClientRect()
                const rect = e.target.getBoundingClientRect()
                onOrderHovered(side, index, rect.top - parentRect.top, rect.height)
              }}
              onClick={() => { updateContextPriceValue(order.p) }}
            >
              <div className='relative flex flex-row flex-nowrap justify-between items-center px-2 z-10'>
                <div className={`w-1.5 h-1.5 mr-1 rounded-full ${mdot(order.m)} `} />
                <div className={`text-left w-[30%] ${tColor}`}>{floatStr(order.p, displayDecimals.p)}</div>
                <div className='text-right w-[30%] '>{floatStr(order.q, displayDecimals.q)}</div>
                <div className='text-right w-[40%] '>{floatStr(order.p * order.q, displayDecimals.t)}</div>
              </div>
              <div className={`absolute top-0 right-0 ${bColor} opacity-40 min-h-full`}
                style={{ width: widthPercent(order.q, side) }} />
            </div>
          ))
          }
        </div >
      </div>
    )
  }

  const tradeBar = (data) => {
    const { price, prePrice } = data
    const color = price > prePrice ? 'text-c-bullish-weak' : price < prePrice ? 'text-c-bearish-weak' : 'text-c-neutral'
    const arrowRotate = price > prePrice ? '' : 'rotate-180'
    const arrowHidden = (prePrice === '--' || price === prePrice) ? 'hidden' : ''
    return (
      <div className='flex flex-row flex-nowrap justify-start items-center text-xl ml-2 my-1.5 px-2'>
        <div className={`${color} pr-1`}>{floatStr(price)}</div>
        <ArrowUp className={`${color} h-5 w-5 mt-0.5 ${arrowRotate} ${arrowHidden}`} />
        <div className='pl-4 text-c-minor text-xs'>${floatStr(data.fiatValue)}</div>
      </div>
    )
  }

  const displayAggregate = () => (hoveredOnAggregate || hoverIndex['asks'] >= 0 || hoverIndex['bids'] >= 0)
  const orderVolumePaneRef = useRef(null)
  const orderVolumePane = () => {
    return (
      <div className={`flex flex-col
      ${activeTab === 'both' ? 'justify-center' : activeTab === 'bids' ? 'justify-start' : 'justify-end'}`}
      >
        <div ref={orderVolumePaneRef}>
          {displayAggregate() && aggregate()}
          {activeTab !== 'bids' && sideTable(orderDisplayCache.asks, 'asks')}
          {tradeBar(tradeBrief)}
          {activeTab !== 'asks' && sideTable(orderDisplayCache.bids, 'bids')}
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-start'>
      {panel()}
      {header()}
      {orderVolumePane()}
      {/* {debug()} */}
    </div>
  )
}

export default MarketOrderBook
