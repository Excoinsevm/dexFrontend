import React, { useEffect, useState } from 'react'
import { floatStr } from '../common/Utils'
import { useWeb3Context } from '../context/Web3Context'
// import { web3Methods } from '../context/Web3'
import { useNavigate } from 'react-router-dom'
import TabTable from './TabTable'
import { FaStar as StarIcon } from 'react-icons/fa'
// import LoadingOverlayer from './LoadingOverlayer'
import ResourceResponse from '../components/ResourceResponse'

const MarketQuotes = () => {

  // ------ external data
  const {
    quotes,
    scheduleAllMarketTradesFetch,
    cancelAllMarketTradesFetchSchedule,
    favTickers,
    updateFavTickers
  } = useWeb3Context()
  // const {
  //   scheduleAllMarketTradesFetch,
  //   cancelAllMarketTradesFetchSchedule,
  // } = web3Methods()

  // ------ state data
  const [resStatus, setResStatus] = useState('loading')
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
      setResStatus('ready')
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

  const commonTH = 'w-full px-6 py-3 text-xs text-left font-bold uppercase '
  const commonTD = 'w-full px-6 py-4 text-sm text-left '
  const commonContentFlex = 'flex flex-row justify-start '
  const tableConfig = {
    columns: [
      {
        label: 'Name', header: 'sort', key: 'pair',
        val: (row) => (
          <div className='flex flex-row justify-start items-center min-w-fit'>
            <StarIcon className={`mr-2 ${row.fav ? 'text-c-icon-sel' : 'text-c-minor2'}`}
              onClick={(e) => { e.stopPropagation(); toggleFav(row) }} />
            <span className='font-medium'>{row.base}</span>
            <span className='text-c-minor text-sm ml-1'>{'/ ' + row.quote}</span>
          </div>
        ),
        thCell: commonTH,
        tdCell: () => commonTD,
        cellFlex: commonContentFlex
      },
      {
        label: 'Price', header: 'sort', key: 'price',
        val: (row) => floatStr(row.price),
        thCell: commonTH,
        tdCell: (row) => commonTD + ' ' + changeColor(row.dir),
        cellFlex: commonContentFlex
      },
      {
        label: '24h Change', header: 'sort', key: 'change24h',
        val: (row) => checkFloat(row.change24hPercent) ? floatStr(row.change24hPercent * 100) + '%' : '--',
        thCell: commonTH,
        tdCell: (row) => commonTD + ' ' + changeColor(row.change24hPercent),
        cellFlex: commonContentFlex
      },
      {
        label: '24h High / Low', header: 'plain', key: '',
        val: (row) => floatStr(row.high24h) + ' / ' + floatStr(row.low24h),
        thCell: commonTH + 'hidden sm:block',
        tdCell: (row) => commonTD + 'hidden sm:block',
        cellFlex: commonContentFlex
      },
      {
        label: '24h Volume', header: 'sort', key: 'volume24h',
        val: (row) => floatStr(row.volume24h),
        thCell: commonTH + 'hidden md:block',
        tdCell: (row) => commonTD + 'hidden md:block',
        cellFlex: commonContentFlex
      },
      {
        label: '24h Total', header: 'sort', key: 'total24h',
        val: (row) => floatStr(row.total24h),
        thCell: commonTH + 'hidden lg:block',
        tdCell: (row) => commonTD + 'hidden lg:block',
        cellFlex: commonContentFlex
      },
    ],
    headerContainer: 'flex flex-row text-xs text-c-minor uppercase bg-c-minor',
    headerArrowIcon: 'w-2 h-4',
    rowContainer: `flex flex-row justify-between pb-1 text-xs text-c-major bg-c-major
                   hover:bg-c-minor cursor-pointer border-b border-c-weak2`,
    noRecord: 'py-4 text-center text-lg text-c-minor bg-c-major',
    topBar: 'flex flex-row flex-wrap justify-between items-center pt-4 bg-c-minor2',
    tabsContainer: 'flex flex-nowrap px-6 pb-4 text-sm font-medium text-center text-c-btn-muted',
    tab: 'inline-block mr-2 py-2 px-4 rounded-lg whitespace-nowrap cursor-pointer select-none ',
    showFavText: true,
    favIcon: 'mr-1.5',
    tabActive: 'text-c-btn bg-c-btn active',
    tabInactive: 'hover:text-c-btn-muted-h hover:bg-c-btn-muted-h',
    searchContainer: 'px-6 pb-4',
    searchInput: 'border-2 rounded-lg w-52 pl-10 p-2 pr-0',
  }

  if (resStatus === 'ready') return (
    <div className='w-full max-w-screen-2xl overflow-x-auto rounded-xl shadow-md'>
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
  else return (
    <ResourceResponse resName={'Market '} status={resStatus} />
  )
}

export default MarketQuotes
