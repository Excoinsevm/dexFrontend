import React, { useEffect } from 'react'
import { useState } from 'react'
import { floatStr, datetimeStr } from '../common/Utils'
import { useNavigate } from 'react-router-dom'
import Table from './Table'
import Dropdown from './Dropdown'
import { BiTrash as DeleteIcon } from 'react-icons/bi'
import WalletConnectReminder from './WalletConnectReminder'
// import { web3Methods } from '../context/Web3'
import { useWeb3Context } from '../context/Web3Context'
import TradeOrderModal from './TradeOrderModal'
import ResourceResponse from '../components/ResourceResponse'


const UserOpenOrder = ({ tradePair, base, quote, hideOthers }) => {

  // ============ debug start
  // ------ test data
  // const { openOrders } = useWeb3Context()
  // const tnow = Date.now()
  // const data = [
  //   { id: 1, date: tnow - (Math.random() + 1) * 10000, ticker: 'ETHUSDT', quote: 'USDT', type: 'LIMIT', side: 'BUY', p: 1902.04, q: 0.2, f: 0.35 },
  //   { id: 2, date: tnow - (Math.random() + 1) * 30000, ticker: 'ETHUSDT', quote: 'USDT', type: 'LIMIT', side: 'SELL', p: 1900.04, q: 0.3, f: 0.55 },
  //   { id: 3, date: tnow - (Math.random() + 1) * 60000, ticker: 'BTCUSDT', quote: 'USDT', type: 'LIMIT', side: 'BUY', p: 1800.68, q: 0.15, f: 0.27 },
  //   { id: 4, date: tnow - (Math.random() + 1) * 60000, ticker: 'ETHBTC', quote: 'BTC', type: 'MARKET', side: 'SELL', p: 1800.68, q: 0.55, f: 0.27 },
  // ]
  // const { balance, fetchAllMarketOrders, loadBalance } = useWeb3Context()

  // const debug = () => (
  //   <div className='flex flex-col justify-center items-center text-c-minor text-lg mb-2'>
  //     <button className='text-c-major rounded-full bg-yellow-800 hover:bg-yellow-600 w-24 my-1'
  //       onClick={async () => {
  //         // filterCurrentAccountAllOrders()
  //         const _data = await filterCurrentAccountAllOrders()
  //         if (hideOthers)
  //           setData(_data.filter(o => o.base === base && o.quote === quote))
  //         else
  //           setData(_data)
  //       }}
  //     >
  //       orders</button>
  //     {/* <button className='text-c-major rounded-full bg-yellow-800 hover:bg-yellow-600 w-24 my-1'
  //       onClick={() => loadBalance()}>
  //       balance</button> */}
  //   </div>
  // )
  // ============ debug end


  // ------ exteranal data
  // const { filterCurrentAccountAllOrders } = web3Methods()
  const {
    connect,
    currentAccount,
    allOrdersLoadStatus,
    currentAccountOrdersChanged,
    filterCurrentAccountAllOrders,
    cancelOrder
  } = useWeb3Context()
  // console.log('currentAccountOrders --->',)


  // ------ state data
  const [order, setOrder] = useState(false)
  const [modalOpenCount, setModalOpenCount] = useState(0)
  const openModal = () => setModalOpenCount(modalOpenCount + 1)

  const [data, setData] = useState([])

  useEffect(() => {
    const fetchAndSet = async () => {
      const _data = await filterCurrentAccountAllOrders()
      if (hideOthers)
        setData(_data.filter(o => o.base === base && o.quote === quote))
      else
        setData(_data)
      // console.log('currentAccountOrders --->', _data)
    }
    if (currentAccount) {
      fetchAndSet()
    } else {
      setData([])
    }
  }, [hideOthers, tradePair, currentAccount, currentAccountOrdersChanged])


  // ------ column definition
  const [filter, setFilter] = useState(false)
  const [hoverRowIdx, setHoverRowIdx] = useState(-1)

  const onCancelOrder = (id, base, quote, side, type, amount, price) => {
    // console.log('cancel order', id)
    setOrder({ id, base, quote, side, type, amount, price, op: 'cancel' })
    const SIDE = { BUY: 0, SELL: 1 };
    cancelOrder(id, base, quote, SIDE[side.toUpperCase()])
    openModal()
  }

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
      { label: 'Date', header: 'sort', key: 'date', val: (row) => datetimeStr(row.date), thCell: common, tdCell: () => common },
      { label: 'Type', header: 'sort', key: 'type', val: (row) => row.type.toUpperCase(), thCell: common, tdCell: () => common },
      {
        label: 'Side', header: 'com', key: 'side', val: (row) => row.side.toUpperCase(),
        thCell: common, tdCell: (row) => common + sidecolor(row.side.toUpperCase())
      },
      { label: 'Price', header: 'sort', key: 'p', val: (row) => floatStr(row.p), thCell: common, tdCell: () => common },
      { label: 'Quantity', header: 'sort', key: 'q', val: (row) => floatStr(row.q), thCell: common, tdCell: () => common },
      { label: 'Filled', header: 'sort', key: 'f', val: (row) => floatStr(row.f * 100) + '%', thCell: common, tdCell: () => common },
      {
        label: 'Total', header: 'sort', key: 'total', val: (row) => floatStr(row.p * row.q) + ' ' + row.quote,
        thCell: common,
        tdCell: () => common
      },
      {
        label: 'Cancel Order', header: 'plain', key: 'cancel', val: (row) => (
          <div className='flex justify-end'>
            <DeleteIcon className='h-4 w-4 mr-4 cursor-pointer' onClick={
              () => onCancelOrder(row.id, row.base, row.quote, row.side, row.type, row.q, row.p)
            } />
          </div>
        ),
        thCell: common + 'text-right',
        tdCell: () => common + 'text-right'
      },
    ],
    columnHeaderComs: {
      'side': () => (
        <Dropdown title='Side' options={['ALL', 'BUY', 'SELL']} displaySelected={(v) => v === 'ALL' ? 'Side' : v}
          hoverOpen selectOption={(op) => setFilter({ ...filter, side: op === 'ALL' ? '' : op })} />
      ),
      'cancel': () => (
        <div className='flex flex-row justify-end'>
          <Dropdown title='Cancel All' options={['All', 'Limit', 'Market', 'Buy', 'Sell']} hoverOpen
            clickTitle={() => {
              cancelOrder(data.map(row => row.id))
            }}
            selectOption={(op) => {
              if (op === 'All') {
                cancelOrder(data.map(row => row.id))
              } else if (op === 'Limit' || op === 'Market') {
                cancelOrder(data.filter(row => row.type === op.toUpperCase()).map(row => row.id))
              } else {
                cancelOrder(data.filter(row => row.side === op.toUpperCase()).map(row => row.id))
              }
            }}
          />
        </div>
      )
    },
    headerContainer: 'flex flex-row justify-between my-1 text-xs text-c-minor border-b border-c-weak2',
    headerArrowIcon: 'w-[0.42rem] h-[1rem]',
    rowContainer: 'flex flex-row justify-between pb-0.5 text-xs text-c-major bg-c-major \
                   hover:bg-c-minor',
    noRecord: 'py-4 text-center text-xs text-c-minor bg-c-major',
    noRecordAlt: (
      !currentAccount && <WalletConnectReminder onClick={connect} />
    )
  }

  if (allOrdersLoadStatus === 'ready' || allOrdersLoadStatus === 'init') return (
    <div className='w-full'>
      {/* {debug()} */}
      <Table
        config={tableConfig}
        data={data}
        sortColFunc={sortColFunc}
        hoverRow={(idx) => setHoverRowIdx(idx)}
        filter={filter}
      />
      {order && <TradeOrderModal order={order} openct={modalOpenCount} />}
    </div>
  )
  else return (
    <ResourceResponse resName={'User data '} status={allOrdersLoadStatus} style='mt-2' iconSize='w-16 h-16' />
  )
}

export default UserOpenOrder
