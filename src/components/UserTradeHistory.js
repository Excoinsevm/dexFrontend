import React, { useState, useEffect } from 'react'
import { floatStr, datetimeStr } from '../common/Utils'
import { useNavigate } from 'react-router-dom'
import Table from './Table'
import Dropdown from './Dropdown'
import { useWeb3Context } from '../context/Web3Context'
import WalletConnectReminder from './WalletConnectReminder'

const UserTradeHistory = ({ tradePair, base, quote, hideOthers }) => {

  // external data
  const {
    connect,
    currentAccount,
    currentAccountTradesChanged,
    filterCurrentAccountAllTrades
  } = useWeb3Context()

  // ------ state data
  const [data, setData] = useState([])
  useEffect(() => {
    const fetchAndSet = async () => {
      const _data = await filterCurrentAccountAllTrades()
      if (hideOthers)
        setData(_data.filter(o => o.base === base && o.quote === quote))
      else
        setData(_data)
    }
    if (currentAccount) {
      fetchAndSet()
    } else {
      setData([])
    }
  }, [hideOthers, tradePair, currentAccount, currentAccountTradesChanged])

  // ------ column definition
  const [filter, setFilter] = useState(false)
  const [hoverRowIdx, setHoverRowIdx] = useState(-1)

  const sidecolor = (side) => {
    if (side === 'BUY') return ' text-c-bullish';
    else if (side === 'SELL') return ' text-c-bearish';
    else return '';
  }

  const navigate = useNavigate()
  const sortColFunc = (col) => col === 'total' ? ((row) => row.p * row.q) : col

  const common = 'px-2 py-1 w-[12%] '
  const tableConfig = {
    columns: [
      {
        label: 'Ticker', header: 'sort', key: 'ticker', val: (row, idx) =>
        (<div className='flex flex-row justify-start items-center min-w-fit cursor-pointer w-fit'
          onClick={() => navigate('/trade/' + row.base + '-' + row.quote)}>
          <span className={`font-medium ${hoverRowIdx === idx ? 'text-c-tab' : ''}`}>
            {row.base}
          </span>
          <span className={hoverRowIdx === idx ? 'text-c-tab' : 'text-c-minor'}>
            {'/' + row.quote + (hoverRowIdx === idx ? ' >' : '')}
          </span>
        </div>),
        thCell: common, tdCell: () => common
      },
      { label: 'Date', header: 'sort', key: 't', val: (row) => datetimeStr(row.t), thCell: common, tdCell: () => common },
      // { label: 'Type', header: 'sort', key: 'type', val: (row) => row.type.toUpperCase(), thCell: common, tdCell: () => common },
      {
        label: 'Side', header: 'com', key: 'side', val: (row) => row.side.toUpperCase(),
        thCell: common, tdCell: (row) => common + sidecolor(row.side.toUpperCase())
      },
      { label: 'Price', header: 'sort', key: 'p', val: (row) => floatStr(row.p), thCell: common, tdCell: () => common },
      { label: 'Quantity', header: 'sort', key: 'q', val: (row) => floatStr(row.q), thCell: common, tdCell: () => common },
      {
        label: 'Total', header: 'sort', key: 'total', val: (row) => floatStr(row.p * row.q) + ' ' + row.quote,
        thCell: common,
        tdCell: () => common
      },
      { label: 'Trade', header: 'sort', key: 'tradeId', val: (row) => row.tradeId, thCell: common, tdCell: () => common },
      { label: 'Order', header: 'sort', key: 'orderId', val: (row) => row.orderId, thCell: common, tdCell: () => common },
    ],
    columnHeaderComs: {
      'side': () => (
        <Dropdown title='Side' options={['ALL', 'BUY', 'SELL']} displaySelected={(v) => v === 'ALL' ? 'Side' : v}
          hoverOpen selectOption={(op) => setFilter({ ...filter, side: op === 'ALL' ? '' : op })} />
      ),
    },
    headerContainer: 'flex flex-row justify-between my-1 text-xs text-c-minor border-b border-c-weak2',
    headerArrowIcon: 'w-[0.42rem] h-[1rem]',
    dataContainer: 'max-h-[260px] overflow-y-scroll',
    rowContainer: 'flex flex-row justify-between pb-0.5 text-xs text-c-major bg-c-major \
                   hover:bg-c-minor',
    noRecord: 'py-4 text-center text-xs text-c-minor bg-c-major',
    noRecordAlt: (
      !currentAccount && <WalletConnectReminder onClick={connect} />
    )
  }

  return (
    <div className='w-full'>
      {/* {debug()} */}
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

export default UserTradeHistory