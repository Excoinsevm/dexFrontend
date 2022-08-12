import React, { useEffect } from 'react'
import { useWeb3Context } from '../context/Web3Context'
import MarketQuotes from '../components/MarketQuotes'
import { IoMdWallet as WalletIcon } from 'react-icons/io'

const MarketPage = () => {
  const {
    walletInstalled,
    connect,
    currentAccount,
  } = useWeb3Context()

  const promptText = (txt, smResponsive = false) => (
    <h1 className={`whitespace-pre text-center text-c-heading font-bold 
                  ${smResponsive ? 'text-sm sm:text-lg' : 'text-lg'}`}>
      {txt}
    </h1>
  )

  // const highlightText = (txt, smResponsive = false) => (
  //   <h1 className={`w-fit h-fit my-3 text-center text-c-hlight bg-c-hlight font-bold
  //                   ${smResponsive ? 'text-xs sm:text-lg' : 'text-lg'}`}>
  //     {txt}
  //   </h1>
  // )

  const buttonStyle = `flex justify-center items-center mt-5 w-64 h-12 rounded-full border-2 uppercase 
                       font-bold text-c-btn border-c-btn hover:mix-blend-screen cursor-pointer`
  const PromptWalletInstallation = () => {
    return (
      <div className='grid h-28 justify-items-center'>
        {promptText('No wallet plugin found,  please install wallet')}
        <a
          className={`${buttonStyle} bg-gradient-to-r from-c-btn2-gr-f to-c-btn2-gr-t`}
          href='https://metamask.io/download/'>
          METAMASK
        </a>
      </div>
    )
  }

  const ConnectToWallet = () => {
    return (
      <div className='grid h-28 justify-items-center'>
        {promptText('Connect to your wallet to start trading')}
        {
          !currentAccount &&
          <div
            className={`${buttonStyle} bg-gradient-to-r from-c-btn-gr-f to-c-btn-gr-t`}
            onClick={connect} >
            <WalletIcon className='w-6 h-6 mr-2' />
            connect
          </div>
        }
      </div>
    )
  }

  const market = () => {
    return (
      <div className='flex flex-col justify-center items-center mt-12'>
        <MarketQuotes />
      </div>
    )
  }

  useEffect(() => {
    document.title = 'Market'
  }, [])

  return (
    <>
      <div className='mt-10'>
        {!walletInstalled && PromptWalletInstallation()}
        {walletInstalled && !currentAccount && ConnectToWallet()}
        {market()}
      </div>

    </>
  )
}

export default MarketPage
