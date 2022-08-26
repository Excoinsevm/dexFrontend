
export const TokenBalanceDecimals = {
  'ETH': 8,
  'USDT': 4,
  'RED': 4,
  'CYAN': 4,
  'BLUE': 4,
  'PINK': 4,
}

export const tokenBalanceDecimal = (token) => TokenBalanceDecimals[token]

export const TradePairDisplayDecimals = {
  'ETH-USDT': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001'],
    quoteDecimal: 3,
    baseDecimal: 6,
    fiatDecimal: 4
  },
  'RED-USDT': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001'],
    quoteDecimal: 4,
    baseDecimal: 4,
    fiatDecimal: 4
  },
  'CYAN-USDT': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001'],
    quoteDecimal: 4,
    baseDecimal: 4,
    fiatDecimal: 4
  },
  'BLUE-USDT': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001'],
    quoteDecimal: 4,
    baseDecimal: 4,
    fiatDecimal: 4
  },
  'PINK-USDT': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001'],
    quoteDecimal: 4,
    baseDecimal: 4,
    fiatDecimal: 4
  },
  'RED-ETH': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001'],
    quoteDecimal: 4,
    baseDecimal: 4,
    fiatDecimal: 4
  },
  'CYAN-ETH': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001'],
    quoteDecimal: 4,
    baseDecimal: 4,
    fiatDecimal: 4
  },
  'BLUE-ETH': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001'],
    quoteDecimal: 4,
    baseDecimal: 4,
    fiatDecimal: 4
  },
  'PINK-ETH': {
    scaleList: ['10', '1', '0.1', '0.01', '0.001', '0.0001', '0.00001', '0.000001'],
    quoteDecimal: 4,
    baseDecimal: 4,
    fiatDecimal: 4
  },
}

export const tradePairDisplayDecimal = (base, quote) => TradePairDisplayDecimals[`${base}-${quote}`]
