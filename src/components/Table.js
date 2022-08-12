import React from 'react'
import { useState, useEffect } from 'react'
import { sortData, filterData } from './TableHelper'
import { ReactComponent as Arrow } from '../images/ArrowDown.svg'

const Table = ({ config, sortColFunc, data, hoverRow, clickRow, filter }) => {

  // ------ internal states
  const [sortCol, setSortCol] = useState(false)
  const [sortOrder, setSortOrder] = useState(false)
  const [displayData, setDisplayData] = useState()
  const [sortedData, setSortedData] = useState()

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
    const sorted = sortData({ d: data }, sortColFunc(sortCol), sortOrder)
    const filteredData = filterData(sorted.d, filter)
    setSortedData(sorted.d)
    setDisplayData(filteredData)
  }, [sortCol, sortOrder, data])

  useEffect(() => {
    if (sortedData) {
      const filteredData = filterData(sortedData, filter)
      setDisplayData(filteredData)
    }
  }, [filter])


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
        displayData ? displayData.map((row, rIndex) => (
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
        {(!displayData || displayData.length === 0)
          &&
          <div className={config.noRecord}>
            {(config.noRecordAlt) || 'No record'}
          </div>}
      </div>
    </div >
  )


  // -------------------------------------------------
  // ------ combined
  return (
    <div className='flex flex-col'>
      {table()}
    </div>
  )
}

export default Table
