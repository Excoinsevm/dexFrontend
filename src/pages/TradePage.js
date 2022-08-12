import React, { useEffect, useState } from 'react'
import Trade from '../components/Trade'
import { useParams } from 'react-router-dom'
import { web3Methods } from '../context/Web3'
import ResourceResponse from '../components/ResourceResponse'


const TradePage = () => {

  const { ticker } = useParams()
  const { getQuotesTokens } = web3Methods()
  const [resStatus, setResStatus] = useState('loading')

  useEffect(() => {
    const load = async () => {
      const res = await getQuotesTokens()
      // console.log('ticker --->', ticker, '\nres --->', res)
      if (res) {
        const [quotes, tokens] = res
        const [base, quote] = ticker ? ticker.split('-') : ['ETH', 'USDT']
        if (
          ticker !== 'USDT-ETH' && base !== quote
          && quotes.includes(quote) && tokens.includes(base)) {
          setResStatus('ready')
        }
        else {
          setResStatus('notfound')
        }
      }
      else {
        setResStatus('timeout')
      }
    }
    load()
  }, [])

  if (resStatus === 'ready') return (
    <Trade ticker={ticker} />
  )
  else return (
    <ResourceResponse resName={'Trade pair ' + ticker} status={resStatus} />
  )
}

export default TradePage
