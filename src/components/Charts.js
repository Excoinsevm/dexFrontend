import React, { useRef, useEffect } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'
import { priceData } from "./testdata/priceData";
import { volumeData } from "./testdata/volumeData";
import { AppConsts } from '../Consts'
import { useThemeContext } from '../context/ThemeContext'

const Charts = () => {
  const { colorTheme } = useThemeContext()

  const chartContainerRef = useRef()
  const chart = useRef()
  const resizeObserver = useRef()

  const getThemeOptions = () => {
    const cssstyle = getComputedStyle(document.getElementById(AppConsts.id))
    // console.log(cssstyle.getPropertyValue('--color-major-t'))
    return {
      chart: {
        layout: {
          backgroundColor: cssstyle.getPropertyValue('--color-major-b'),
          textColor: cssstyle.getPropertyValue('--color-minor-t'),
          lineColor: cssstyle.getPropertyValue('--color-minor-t'),
        },
        grid: {
          vertLines: { color: cssstyle.getPropertyValue('--color-minor-b') },
          horzLines: { color: cssstyle.getPropertyValue('--color-minor-b') },
        },
        rightPriceScale: {
          borderColor: cssstyle.getPropertyValue('--color-minor-b'),
        },
        watermark: {
          color: cssstyle.getPropertyValue('--color-minor-b'),
        },
      }
    }
  }

  // // const bg = 'var(--color-minor-b)'
  // const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-major-t')
  // console.log('---->', bg)
  // // console.log('--1', document.getElementById('myapp'))
  // console.log('--2', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-tt'))
  // console.log('--3', getComputedStyle(document.documentElement).getPropertyValue('--theme-color-tt'))
  // // console.log('+++', document.documentElement.style.getPropertyValue('--test-color'))

  useEffect(() => {
    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 480,// chartContainerRef.current.clientHeight,
      layout: {
        backgroundColor: '#1a1a1a',
        textColor: "rgba(255, 255, 255, 0.9)"
      },
      grid: {
        vertLines: {
          color: "#334158"
        },
        horzLines: {
          color: "#334158"
        }
      },
      crosshair: {
        mode: CrosshairMode.Normal
      },
      leftPriceScale: {
        visible: false
      },
      rightPriceScale: {
        visible: true
      },
      priceScale: {
        borderColor: "#485c7b",
        // position: 'left',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25
        }
      },
      timeScale: {
        borderColor: "#485c7b"
      },
      watermark: {
        text: "Freedex",
        fontSize: 84,
        fontStyle: "italic",
        color: "rgba(255, 255, 255, 0.1)",
        visible: true
      }
    })

    const candleSeries = chart.current.addCandlestickSeries({
      upColor: "#4bffb5",
      downColor: "#ff4976",
      borderDownColor: "#ff4976",
      borderUpColor: "#4bffb5",
      wickDownColor: "#838ca1",
      wickUpColor: "#838ca1",
      priceLineVisible: false,
    })
    candleSeries.setData(priceData)

    // const areaSeries = chart.current.addAreaSeries({
    //   topColor: 'rgba(38,198,218, 0.56)',
    //   bottomColor: 'rgba(38,198,218, 0.04)',
    //   lineColor: 'rgba(38,198,218, 1)',
    //   lineWidth: 2
    // })
    // areaSeries.setData(areaData)

    const volumeSeries = chart.current.addHistogramSeries({
      color: "#182233",
      lineWidth: 2,
      priceFormat: {
        type: "volume"
      },
      overlay: true,
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    })
    volumeSeries.setData(volumeData)
  }, [])


  useEffect(() => {
    chart.current.applyOptions(getThemeOptions().chart)
  }, [colorTheme])

  // --- resize chart on container resizes.
  useEffect(() => {
    // return
    resizeObserver.current = new ResizeObserver(entries => {
      // console.log('resize', entries[0].contentRect)
      const { width, height } = entries[0].contentRect
      chart.current.applyOptions({ width: width, height: height })
      setTimeout(() => { chart.current.timeScale().fitContent() }, 0)
    })

    resizeObserver.current.observe(chartContainerRef.current)

    return () => resizeObserver.current.disconnect()
  }, [])

  return (

    <div
      ref={chartContainerRef}
      className=''
    />
  )
}

export default Charts
