import React, { useState, useContext } from 'react'

const OrderPriceContext = React.createContext()

export const useOrderPriceContext = () => {
  return useContext(OrderPriceContext)
}

export const OrderPriceContextProvider = ({ children }) => {
  const [contextPriceValue, setContextPriceValue] = useState(1350)

  const updateContextPriceValue = (v) => {
    setContextPriceValue(v)
  }

  return (
    <OrderPriceContext.Provider value={{
      contextPriceValue,
      updateContextPriceValue
    }}>
      {children}
    </OrderPriceContext.Provider>
  )
}
