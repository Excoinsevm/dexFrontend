import React from 'react'
import { useState, useEffect } from 'react'
import { floatStr } from '../common/Utils'
import { useWeb3Context } from '../context/Web3Context'
import Table from './Table'
import DepositWithdrawModal from './DepositWithdrawModal'
import WalletConnectReminder from './WalletConnectReminder'
import ResourceResponse from '../components/ResourceResponse'


const UserFunds = ({ base, quote, hideSmall, hideOthers }) => {

  // ------ external data
  const {
    connect,
    currentAccount,
    tokens,
    balance,
    balanceLoadStatus,
    tokenBalanceDecimal
  } = useWeb3Context()

  // ------ test data
  // const data = [
  //   { id: 1, token: 'BTC', tb: 35.0152, ab: 32.0152, io: 3 },
  //   { id: 2, token: 'ETH', tb: 125.3324, ab: 120.3324, io: 5 },
  //   { id: 3, token: 'USDT', tb: 3000000, ab: 3000000, io: 0 },
  //   { id: 4, token: 'BLUE', tb: 10000000, ab: 10000000, io: 0 },
  // ]
  const tokenPrice = (token) => {
    if (token === 'BTC') return 25141.0152
    else if (token === 'ETH') return 1314.3324
    else if (token === 'USDT') return 1
    else if (token === 'BLUE') return 0.25
    else return 0
  }

  // ------ internal data
  const mapBalance = () => tokens.map((t, i) => (
    {
      id: i, token: t, tb: Number(balance[t][1]), ab: Number(balance[t][1]) - Number(balance[t][2]),
      io: Number(balance[t][2]), wb: Number(balance[t][0])
    }
  ))

  const [balances, setBalances] = useState([])

  useEffect(() => {
    // console.log('UserFunds --->', currentAccount, balance)
    if (balance) {
      let blc = mapBalance()
      if (hideSmall || hideOthers) {
        blc = blc.filter(
          b => (!hideSmall || (b.tb > 0 || b.wb > 0)) && (!hideOthers || (b.token === base || b.token === quote))
        )
      }
      setBalances(blc)
    } else {
      setBalances([])
    }
  }, [balance, hideSmall, hideOthers])

  // ------ column definition
  const bd = tokenBalanceDecimal
  const [filter, setFilter] = useState(false)
  const [hoverRowIdx, setHoverRowIdx] = useState(-1)
  const [DW, setDW] = useState(false)
  const [DWOpenCount, setDWOpenCount] = useState(0)
  const openDW = () => setDWOpenCount(DWOpenCount + 1)

  const sortColFunc = (col) => col === 'worth' ? ((row) => row.tb * tokenPrice(row.token)) : col

  const common = 'px-2 py-1 w-full '
  const tableConfig = {
    columns: [
      {
        label: 'Token', header: 'sort', key: 'token', val: (row, idx) =>
        (<div className='flex flex-row justify-start items-center min-w-fit w-fit'
          onClick={() => { }}>
          <span className={`font-medium`}>
            {row.token}
          </span>
        </div>),
        thCell: common, tdCell: () => common
      },
      { label: 'Wallet balance', header: 'sort', key: 'wb', val: (row) => floatStr(row.wb, bd(row.token)), thCell: common, tdCell: () => common },
      { label: 'Dex balance', header: 'sort', key: 'tb', val: (row) => floatStr(row.tb, bd(row.token)), thCell: common, tdCell: () => common },
      { label: 'Available', header: 'sort', key: 'ab', val: (row) => floatStr(row.ab, bd(row.token)), thCell: common, tdCell: () => common },
      { label: 'In order', header: 'sort', key: 'io', val: (row) => floatStr(row.io, bd(row.token)), thCell: common, tdCell: () => common },
      {
        label: 'Worth value (Dex)', header: 'sort', key: 'worth', val: (row) => floatStr(row.tb * tokenPrice(row.token)),
        thCell: common, tdCell: () => common
      },
      {
        label: 'Deposit', header: '', key: 'deposit', val: (row) =>
        (<div className='flex flex-row justify-end items-center min-w-fit text-c-tab'>
          <span className='font-medium cursor-pointer select-none'
            onClick={() => { setDW({ type: 'deposit', token: row.token }); openDW(); }}>
            deposit
          </span>
        </div >),
        thCell: common + 'text-right', tdCell: () => common + 'text-right'
      },
      {
        label: 'Withdraw', header: '', key: 'withdraw', val: (row) =>
        (<div className='flex flex-row justify-end items-center min-w-fit text-c-tab'>
          <span className='font-medium cursor-pointer select-none'
            onClick={() => { setDW({ type: 'withdraw', token: row.token }); openDW(); }}>
            withdraw
          </span>
        </div >),
        thCell: common + 'text-right', tdCell: () => common + 'text-right'
      },
    ],
    headerContainer: 'flex flex-row justify-between my-1 text-xs text-c-minor border-b border-c-weak2',
    headerArrowIcon: 'w-[0.42rem] h-[1rem]',
    dataContainer: 'max-h-[260px] overflow-y-scroll',
    rowContainer: 'flex flex-row justify-between pb-0.5 text-xs text-c-major bg-c-major hover:bg-c-minor',
    noRecord: 'py-4 text-center text-xs text-c-minor bg-c-major',
    noRecordAlt: (
      !currentAccount && <WalletConnectReminder onClick={connect} />
    )
  }

  if (balanceLoadStatus === 'ready' || balanceLoadStatus === 'init') return (
    <div className='w-full'>
      <Table
        config={tableConfig}
        data={balances}
        sortColFunc={sortColFunc}
        hoverRow={(idx) => setHoverRowIdx(idx)}
        filter={filter}
      />
      {DW && <DepositWithdrawModal type={DW.type} token={DW.token} openct={DWOpenCount} />}
    </div>
  )
  else return (
    <ResourceResponse resName={'User data '} status={balanceLoadStatus} style='mt-2' iconSize='w-16 h-16' />
  )
}

export default UserFunds
