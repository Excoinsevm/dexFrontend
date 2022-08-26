import React, { useState, useEffect } from 'react'
import { floatStr } from '../common/Utils'
import TabTable from './TabTable'
import { useWeb3Context } from '../context/Web3Context'
// import { web3Methods } from '../context/Web3'
import { FaStar as StarIcon } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const MarketQuotesMini = () => {

  // ------ external data
  const {
    quotes,
    scheduleAllMarketTradesFetch,
    cancelAllMarketTradesFetchSchedule,
    favTickers,
    updateFavTickers,
    tradePairDisplayDecimal
  } = useWeb3Context()
  // const {
  //   scheduleAllMarketTradesFetch,
  //   cancelAllMarketTradesFetchSchedule,
  // } = web3Methods()

  // ------ state data
  const [raw, setRaw] = useState({ brief: {} })
  const [data, setData] = useState(false)
  useEffect(() => {
    scheduleAllMarketTradesFetch(setRaw)
    return () => cancelAllMarketTradesFetchSchedule()
  }, [])

  useEffect(() => {
    if (Object.keys(raw.brief).length > 0) {
      // console.log('----------------', raw.brief)
      setData(raw.brief)
    }
  }, [raw])

  // ------ column definition
  const navigate = useNavigate()
  const sortColFunc = (col) => col
  const clickRow = (row) => navigate('/trade/' + row.base + '-' + row.quote)

  const toggleFav = (row) => {
    if (row.fav) {
      row.fav = false
      const tickers = favTickers.filter((favTicker) => favTicker !== row.pair)
      updateFavTickers(tickers)
    }
    else {
      row.fav = true
      const tickers = [...favTickers, row.pair]
      updateFavTickers(tickers)
    }
  }

  const changeColor = (change) => {
    if (change > 0) return ' text-c-bullish';
    else if (change < 0) return ' text-c-bearish';
    else return '';
  }

  const checkFloat = (v) => {
    const n = parseFloat(v)
    if (isNaN(n) || n === Infinity) return false
    else return true
  }

  const commonTH = 'px-2 py-1 '
  const commonTD = 'px-2 py-0.5 '
  const tableConfig = {
    columns: [
      {
        label: 'Name', header: 'sort', key: 'pair',
        val: (row) => (
          <div className='flex flex-row justify-start items-center min-w-fit'>
            <StarIcon className={`mr-1.5 ${row.fav ? 'text-c-icon-sel' : 'text-c-minor2'}`}
              onClick={(e) => { e.stopPropagation(); toggleFav(row) }} />
            <span className='font-medium'>{row.base}</span>
            <span className='text-c-minor'>{'/' + row.quote}</span>
          </div>
        ),
        thCell: commonTH + 'text-left w-[30%]',
        tdCell: () => commonTD + 'text-left w-[30%]',
        cellFlex: 'flex justify-start',
      },
      {
        label: 'Price', header: 'sort', key: 'price',
        val: (row) => floatStr(row.price, tradePairDisplayDecimal(row.base, row.quote).quoteDecimal),
        thCell: commonTH + 'text-right w-[30%]',
        tdCell: (row) => commonTD + 'text-right w-[30%] ' + changeColor(row.dir),
        cellFlex: 'flex justify-end',
      },
      {
        label: '24h Change', header: 'sort', key: 'change24h',
        val: (row) => checkFloat(row.change24hPercent) ? floatStr(row.change24hPercent * 100) + '%' : '--',
        thCell: commonTH + 'text-right w-[30%]',
        tdCell: (row) => commonTD + 'text-right w-[30%] ' + changeColor(row.change24hPercent),
        cellFlex: 'flex justify-end',
      },
    ],
    headerContainer: 'flex flex-row justify-between my-1 text-xs text-c-minor',
    dataContainer: 'h-[250px]',
    headerArrowIcon: 'w-[0.42rem] h-[1rem]',
    rowContainer: `flex flex-row justify-between pb-1 text-xs text-c-major bg-c-major
                   hover:bg-c-minor cursor-pointer`,
    noRecord: 'py-4 text-center text-xs text-c-minor bg-c-major',
    topBar: 'flex flex-col-reverse flex-wrap justify-start items-start',
    tabsContainer: 'flex flex-row flex-nowrap justify-start items-center w-full px-2 pt-3.5 font-medium text-center text-c-btn-muted',
    tab: 'ml-2 mr-1 text-xs font-bold whitespace-nowrap cursor-pointer select-none ',
    favIcon: 'mb-0.5 mr-1',
    tabActive: 'text-c-tab active',
    tabInactive: 'hover:text-c-tab-muted-h',
    searchContainer: 'px-2 w-full',
    searchInput: 'border rounded-md w-full pl-10 p-1 pr-0',
  }

  return (
    <div className='border-b border-c-weak2'>
      <TabTable
        config={tableConfig}
        sortColFunc={sortColFunc}
        tabNames={quotes}
        data={data}
        favTickers={favTickers}
        clickRow={clickRow}
        searchCol={'pair'}
      />
    </div>
  )
}

export default MarketQuotesMini
