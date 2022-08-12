import React, { useEffect, useRef } from 'react'
import { widget } from '../lib/tvcharts/charting_library'
import Datafeed from '../lib/tvcharts/dexdatafeed'

const TVCharts = () => {

  const tvref = useRef(null)

  // window.tvWidget = new widget({
  //   fullscreen: false,
  //   symbol: 'AAPL',
  //   interval: 'D',
  //   container_id: 'tvchart',
  //   datafeed: Datafeed,
  //   library_path: '../lib/tvcharts/charting_library/',
  // })

  const getLanguageFromURL = () => {
    const regex = new RegExp('[\\?&]lang=([^&#]*)');
    const results = regex.exec(window.location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  useEffect(() => {
    const widgetOptions = {
      symbol: 'AAPL',
      // BEWARE: no trailing slash is expected in feed URL
      // datafeed: new window.Datafeeds.UDFCompatibleDatafeed('https://demo_feed.tradingview.com'),
      datafeed: Datafeed,
      interval: 'D',
      container: 'tvchart',
      library_path: '../lib/tvcharts/charting_library/',

      locale: 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      fullscreen: false,
      autosize: true,
      studies_overrides: {},
    }

    const tvWidget = new widget(widgetOptions)

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton()
        button.setAttribute('title', 'Click to show a notification popup')
        button.classList.add('apply-common-tooltip')
        button.addEventListener('click', () => tvWidget.showNoticeDialog({
          title: 'Notification',
          body: 'TradingView Charting Library API works correctly',
          callback: () => {
            console.log('Noticed!')
          },
        }))

        button.innerHTML = 'Check API'
      })
    })
  }, [])



  return (
    <div id='tvchart'  >
    </div>
  )
}

export default TVCharts