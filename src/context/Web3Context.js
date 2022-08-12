import React, { useEffect, useState, useContext } from 'react'
import { createWeb3 } from './Web3'


// --------------------------------------------------------------------------------
// ------------ create web3: wallet, dex
const { initWeb3, web3Methods, useWeb3State } = createWeb3()


// --------------------------------------------------------------------------------
// ------------  Web3Context
const Web3Context = React.createContext()
export const useWeb3Context = () => useContext(Web3Context)
export const Web3ContextProvider = ({ children }) => {

  // -------------------------------------------------
  // ------------ states
  const web3State = useWeb3State()

  useEffect(() => {
    initWeb3()
  }, [])


  // -------------------------------------------------
  // ------------ favorite tickers
  const [favTickers, setFavTickers] = useState(('favTickers' in localStorage) ? JSON.parse(localStorage.favTickers) : [])
  const updateFavTickers = (tickers) => {
    setFavTickers(tickers)
    localStorage['favTickers'] = JSON.stringify(tickers)
  }


  // -------------------------------------------------
  // ------------ test data
  // const tdata = {
  //   'USDT': [
  //     { 'pair': 'ETHUSDT', 'base': 'ETH', 'quote': 'USDT', 'price': 2510.23, 'dir': 1, 'change24h': -0.0122, 'high24h': 2640.32, 'low24h': 2431.65, 'volume24h': 2341234, 'total24h': 34123432143 },
  //     { 'pair': 'BLUEUSDT', 'base': 'BLUE', 'quote': 'USDT', 'price': 28.13, 'dir': -1, 'change24h': 0.0532, 'high24h': 40.32, 'low24h': 31.65, 'volume24h': 23234, 'total24h': 123432143 },
  //     { 'pair': 'CYANUSDT', 'base': 'CYAN', 'quote': 'USDT', 'price': 10.23, 'dir': 0, 'change24h': -0.264, 'high24h': 20.32, 'low24h': 9.65, 'volume24h': 41234, 'total24h': 323432143 },
  //     { 'pair': 'PINKUSDT', 'base': 'PINK', 'quote': 'USDT', 'price': 10.23, 'dir': 1, 'change24h': -0.264, 'high24h': 20.32, 'low24h': 9.65, 'volume24h': 41234, 'total24h': 323432143 }
  //   ],
  //   'ETH': [
  //     { 'pair': 'REDETH', 'base': 'RED', 'quote': 'ETH', 'price': 1.23, 'dir': 1, 'change24h': 0.522, 'high24h': 1.32, 'low24h': 1.05, 'volume24h': 13.3, 'total24h': 134.3 },
  //     { 'pair': 'BLUEETH', 'base': 'BLUE', 'quote': 'ETH', 'price': 0.13, 'dir': -1, 'change24h': 0.0132, 'high24h': 0.32, 'low24h': 0.05, 'volume24h': 123.1, 'total24h': 34.22 },
  //     { 'pair': 'CYANETH', 'base': 'CYAN', 'quote': 'ETH', 'price': 0.23, 'dir': 0, 'change24h': -0.264, 'high24h': 0.25, 'low24h': 0.15, 'volume24h': 330.5, 'total24h': 343 }
  //   ],
  //   'BTC': [
  //     { 'pair': 'PINKBTC', 'base': 'PINK', 'quote': 'BTC', 'price': 0.0023, 'dir': 1, 'change24h': 0.0322, 'high24h': 0.0032, 'low24h': 0.0005, 'volume24h': 23.3, 'total24h': 14.3 },
  //     { 'pair': 'BLUEBTC', 'base': 'BLUE', 'quote': 'BTC', 'price': 0.0013, 'dir': -1, 'change24h': -0.532, 'high24h': 0.0032, 'low24h': 0.0005, 'volume24h': 333.1, 'total24h': 3.22 },
  //     { 'pair': 'CYANBTC', 'base': 'CYAN', 'quote': 'BTC', 'price': 0.0023, 'dir': 0, 'change24h': -0.264, 'high24h': 0.0025, 'low24h': 0.0015, 'volume24h': 220.5, 'total24h': 43 }
  //   ]
  // }

  // const marketOrders1 = {
  //   'BLUE-USDT': {
  //     b: [
  //       { p: 1340.24, q: 1.5332 },
  //       { p: 1322.04, q: 3.3642 },
  //       { p: 1311.76, q: 4.1954 },
  //       { p: 1299.45, q: 15.8322 },
  //       { p: 1289.08, q: 54.8322 },
  //       { p: 1282.92, q: 30.3125 },
  //       { p: 1281.31, q: 53.4323 },
  //       { p: 1280.64, q: 23.5342 },
  //       { p: 1279.33, q: 43.6347 },
  //       { p: 1278.05, q: 23.3676 },
  //       { p: 1277.12, q: 43.3410 },
  //       { p: 1276.75, q: 63.2456 },
  //       { p: 1275.86, q: 83.5482 },
  //       { p: 1274.45, q: 13.5234 },
  //       { p: 1273.57, q: 93.6326 },
  //       { p: 1272.23, q: 23.0734 },
  //       { p: 1271.21, q: 12.1234 },
  //       { p: 1270.11, q: 23.3234 },
  //     ],
  //     s: [
  //       { p: 1342.05, q: 21.5332 },
  //       { p: 1343.78, q: 3.3642 },
  //       { p: 1345.97, q: 5.1954 },
  //       { p: 1346.43, q: 23.1413 },
  //       { p: 1347.56, q: 54.3246 },
  //       { p: 1348.32, q: 54.6564 },
  //       { p: 1349.22, q: 23.6564 },
  //       { p: 1350.78, q: 34.8678 },
  //       { p: 1352.31, q: 43.6347 },
  //       { p: 1355.41, q: 34.4537 },
  //       { p: 1359.66, q: 13.8786 },
  //       { p: 1360.78, q: 43.8765 },
  //       { p: 1370.13, q: 83.5482 },
  //       { p: 1375.51, q: 54.8786 },
  //       { p: 1377.23, q: 56.6326 },
  //       { p: 1380.53, q: 23.0734 },
  //       { p: 1385.02, q: 12.1234 },
  //       { p: 1390.09, q: 26.3234 },
  //     ]
  //   }
  // }

  // -------------------------------------------------
  // ------------ output
  // console.log('->web3context', wallet, dex)
  // console.log('->web3context')
  // console.log('web3State', web3State)
  return (
    <Web3Context.Provider value={{
      ...web3State,
      ...web3Methods,
      // marketOrders: marketOrders2,
      favTickers,
      updateFavTickers
    }}>
      {children}
    </Web3Context.Provider>
  )
}
