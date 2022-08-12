
// ------ market table helper functions
const genFavData = (favList, sourceData) => {
  return favList.reduce((acc, cur) => {
    for (let key in sourceData) {
      const finds = sourceData[key].filter(d => (d.pair === cur))
      if (finds.length > 0) {
        finds[0]['fav'] = true
        acc.push(finds[0])
      }
    }
    return acc
  }, [])
}

export const sortData = (dataToSort, col, order, favTabName, favTickers) => {
  let extendedData = structuredClone(dataToSort, { transfer: dataToSort.buffer })
  if (favTabName && favTickers) extendedData[favTabName] = genFavData(favTickers, extendedData)
  if (col && order) {
    // console.log('sortData:', col, order, col instanceof Function)
    const valfunc = col instanceof Function ? d => col(d) : d => d[col]
    let sorted = {}
    for (const key in extendedData) {
      const quoteSorted = extendedData[key].sort((a, b) => {
        let result = valfunc(a) - valfunc(b)
        if (isNaN(result)) {
          result = valfunc(a).toString().localeCompare(valfunc(b).toString(), 'en', { numeric: true })
        }
        return result * (order === 'asc' ? 1 : -1)
      })
      sorted[key] = quoteSorted
    }
    return sorted
  }
  else {
    return extendedData
  }
}

export const filterTabData = (dataToFilter, search, col, tabNames, tabIndices) => {
  let filteredData = {}
  let filteredTabs = Array(tabNames.length) // let filteredTabs = Object.assign([], tabNames)
  for (const key in dataToFilter) {
    filteredData[key] = dataToFilter[key].filter((val) => {
      if (search === '') return true;
      else if (val[col].toLowerCase().startsWith(search.toLowerCase())) return true
      else if (val[col].replace(val.quote, '').toLowerCase().includes(search.toLowerCase())) return true;
      else return false
    })
    const flen = filteredData[key].length
    filteredTabs[tabIndices[key]] = search === '' ? key : key + ' (' + flen + ')'
  }
  return { filteredTabs, filteredData }
}

export const filterData = (rows, filter) => {
  // console.log('rows', rows, 'filter', filter)
  if (!filter) return rows
  else return rows.filter((row) => {
    for (const key in filter) {
      if (filter[key] === '') continue
      if (row[key].toLowerCase() !== filter[key].toLowerCase()) return false
    }
    return true
  })
}
