import React from 'react'
import { useState } from 'react'
import { floatStr, datetimeStr } from '../common/Utils'
// import { useWeb3Context } from '../context/Web3Context'
import { useNavigate } from 'react-router-dom'
import Table from './Table'
import Dropdown from './Dropdown'
// import { BiTrash as DeleteIcon } from 'react-icons/bi'

const UserOpenOrder = () => {

  // ------ test data
  // const { openOrders } = useWeb3Context()
  const tnow = Date.now()
  const data = [
    { id: 1, date: tnow - (Math.random() + 1) * 10000, ticker: 'ETHUSDT', quote: 'USDT', type: 'LIMIT', side: 'BUY', price: 1902.04, qty: 0.2, filled: 0.35, stat: 'Filled' },
    { id: 2, date: tnow - (Math.random() + 1) * 30000, ticker: 'ETHUSDT', quote: 'USDT', type: 'LIMIT', side: 'SELL', price: 1900.04, qty: 0.3, filled: 0.55, stat: 'Partially Filled' },
    { id: 3, date: tnow - (Math.random() + 1) * 60000, ticker: 'BTCUSDT', quote: 'USDT', type: 'LIMIT', side: 'BUY', price: 1800.68, qty: 0.15, filled: 0.27, stat: 'Canceled' },
    { id: 4, date: tnow - (Math.random() + 1) * 60000, ticker: 'ETHBTC', quote: 'BTC', type: 'MARKET', side: 'SELL', price: 1800.68, qty: 0.55, filled: 0.27, stat: 'Expired' },
  ]

  // ------ column definition
  const [filter, setFilter] = useState(false)
  const [hoverRowIdx, setHoverRowIdx] = useState(-1)

  const sidecolor = (side) => {
    if (side === 'BUY') return ' text-c-bullish';
    else if (side === 'SELL') return ' text-c-bearish';
    else return '';
  }

  const navigate = useNavigate()
  const sortColFunc = (col) => col === 'total' ? ((row) => row.price * row.qty) : col

  const common = 'px-2 py-1 w-full '
  const tableConfig = {
    columns: [
      {
        label: 'Ticker', header: 'sort', key: 'ticker', val: (row, idx) =>
        (<div className='flex flex-row justify-start items-center min-w-fit cursor-pointer w-fit'
          onClick={() => navigate('/trade/' + row.ticker)}>
          <span className={`font-medium ${hoverRowIdx === idx ? 'text-c-tab' : ''}`}>
            {row.ticker.replace(row.quote, '')}
          </span>
          <span className={hoverRowIdx === idx ? 'text-c-tab' : 'text-c-minor'}>
            {'/' + row.quote + (hoverRowIdx === idx ? ' >' : '')}
          </span>
        </div>),
        thCell: common, tdCell: () => common
      },
      { label: 'Date', header: 'sort', key: 'date', val: (row) => datetimeStr(row.date), thCell: common, tdCell: () => common },
      { label: 'Type', header: 'sort', key: 'type', val: (row) => row.type.toUpperCase(), thCell: common, tdCell: () => common },
      {
        label: 'Side', header: 'com', key: 'side', val: (row) => row.side.toUpperCase(),
        thCell: common, tdCell: (row) => common + sidecolor(row.side.toUpperCase())
      },
      { label: 'Price', header: 'sort', key: 'price', val: (row) => floatStr(row.price), thCell: common, tdCell: () => common },
      { label: 'Average', header: 'plain', key: '', val: (row) => floatStr(row.price), thCell: common, tdCell: () => common },
      { label: 'Quantity', header: 'sort', key: 'qty', val: (row) => floatStr(row.qty), thCell: common, tdCell: () => common },
      { label: 'Filled', header: 'sort', key: 'filled', val: (row) => floatStr(row.filled * 100) + '%', thCell: common, tdCell: () => common },
      {
        label: 'Total', header: 'sort', key: 'total', val: (row) => floatStr(row.price * row.qty) + ' ' + row.quote,
        thCell: common,
        tdCell: () => common
      },
      {
        label: 'Status', header: 'com', key: 'stat', val: (row) => (
          <div className='flex justify-end'>
            {row.stat}
          </div>
        ),
        thCell: common + 'text-right',
        tdCell: () => common + 'text-right'
      },
    ],
    columnHeaderComs: {
      side: () => (
        <Dropdown title='Side' options={['ALL', 'BUY', 'SELL']} displaySelected={(v) => v === 'ALL' ? 'Side' : v}
          hoverOpen selectOption={(op) => setFilter({ ...filter, side: op === 'ALL' ? '' : op })}
        />
      ),
      stat: () => (
        <div className='flex flex-row justify-end'>
          <Dropdown title='Status' options={['All', 'Filled', 'Partially Filled', 'Canceled', 'Expired']} hoverOpen
            pos='br' displaySelected={(v) => v === 'All' ? 'Status' : v}
            selectOption={(op) => setFilter({ ...filter, stat: op === 'All' ? '' : op })}
          />
        </div>
      )
    },
    headerContainer: 'flex flex-row justify-between my-1 text-xs text-c-minor border-b border-c-weak2',
    headerArrowIcon: 'w-[0.42rem] h-[1rem]',
    rowContainer: 'flex flex-row justify-between pb-0.5 text-xs text-c-major bg-c-major \
                   hover:bg-c-minor transition-all duration-300',
    noRecord: 'py-4 text-center text-xs text-c-minor bg-c-major',
  }

  return (
    <div className='w-full'>
      <Table
        config={tableConfig}
        data={data}
        sortColFunc={sortColFunc}
        hoverRow={(idx) => setHoverRowIdx(idx)}
        filter={filter}
      />
    </div>
  )
}

export default UserOpenOrder
