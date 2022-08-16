import React from 'react'
import { useState, useEffect } from 'react'
import { sortData, filterTabData } from './TableHelper'
import { ReactComponent as Arrow } from '../images/ArrowDown.svg'
import { IoSearchSharp as SearchIcon } from 'react-icons/io5'
import { IoMdClose as CloseIcon } from 'react-icons/io'
import { FaStar as StarIcon } from 'react-icons/fa'
// import { AiOutlineConsoleSql } from 'react-icons/ai'

const TabTable = ({
  config, sortColFunc, tabNames,
  data, favTickers, hoverRow, clickRow, searchCol }) => {

  // ------ internal states
  const favTabName = 'Favorites'
  const extendedTabNames = [favTabName, ...tabNames]
  const tabIndices = extendedTabNames.reduce((acc, name) => ({
    ...acc,
    [name]: extendedTabNames.indexOf(name)
  }), {})
  const [activeTabIndex, setActiveTabIndex] = useState(1)
  const [searchKey, setSearchKey] = useState('')
  const [sortCol, setSortCol] = useState(false)
  const [sortOrder, setSortOrder] = useState(false)
  const [displayTabs, setDisplayTabs] = useState(extendedTabNames)
  const [sortedData, setSortedData] = useState()
  const [displayData, setDisplayData] = useState()

  // ------ event handlers
  const toggleSortCol = (col) => {
    if (sortCol === col) {
      if (sortOrder === false) setSortOrder('desc')
      else if (sortOrder === 'desc') setSortOrder('asc')
      else if (sortOrder === 'asc') setSortOrder(false)
    }
    else {
      setSortCol(col)
      setSortOrder('desc')
    }
  }

  const toggleSortOrder = (col, order) => {
    if (sortCol === col) {
      if (sortOrder === false) setSortOrder(order)
      else if (sortOrder === order) setSortOrder(false)
      else if (sortOrder === 'desc') setSortOrder('asc')
      else if (sortOrder === 'asc') setSortOrder('desc')
    }
    else {
      setSortCol(col)
      setSortOrder(order)
    }
  }

  // ------ effect functions
  useEffect(() => {
    if (data) {
      const sorted = sortData(data, sortColFunc(sortCol), sortOrder, favTabName, favTickers)
      const { filteredTabs, filteredData } = filterTabData(sorted, searchKey, searchCol, extendedTabNames, tabIndices)
      setSortedData(sorted)
      setDisplayTabs(filteredTabs)
      setDisplayData(filteredData)
    }
  }, [data, sortCol, sortOrder, favTickers, tabNames])

  useEffect(() => {
    if (sortedData) {
      const { filteredTabs, filteredData } = filterTabData(sortedData, searchKey, searchCol, extendedTabNames, tabIndices)
      setDisplayTabs(filteredTabs)
      setDisplayData(filteredData)
    }
  }, [searchKey])


  // -------------------------------------------------
  // ------ quote token tabs, search
  const search = () => (
    <div className={config.searchContainer}>
      <div className='relative' >
        <div className='absolute inset-y-0 left-0 mt-0.5 flex items-center pl-3 pointer-events-none'>
          <SearchIcon className='w-5 h-5 text-c-icon-norm' fill='currentColor' />
        </div>
        <input
          type='text'
          value={searchKey}
          placeholder='Search token'
          className={`text-sm block outline-none text-c-form bg-c-form border-c-weak hover:border-c-h
                      placeholder-c-pl focus:ring-c-r focus:border-c-f ${config.searchInput}`}
          onChange={(e) => { setSearchKey(e.target.value.trim()) }}
        />
        <div className={`absolute top-0 right-0 flex justify-center items-center h-full pr-3 cursor-pointer
                         ${searchKey === '' ? 'hidden' : ''}`}
          onClick={() => { setSearchKey('') }}
          onPointerDown={(e) => { e.preventDefault() }}
        >
          <CloseIcon className='text-c-icon-norm' />
        </div>
      </div >
    </div >
  )

  const tabContent = (name) => {
    if (name.startsWith(favTabName)) return (
      <div className='flex flex-row justify-center items-center'>
        <StarIcon className={config.favIcon} />
        <div>{config.showFavText ? name : name.replace(favTabName, '')}</div>
      </div>
    )
    else return name
  }

  const quoteTabs = () => {
    return (
      <ul className={config.tabsContainer}>
        {displayTabs.map((tab, index) => {
          return (
            <li key={index}>
              <div className={config.tab + (activeTabIndex === index ? config.tabActive : config.tabInactive)}
                onClick={() => setActiveTabIndex(index)}>
                {tabContent(tab)}
              </div>
            </li >
          )
        })}
      </ul>
    )
  }

  const tabs = () => {
    return (
      <div className={config.topBar}>
        {quoteTabs()}
        {search()}
      </div>
    )
  }


  // -------------------------------------------------
  // ------ table (header, body)
  const common = 'whitespace-nowrap '
  const tableHeader = () => {
    const sortIcon = (col) => {
      const picked = sortCol === col
      const downPicked = picked && sortOrder === 'desc'
      const upPicked = picked && sortOrder === 'asc'
      return (
        <div className='inline-flex'>
          <Arrow
            className={`${config.headerArrowIcon} ml-1 cursor-pointer ${downPicked ? 'text-c-icon-sel' : 'text-c-icon-norm'}`}
            onClick={() => toggleSortOrder(col, 'desc')}
          />
          <Arrow
            className={`${config.headerArrowIcon} ml-0 cursor-pointer rotate-180 ${upPicked ? 'text-c-icon-sel' : 'text-c-icon-norm'}`}
            onClick={() => toggleSortOrder(col, 'asc')}
          />
        </div>
      )
    }

    const colHeader = (col) => {
      if (col.header === 'sort') return (
        <div className='inline-flex select-none'>
          <div className='cursor-pointer' onClick={() => toggleSortCol(col.key)}>
            {col.label}
          </div>
          {sortIcon(col.key)}
        </div>
      )
      else if (col.header === 'com') return config.columnHeaderComs[col.key]()
      else return (col.label)
    }

    return (
      <div className={config.headerContainer}>
        {config.columns.map((col, index) => (
          <div key={index} className={common + (col.thCell ? col.thCell : '')}>
            <div className={col.cellFlex}>
              {colHeader(col)}
            </div>
          </div>
        ))}
      </div >
    )
  }

  const tableData = () => (
    <div className='flex flex-col overflow-y-auto'
      onPointerLeave={() => { if (hoverRow) hoverRow(-1) }}>
      {
        displayData && extendedTabNames[activeTabIndex] ?
          displayData[extendedTabNames[activeTabIndex]].map((row, rIndex) => (
            <div key={rIndex}
              className={config.rowContainer}
              onClick={() => { if (clickRow) clickRow(row) }}
              onPointerEnter={() => { if (hoverRow) hoverRow(rIndex) }}
            >
              {config.columns.map((col, index) => (
                <div key={index} className={common + (col.tdCell ? col.tdCell(row) : '')}>
                  <div className={col.cellFlex}>
                    {col.val(row, rIndex)}
                  </div>
                </div>
              ))}
            </div>
          )) : (<></>)
      }
    </div>
  )

  const table = () => (
    <div className='w-full h-full text-sm'>
      {tableHeader()}
      <div className={`overflow-y-auto ${config.dataContainer}`}>
        {tableData()}
        {(!displayData || !extendedTabNames[activeTabIndex] || displayData[extendedTabNames[activeTabIndex]].length === 0)
          &&
          <div className={config.noRecord}>
            No record
          </div>}
      </div>
    </div >
  )


  // -------------------------------------------------
  // ------ combined
  return (
    <div className='flex flex-col'>
      {tabs()}
      {table()}
    </div>
  )
}

export default TabTable
