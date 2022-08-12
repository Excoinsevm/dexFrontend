import dexjson from '../contracts/Dex.json'
import erc20json from '../contracts/ERC20Abi.json'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import { datetimeStr } from '../common/Utils'
import { useState } from 'react'

// --------------------------------------------------------------------------------
// ------------  helper functions
const toB32Str = (str) => ethers.utils.formatBytes32String(str)
const fromB32Str = (bytes32str) => ethers.utils.parseBytes32String(bytes32str)
const toBE = (num) => ethers.utils.parseUnits(num.toString(), "ether")
const fromBE = (num) => Number(ethers.utils.formatUnits(num.toString(), "ether"))
const toBG = (num) => ethers.utils.parseUnits(num.toString(), "gwei")
const fromBG = (num) => Number(ethers.utils.formatUnits(num.toString(), "gwei"))


// --------------------------------------------------------------------------------
// ------------  dex contract
const readOnlyAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
const getDexContract = () => {
  if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const address = readOnlyAddress
    const signer = new ethers.VoidSigner(address, provider)
    const contract = new ethers.Contract(dexjson.address, dexjson.abi, signer)
    return contract
  } else {
    console.error('No web3? You should consider trying MetaMask!')
    // throw new Error('No ethereum object')
    return null
  }
}
const dexContract = getDexContract()


// --------------------------------------------------------------------------------
// ------------  wallet class
class Wallet {

  static #_sharedInstance = null
  static sharedInstance(params) {
    if (Wallet.#_sharedInstance === null) {
      Wallet.#_sharedInstance = new Wallet(params)
    }
    return Wallet.#_sharedInstance
  }

  static Action = {
    CHECK_STATUS: 0,
    CONNECT: 1,
  }

  constructor(onActiveAccountChanged) {
    this.initialState = {
      walletInstalled: false
    }
    this.activeAccount = false
    this.onActiveAccountChanged = onActiveAccountChanged  //(account) => { }
  }

  #_actionLocks = Object.keys(this.constructor.Action).map(() => false)

  setupState(state, setState) {
    this.state = state
    this.setState = setState
  }

  async init() { await this.checkStatus() }

  async #_execLockProtectedAction(action, func) {
    // console.log('wallet [try] action', Object.keys(Wallet.Action)[action])
    if (this.#_actionLocks[action]) return
    this.#_actionLocks[action] = true
    // console.log('wallet [start] action', Object.keys(Wallet.Action)[action])
    await func()
    this.#_actionLocks[action] = false
    // console.log('wallet [end] action', Object.keys(Wallet.Action)[action])
  }

  async checkStatus() {
    await this.#_execLockProtectedAction(Wallet.Action.CHECK_STATUS, async () => {
      if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
        this.setState({ ...this.state, walletInstalled: true })
        const provider = await detectEthereumProvider()
        const accounts = await provider.request({ method: 'eth_accounts' })
        this.#_updateWalletAccounts(accounts)
        provider.on('accountsChanged', this.#_updateWalletAccounts)
      }
    })
  }

  connect = async () => {
    await this.#_execLockProtectedAction(Wallet.Action.CONNECT, async () => {
      if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
        const provider = await detectEthereumProvider()
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        this.#_updateWalletAccounts(accounts)
      }
    })
  }

  #_updateWalletAccounts = (accounts) => {
    let account = false
    if (accounts.length > 0) {
      account = accounts[0].toLowerCase()
    } else {
      console.log('No account found')
    }
    // console.log('updateWalletAccounts 1', account, this.activeAccount)
    if (account !== this.activeAccount) {
      // console.log('wallet activeAccount-->', account)
      this.activeAccount = account
      this.onActiveAccountChanged(account)
      // console.log('updateWalletAccounts 2', account, this.activeAccount)
    }
  }
}


// --------------------------------------------------------------------------------
// ------------ dex class
class Dex {

  static #_sharedInstance = null
  static sharedInstance() {
    if (Dex.#_sharedInstance === null) {
      Dex.#_sharedInstance = new Dex(dexContract)
    }
    return Dex.#_sharedInstance
  }

  static Action = {
    LOAD_TOKENS_QUOTES_CONTRACTS: 0,
    UPDATE_CURRENT_ACCOUNT: 1,
    LOAD_CURRENT_ACCOUNT_BALANCE: 2,
    FETCH_MARKET_ORDERS: 3,
    FETCH_MARKET_TRADES: 4,
    SCHEDULE_ORDERS_UPDATE: 5,
    SCHEDULE_TRADES_UPDATE: 6,
    SCHEDULE_ALL_TRADES_UPDATE: 7
  }

  constructor(dexContract) {
    this.initialState = {
      currentAccount: false,
      isAdmin: false,
      tokens: [],
      quotes: [],
      contracts: false,
      balance: false,
      marketOrders: {},
      currentAccountOrders: {},
      currentAccountOrdersChanged: 0,
      currentAccountTrades: {},
      currentAccountTradesChanged: 0,
      marketTrades: {},
      marketTradePairBrief: {},
      marketTradeQuoteColBrief: {},
      currentAccountTrades: {},
      txResponse: false
    }
    this.dexContract = dexContract
    this._fetchOrderScheduleArgs = { base: null, quote: null, interval: null }
    this._fetchTradeScheduleArgs = { base: null, quote: null, interval: null }
    this._fetchAllTradeScheduleArgs = { interval: null }
  }

  #_actionLocks = Object.values(this.constructor.Action).map(() => false)

  // --------------------------------------------------------------------------------
  // ------ init
  setupState(state, setState) {
    this.state = state
    this.setState = setState
  }

  async init() {
    if (this.dexContract === null) return
    await this.loadTokensQuotesContracts()
    // as loadCurentAccountBalance requires not-empty currentAccount and contracts,
    // make sure it get called when either currentAccount or contracts are set
    this.#_execPrioritizedAction(
      Dex.Action.LOAD_CURRENT_ACCOUNT_BALANCE,
      this.loadCurrentAccountBalance,
      1000
    )
    this.#_registerContractEventListeners()
    await this.#_execLockProtectedAction(
      Dex.Action.FETCH_MARKET_ORDERS,
      this.fetchAllMarketOrders
    )
    this.#_execLockProtectedAction(
      Dex.Action.FETCH_MARKET_TRADES,
      this.fetchAllMarketTrades
    )
  }

  // --------------------------------------------------------------------------------
  // ------ helper functions
  async #_execLockProtectedAction(action, func, postLockTime = 0) {
    // console.log('dex [try] action', Object.keys(Dex.Action)[action])
    if (this.#_actionLocks[action]) return false
    // console.log('dex [start] action', Object.keys(Dex.Action)[action])
    this.#_actionLocks[action] = true
    await func()
    if (postLockTime > 0) {
      setTimeout(() => {
        this.#_actionLocks[action] = false
      }, postLockTime)
    } else {
      this.#_actionLocks[action] = false
    }
    return true
    // console.log('dex [end] action:', Object.keys(Dex.Action)[action])
  }

  async #_execPrioritizedAction(action, func, postLockTime = 0) {
    this.#_actionLocks[action] = true
    await func()
    if (postLockTime > 0) {
      setTimeout(() => {
        this.#_actionLocks[action] = false
      }, postLockTime)
    } else {
      this.#_actionLocks[action] = false
    }
  }

  // --------------------------------------------------------------------------------
  // ------ tokens, quotes, contracts
  async loadTokensQuotesContracts() {
    await this.#_execLockProtectedAction(Dex.Action.LOAD_TOKENS_QUOTES_CONTRACTS, async () => {
      const _tokens = await this.dexContract.getTokens()
      console.log('tokens', _tokens)
      const _quotes = await this.dexContract.getQuotes()
      const _tokenNames = ['ETH', ..._tokens.map(t => fromB32Str(t.ticker))]
      const _contracts = _tokens.reduce((acc, t) => ({
        ...acc,
        [fromB32Str(t.ticker)]: {
          ticker: t.ticker,
          contract: new ethers.Contract(t.tokenAddress, erc20json.abi, this.dexContract.provider)
        }
      }), {})
      const _quoteNames = _quotes.reduce((acc, t) => {
        const q = fromB32Str(t)
        return q.length > 0 ? [...acc, q] : acc
      }, [])
      this.setState({ ...this.state, tokens: _tokenNames, quotes: _quoteNames, contracts: _contracts })
    })
  }

  // --------------------------------------------------------------------------------
  // ------ event listeners
  #_onTokenTransfer = (from, to, amount) => {
    // console.log('onTokenTransfer:', this.state.currentAccount)
    if (this.state.currentAccount) {
      const f = from.toUpperCase()
      const t = to.toUpperCase()
      const c = this.state.currentAccount.toUpperCase()
      if (f === c || t === c) {
        // console.log('token transfer:', from, to, fromBE(amount))
        // loadCurrentAccountBalance() will not be called if called already
        // either by prioritized action or by lock-protected action
        this.#_execLockProtectedAction(
          Dex.Action.LOAD_CURRENT_ACCOUNT_BALANCE,
          this.loadCurrentAccountBalance,
          1000
        )
      }
    }
  }

  #_registerContractEventListeners = () => {
    // --- NewTrade event
    const tradeFilter = this.dexContract.filters.NewTrade(
      null, null, null, null,
      null, null, null, null, null)
    this.dexContract.on(
      // 'NewTrade',
      tradeFilter,
      (tradeId, orderId, baseTicker, quoteTicker, side, buyer, seller, amount, price, date) => {
        // console.log(`NewTrade:
        //   ${tradeId} ${orderId} ${baseTicker} ${quoteTicker}　${side}
        //   ${buyer} ${seller} ${amount} ${price} ${date}`)
        // this.#_execLockProtectedAction(
        //   Dex.Action.LOAD_CURRENT_ACCOUNT_BALANCE,
        //   this.loadCurrentAccountBalance,
        //   1000
        // )
      }
    )

    // --- token transfer event
    for (const key in this.state.contracts) {
      // console.log('registering token transfer event:', key)
      const tc = this.state.contracts[key].contract
      tc.on(tc.filters.Transfer(null, this.dexContract.address), this.#_onTokenTransfer)
      tc.on(tc.filters.Transfer(this.dexContract.address, null), this.#_onTokenTransfer)
    }
  }

  // --------------------------------------------------------------------------------
  // ------ current account, balance
  async #_checkIsAdmin(account) {
    if (account) {
      const admins = [await this.dexContract.admin()]
      return admins.some(element => element.toLowerCase() === account.toLowerCase())
    } else {
      return false
    }
  }

  updateCurrentAccount = async (account) => {
    const func = async () => {
      // console.log('dex currentAccount-->', account)
      const _isAdmin = await this.#_checkIsAdmin(account)
      if (account) {
        this.setState({ ...this.state, currentAccount: account, isAdmin: _isAdmin })
        // as loadCurentAccountBalance requires not-empty currentAccount and contracts,
        // make sure it get called when either currentAccount or contracts are set
        await this.#_execPrioritizedAction(
          Dex.Action.LOAD_CURRENT_ACCOUNT_BALANCE,
          this.loadCurrentAccountBalance,
        )
      } else {
        this.setState({ ...this.state, currentAccount: account, isAdmin: _isAdmin, balance: false })
      }
      // await this.fetchAllMarketOrders()
      // this.filterCurrentAccountAllOrders()
    }
    // func()
    await this.#_execPrioritizedAction(Dex.Action.UPDATE_CURRENT_ACCOUNT, func)
  }

  loadCurrentAccountBalance = async () => {
    if (this.state.currentAccount && this.state.contracts) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      let _balance = {
        ETH:
          await Promise.all([
            fromBE(await provider.getBalance(this.state.currentAccount)),
            fromBE(await this.dexContract.totalBalances(this.state.currentAccount, toB32Str('ETH'))),
            fromBE(await this.dexContract.inOrderAmount(this.state.currentAccount, toB32Str('ETH')))
          ])
      }
      for (const key in this.state.contracts) {
        const tc = this.state.contracts[key]
        _balance[key] = await Promise.all([
          fromBE(await tc.contract.balanceOf(this.state.currentAccount)),
          fromBE(await this.dexContract.totalBalances(this.state.currentAccount, tc.ticker)),
          fromBE(await this.dexContract.inOrderAmount(this.state.currentAccount, tc.ticker))
        ])
      }
      // console.log('balance --->', _balance)
      this.setState({ ...this.state, balance: _balance })
    }
  }

  // --------------------------------------------------------------------------------
  // ------ market orders
  #_orderConvert = (o) => ({
    ...o,
    id: o.id.toNumber(),
    // side: o.side,
    trader: o.trader.toLowerCase(),
    ticker: fromB32Str(o.ticker),
    amount: fromBE(o.amount),
    filled: fromBE(o.filled),
    price: fromBG(o.price),
    date: o.date.toNumber() * 1000,  //dateStr(o.date.toNumber() * 1000),
    p: fromBG(o.price),
    q: fromBE(o.amount) - fromBE(o.filled)
  })

  fetchMarketOrders = async (base, quote) => {
    const SIDE = { BUY: 0, SELL: 1 };
    const qt = toB32Str(quote)
    const bt = toB32Str(base)
    const bOrders = await this.dexContract.getOrderBook(bt, qt, SIDE.BUY)
    const sOrders = await this.dexContract.getOrderBook(bt, qt, SIDE.SELL)
    const bo = bOrders.map(this.#_orderConvert).reverse()
    const so = sOrders.map(this.#_orderConvert).reverse()
    const uniqueb = bo.reduce((a, o) => ({ ids: a.ids.concat(o.id), q: a.q + o.q }), { ids: '', q: 0 })
    const uniques = so.reduce((a, o) => ({ ids: a.ids.concat(o.id), q: a.q + o.q }), { ids: '', q: 0 })
    const uid = base.concat(quote, uniqueb.ids, uniques.ids, uniqueb.q, uniques.q)
    const _orders = { b: bo, s: so, uid: uid }
    // console.log(`${base}-${quote} orders --->`, _orders)

    this.state.marketOrders[`${base}-${quote}`] = _orders

    // let orders = { ...this.state.marketOrders }
    // orders[`${base}-${quote}`] = _orders
    // this.setState({ ...this.state, marketOrders: orders })
  }

  scheduleMarketOrdersFetch = (base, quote, ordersUidCallback, interval = 1000) => {
    if (!base || !quote ||
      (this._fetchOrderScheduleArgs.base === base
        && this._fetchOrderScheduleArgs.quote === quote
        && this._fetchOrderScheduleArgs.interval === interval)) {
      return
    }

    if (this._fetchOrderSchedule) clearInterval(this._fetchOrderSchedule)

    this._fetchOrderScheduleArgs = { base, quote, interval }
    this._fetchOrderCallback = ordersUidCallback
    const func = async () => {
      const excuted = await this.#_execLockProtectedAction(
        Dex.Action.SCHEDULE_ORDERS_UPDATE,
        async () => this.fetchMarketOrders(base, quote)
      )
      if (excuted && this._fetchOrderScheduleArgs.base && this._fetchOrderCallback)
        this._fetchOrderCallback(this.state.marketOrders[`${base}-${quote}`].uid)
    }
    func()
    this._fetchOrderSchedule = setInterval(func, interval)
  }

  cancelMarketOrdersFetchSchedule = () => {
    this._fetchOrderCallback = null
    this._fetchOrderScheduleArgs = { base: null, quote: null, interval: null }
    if (this._fetchOrderSchedule) clearInterval(this._fetchOrderSchedule)
    this._fetchOrderSchedule = null
  }

  markCurrentAccountOrders = (base, quote) => {
    if (this.state.marketOrders) {
      const pair = `${base}-${quote}`
      const orders = this.state.marketOrders[pair]
      orders.b.forEach(o => o.m = (o.trader === this.state.currentAccount) ? 100 : 0)
      orders.s.forEach(o => o.m = (o.trader === this.state.currentAccount) ? 100 : 0)
      // console.log(`marked orders for ${pair} --->`, orders)
      // this.state.currentAccountOrders[pair] = orders
      // this.setState({ ...this.state, currentAccountOrders: orders })
    }
  }

  filterCurrentAccountAllOrders = () => {
    if (this.state.currentAccount && this.state.marketOrders) {
      const convert = (l, base, quote) => l.map(o => ({
        id: o.id,
        p: Number(o.price),
        q: Number(o.amount),
        f: Number(o.filled),
        type: 'LIMIT',
        // ticker: o.ticker,
        base: base,
        quote: quote,
        side: o.side === 0 ? 'BUY' : 'SELL',
        date: o.date,
      }))
      let orders = []
      for (const key in this.state.marketOrders) {
        const _orders = this.state.marketOrders[key]
        // console.log('_orders --->', key, this.state.marketOrders, _orders)
        const bo = _orders.b.filter(o => o.trader === this.state.currentAccount)
        const so = _orders.s.filter(o => o.trader === this.state.currentAccount)
        const [base, quote] = key.split('-')
        if (bo.length > 0) orders = orders.concat(convert(bo, base, quote))
        if (so.length > 0) orders = orders.concat(convert(so, base, quote))
      }
      orders = orders.sort((a, b) => b.date - a.date)
      // console.log('filtered orders --->', orders)
      // console.log('marketOrders --->', this.state.marketOrders)
      this.state.currentAccountOrders = orders
      return orders
    }
  }

  fetchAllMarketOrders = async () => {
    const SIDE = { BUY: 0, SELL: 1 };
    let orders = {}
    for (const q of this.state.quotes) {
      // let quoteOrders = {}
      const qt = toB32Str(q)
      for (const base of this.state.tokens) {
        const bt = toB32Str(base)
        const bOrders = await this.dexContract.getOrderBook(bt, qt, SIDE.BUY)
        const sOrders = await this.dexContract.getOrderBook(bt, qt, SIDE.SELL)
        const bo = bOrders.map(this.#_orderConvert).reverse()
        const so = sOrders.map(this.#_orderConvert).reverse()
        const order = { b: bo, s: so }
        orders[`${base}-${q}`] = order
        // quoteOrders[base] = order   // = structuredClone(order)
      }
      // orders[q] = quoteOrders
    }
    // console.log('orders --->', orders)
    this.state.marketOrders = orders

    // this.filterCurrentAccountAllOrders()
    this.setState({
      ...this.state,
      // currentAccountOrders: orders,
      currentAccountOrdersChanged: this.state.currentAccountOrdersChanged + 1
    })
    // this.setState({ ...this.state, marketOrders: orders })
  }

  // --------------------------------------------------------------------------------
  // ------ market trades
  #_tradeConvert = (trade) => ({
    tradeId: trade.tradeId.toNumber(),
    orderId: trade.orderId.toNumber(),
    base: fromB32Str(trade.baseTicker),
    quote: fromB32Str(trade.quoteTicker),
    side: trade.side === 0 ? 'BUY' : 'SELL',
    buyer: trade.buyer.toLowerCase(),
    seller: trade.seller.toLowerCase(),
    q: fromBE(trade.amount),
    p: fromBG(trade.price),
    t: trade.date.toNumber() * 1000,
  })

  fetchMarketTrades = async (base, quote) => {
    /******  NewTrade event format ******
    uint256 tradeId,
    uint256 orderId,
    bytes32 indexed baseTicker,
    bytes32 indexed quoteTicker,
    uint8   side
    address buyer,
    address seller,
    uint256 amount,
    uint256 price,
    uint256 indexed date
    *************************************/
    const tradeFilter = this.dexContract.filters.NewTrade(
      null, null, toB32Str(base), toB32Str(quote),
      null, null, null, null, null, null)
    const _trades = await this.dexContract.queryFilter(tradeFilter)
    const trades = _trades.map(t => this.#_tradeConvert(t.args))
    // console.log(`trades for ${base}-${quote}`, trades)
    this.state.marketTrades[`${base}-${quote}`] = trades
    // this.setState({ ...this.state, marketTrades: trades })
    this.state.marketTradePairBrief[`${base}-${quote}`] = this.#_genMarketBrief(base, quote, _trades)
    // console.log('----', this.state.marketTradePairBrief[`${base}-${quote}`])
  }

  scheduleMarketTradesFetch = (base, quote, recentTradeIdCallback, interval = 1000) => {
    if (!base || !quote ||
      (this._fetchTradeScheduleArgs.base === base
        && this._fetchTradeScheduleArgs.quote === quote
        && this._fetchTradeScheduleArgs.interval === interval)) {
      return
    }

    if (this._fetchTradeSchedule) clearInterval(this._fetchTradeSchedule)

    this._fetchTradeScheduleArgs = { base, quote, interval }
    this._fetchTradeCallback = recentTradeIdCallback
    const func = async () => {
      const excuted = await this.#_execLockProtectedAction(
        Dex.Action.SCHEDULE_TRADES_UPDATE,
        async () => this.fetchMarketTrades(base, quote)
      )
      if (excuted && this._fetchTradeScheduleArgs.base && this._fetchTradeCallback) {
        const trades = this.state.marketTrades[`${base}-${quote}`]
        this._fetchTradeCallback(trades.length > 0 ? trades.at(-1).tradeId : '0')
      }
    }
    func()
    this._fetchTradeSchedule = setInterval(func, interval)
  }

  cancelMarketTradesFetchSchedule = () => {
    this._fetchTradeCallback = null
    this._fetchTradeScheduleArgs = { base: null, quote: null, interval: null }
    if (this._fetchTradeSchedule) clearInterval(this._fetchTradeSchedule)
    this._fetchTradeSchedule = null
  }

  #_genMarketBrief(base, quote, trades, daysBefore = 2) {
    let brief = {
      pair: base + quote,
      base: base,
      quote: quote,
      latestSide: '',
      price: '--',
      prePrice: '--',
      change24h: '--',
      change24hPercent: '--',
      high24h: '--',
      low24h: '--',
      volume24h: '--',
      total24h: '--'
    }

    if (trades.length > 0) {
      const t = new Date()
      const utcStartTime = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() - daysBefore)

      const _tradesAfter = trades.filter(trade => trade.args.date.toNumber() * 1000 >= utcStartTime)
      const tradesAfter = _tradesAfter.map(t => this.#_tradeConvert(t.args))
      // console.log('tradesAfter --->', tradesAfter)

      const findLowHighVolTotal = (t) => t.reduce((acc, cur) => {
        if (cur.p > acc.high24h) acc.high24h = cur.p
        if (cur.p < acc.low24h) acc.low24h = cur.p
        acc.volume24h += cur.q
        acc.total24h += cur.p * cur.q
        return acc
      }, { low24h: Number.MAX_VALUE, high24h: 0, volume24h: 0, total24h: 0 })


      if (tradesAfter.length > 0) {
        brief = { ...brief, ...findLowHighVolTotal(tradesAfter) }
        brief.price = tradesAfter.at(-1).p
        brief.latestSide = tradesAfter.at(-1).side
      }
      if (tradesAfter.length > 1) {
        brief.prePrice = tradesAfter.at(-2).p
        brief.change24h = brief.price - tradesAfter.at(0).p
        brief.change24hPercent = brief.change24h / tradesAfter.at(0).p
      }
    }
    // console.log('_genMarketBrief --->', brief)
    return brief
  }

  filterCurrentAccountAllTrades = () => {
    if (this.state.currentAccount && this.state.marketTrades) {
      let trades = []
      for (const key in this.state.marketTrades) {
        const filtered = this.state.marketTrades[key].filter(trade =>
          trade.seller === this.state.currentAccount || trade.buyer === this.state.currentAccount
        )
        trades = trades.concat(filtered)
      }
      trades = trades.sort((a, b) => b.date - a.date)
      this.state.currentAccountTrades = trades
      return trades
    }
  }

  fetchAllMarketTrades = async () => {
    let marketTrades = {}
    let marketTradeQuoteColBrief = {}
    for (const quote of this.state.quotes) {
      let quoteBrief = []
      for (const base of this.state.tokens) {
        const pairName = `${base}-${quote}`
        if (base === quote || pairName === 'USDT-ETH') continue
        const tradeFilter = this.dexContract.filters.NewTrade(
          null, null, toB32Str(base), toB32Str(quote),
          null, null, null, null, null, null)
        const _trades = await this.dexContract.queryFilter(tradeFilter)
        marketTrades[pairName] = _trades.map(t => this.#_tradeConvert(t.args))
        const brief = this.#_genMarketBrief(base, quote, _trades)
        // marketTradeQuoteColBrief[pairName] = this.#_genMarketBrief(base, quote, _trades)
        quoteBrief.push(brief)
        // console.log('brief --->', brief)
      }
      marketTradeQuoteColBrief[quote] = quoteBrief
    }
    this.state.marketTrades = marketTrades
    this.state.marketTradeQuoteColBrief = marketTradeQuoteColBrief

    this.setState({
      ...this.state,
      // currentAccountOrders: orders,
      currentAccountTradesChanged: this.state.currentAccountTradesChanged + 1
    })
  }

  scheduleAllMarketTradesFetch = (callback, interval = 1000) => {
    if (this._fetchAllTradeScheduleArgs.interval === interval) {
      return
    }

    if (this._fetchAllTradeSchedule) clearInterval(this._fetchAllTradeSchedule)

    this._fetchAllTradeScheduleArgs = { interval }
    this._fetchAllTradeCallback = callback
    const func = async () => {
      const excuted = await this.#_execLockProtectedAction(
        Dex.Action.SCHEDULE_ALL_TRADES_UPDATE,
        this.fetchAllMarketTrades
      )
      if (excuted && this._fetchAllTradeScheduleArgs.interval && this._fetchAllTradeCallback) {
        // console.log('brief', this.state.marketTradeQuoteColBrief)
        this._fetchAllTradeCallback({ trades: this.state.marketTrades, brief: this.state.marketTradeQuoteColBrief })
      }
    }
    func()
    this._fetchAllTradeSchedule = setInterval(func, interval)
  }

  cancelAllMarketTradesFetchSchedule = () => {
    this._fetchAllTradeCallback = null
    this._fetchAllTradeScheduleArgs = { interval: null }
    if (this._fetchAllTradeSchedule) clearInterval(this._fetchAllTradeSchedule)
    this._fetchAllTradeSchedule = null
  }


  // --------------------------------------------------------------------------------
  // ------ deposit, withdraw, createLimitOrder, createMarketOrder, cancelOrder
  #_parseErrMsg = (msg) => {
    let ret = { parsed: false, reason: 'Unidentified Error' }
    const match = msg.match(/'{.*}'/)
    if (match) {
      const jstr = match[0].replaceAll('\'', '')
      try {
        const j = JSON.parse(jstr).value.data
        const rm = j.message.match(/reason string.*/)
        const r = rm ? rm[0].replace('reason string', '').trim() : j.message
        ret = { parsed: true, code: j.code, reason: r, data: JSON.stringify(j.data), raw: jstr }
      } catch (e) {
        ret.raw = jstr
      }
    } else {
      ret.raw = msg
    }
    return ret
  }

  #_parseErrJson = (err) => {
    let ret = { parsed: false, reason: 'Unidentified Error' }
    try {
      const msg = err.data.message
      const rm = msg.match(/reason string.*/)
      const r = rm ? rm[0].replace('reason string', '').trim() : msg
      ret = { parsed: true, code: err.code, reason: r, raw: err }
    } catch (e) {
      ret.raw = err
    }
    return ret
  }

  #_parseErrorResponse = (op, response) => {
    // console.log('parseWalletResponse:', response)
    if (response.code === 4001) {
      return { op: op, sts: 'rejected', code: response.code, reason: 'Wallet rejected', parsed: true }
    } else {
      let err = {}
      if ('error' in response) {
        err = this.#_parseErrJson(response.error)
      }
      else if ('message' in response) {
        err = this.#_parseErrMsg(response.message)
      }
      const _code = ('code' in response) ? { code: response.code } : {}
      return { op: op, sts: 'unknown', ..._code, ...err }
    }
  }

  depositToken = async (token, amount) => {
    if (this.state.currentAccount) {
      try {
        // console.log('depositToken', token, amount, account)
        this.setState({
          ...this.state,
          txResponse: { op: 'deposit', sts: 'processing', params: { token, amount }, code: 0 }
        })

        const signer = this.dexContract.provider.getSigner(this.state.currentAccount)
        const amouontBN = toBE(amount)
        let tx = ''

        if (token === 'ETH') {
          const transTx = await signer.sendTransaction({
            from: this.state.currentAccount,
            to: this.dexContract.address,
            value: amouontBN
          })
          tx = await transTx.wait()
        } else {
          // --- signed contract
          const signedContract = this.dexContract.connect(signer)
          const signedTokenContract = this.state.contracts[token].contract.connect(signer)

          // --- approve
          // --- use callStatic to speed up error checking and avoid unnessary gas cost
          await signedContract.callStatic.approve(this.dexContract.address, amouontBN)
          const approveTx = await signedTokenContract.approve(this.dexContract.address, amouontBN)
          await approveTx.wait()

          // --- deposit
          const args = [this.state.contracts[token].ticker, amouontBN, { gasLimit: 3000000 }]
          await signedContract.callStatic.deposit(...args)
          const depositTx = await signedContract.deposit(...args)
          tx = await depositTx.wait()
        }

        if (token === 'ETH') { // other token transfers trigger load balance in transfer events
          setTimeout(() => {
            this.loadCurrentAccountBalance()
          }, 1000) // wait confirmation and reload assets
        }

        this.setState({
          ...this.state,
          txResponse: { op: 'deposit', sts: 'success', tx: tx, code: 0 }
        })

      } catch (e) {
        this.setState({
          ...this.state,
          txResponse: this.#_parseErrorResponse('deposit', e)
        })
      }
    }
  }

  withdrawToken = async (token, amount) => {
    if (this.state.currentAccount) {
      try {
        // console.log('withdrawToken', token, amount, this.state.currentAccount)
        this.setState({
          ...this.state,
          txResponse: { op: 'withdraw', sts: 'processing', params: { token, amount }, code: 0 }
        })

        const signer = this.dexContract.provider.getSigner(this.state.currentAccount)
        const signedContract = this.dexContract.connect(signer)
        const args = [toB32Str(token), toBE(amount), { gasLimit: 3000000 }]

        // --- use callStatic to speed up error checking and avoid unnessary gas cost
        await signedContract.callStatic.withdraw(...args)
        const withdrawTx = await signedContract.withdraw(...args)
        const tx = await withdrawTx.wait()

        if (token === 'ETH') { // other token transfers trigger load balance in transfer events
          setTimeout(() => {
            this.loadCurrentAccountBalance()
          }, 1000) // wait confirmation and reload assets
        }

        this.setState({
          ...this.state,
          txResponse: { op: 'withdraw', sts: 'success', tx: tx, code: 0 }
        })

      } catch (e) {
        this.setState({
          ...this.state,
          txResponse: this.#_parseErrorResponse('withdraw', e)
        })
      }
    }
  }

  createLimitOrder = async (base, quote, amount, price, side) => {
    if (this.state.currentAccount) {
      try {
        // console.log('createLimitOrder', base, quote, side, amount, price)
        this.setState({
          ...this.state,
          txResponse: { op: 'createLimitOrder', sts: 'processing', params: { base, quote, amount, price, side }, code: 0 }
        })

        const signer = this.dexContract.provider.getSigner(this.state.currentAccount)
        const signedContract = this.dexContract.connect(signer)
        const args = [toB32Str(base), toB32Str(quote), toBE(amount), toBG(price), side, { gasLimit: 3000000 }]

        // --- use callStatic to obtain on-chain return value, speed up error checking and avoid unnessary gas cost
        const orderId = await signedContract.callStatic.createLimitOrder(...args)
        const createTx = await signedContract.createLimitOrder(...args)
        const tx = await createTx.wait()

        setTimeout(async () => {
          this.loadCurrentAccountBalance()
          await this.fetchMarketOrders(base, quote)
          this.setState({
            ...this.state,
            currentAccountOrdersChanged: this.state.currentAccountOrdersChanged + 1
          })
        }, 500) // wait confirmation and reload orders

        this.setState({
          ...this.state,
          txResponse: { op: 'createLimitOrder', sts: 'success', msg: tx, ret: orderId.toNumber(), code: 0 }
        })

      } catch (e) {
        this.setState({
          ...this.state,
          txResponse: this.#_parseErrorResponse('createLimitOrder', e)
        })
      }
    }
  }

  createMarketOrder = async (base, quote, amount, side) => {
    if (this.state.currentAccount) {
      try {
        // console.log('createMarketOrder', base, quote, side, amount)
        this.setState({
          ...this.state,
          txResponse: { op: 'createMarketOrder', sts: 'processing', params: { base, quote, amount, side }, code: 0 }
        })

        const signer = this.dexContract.provider.getSigner(this.state.currentAccount)
        const signedContract = this.dexContract.connect(signer)
        const args = [toB32Str(base), toB32Str(quote), toBE(amount), side, { gasLimit: 3000000 }]

        // use callStatic to speed up error checking and avoid unnessary gas cost
        await signedContract.callStatic.createMarketOrder(...args)
        const createTx = await signedContract.createMarketOrder(...args)
        const tx = await createTx.wait()

        setTimeout(async () => {
          this.loadCurrentAccountBalance()
          await this.fetchMarketOrders(base, quote)
          this.setState({
            ...this.state,
            currentAccountOrdersChanged: this.state.currentAccountOrdersChanged + 1
          })
        }, 500) // wait confirmation and reload orders

        this.setState({
          ...this.state,
          txResponse: { op: 'createMarketOrder', sts: 'success', msg: tx, code: 0 }
        })

      } catch (e) {
        this.setState({
          ...this.state,
          txResponse: this.#_parseErrorResponse('createMarketOrder', e)
        })
      }
    }
  }

  cancelOrder = async (orderId, base, quote, side) => {
    if (this.state.currentAccount) {
      try {
        // console.log('cancelOrder', orderId, base, quote, side)
        this.setState({
          ...this.state,
          txResponse: { op: 'cancelOrder', sts: 'processing', params: { orderId, base, quote, side }, code: 0 }
        })

        const signer = this.dexContract.provider.getSigner(this.state.currentAccount)
        const signedContract = this.dexContract.connect(signer)
        const args = [orderId, toB32Str(base), toB32Str(quote), side, { gasLimit: 3000000 }]

        // --- use callStatic to speed up error checking and avoid unnessary gas cost
        await signedContract.callStatic.cancelOrder(...args)
        const cancelTx = await signedContract.cancelOrder(...args)
        const tx = await cancelTx.wait()

        setTimeout(async () => {
          this.loadCurrentAccountBalance()
          await this.fetchMarketOrders(base, quote)
          this.setState({
            ...this.state,
            currentAccountOrdersChanged: this.state.currentAccountOrdersChanged + 1
          })
        }, 500) // wait confirmation and reload orders

        this.setState({
          ...this.state,
          txResponse: { op: 'cancelOrder', sts: 'success', msg: tx, code: 0 }
        })

      } catch (e) {
        this.setState({
          ...this.state,
          txResponse: this.#_parseErrorResponse('cancelOrder', e)
        })
      }
    }
  }


  // --------------------------------------------------------------------------------
  // ------ admin functions: add token, approve quote
  isValidAddress(address) {
    return ethers.utils.isAddress(address)
  }

  async loadTokenSymbol(tokenAddress) {
    try {
      // const signer = new ethers.VoidSigner(readOnlyAddress, dexContract.provider)
      // const tokenContract = new ethers.Contract(tokenAddress, erc20json.abi, signer)
      const tokenContract = new ethers.Contract(tokenAddress, erc20json.abi, dexContract.provider)
      const symbol = await tokenContract.symbol()
      return symbol
    } catch (e) {
      // console.log('loadTokenSymbol error', e)
      return false
    }
  }

  addToken = async (token, address) => {
    if (this.state.isAdmin) {
      try {
        // console.log('addToken', token, address)
        this.setState({
          ...this.state,
          txResponse: { op: 'addToken', sts: 'processing', params: { token, address }, code: 0 }
        })

        const signer = this.dexContract.provider.getSigner(this.state.currentAccount)
        const signedContract = this.dexContract.connect(signer)
        const args = [toB32Str(token), address, { gasLimit: 3000000 }]

        // --- use callStatic to speed up error checking and avoid unnessary gas cost
        await signedContract.callStatic.addToken(...args)
        const addTokenTx = await signedContract.addToken(...args)
        const tx = await addTokenTx.wait()

        setTimeout(async () => {
          await this.loadTokensQuotesContracts()
        }, 500) // wait confirmation and reload orders

        this.setState({
          ...this.state,
          txResponse: { op: 'addToken', sts: 'success', msg: tx, code: 0 }
        })

      } catch (e) {
        this.setState({
          ...this.state,
          txResponse: this.#_parseErrorResponse('addToken', e)
        })
      }
    }
  }

  approveQuoteToken = async (token) => {
    if (this.state.isAdmin) {
      try {
        // console.log('approveQuoteToken', token)
        this.setState({
          ...this.state,
          txResponse: { op: 'approveQuoteToken', sts: 'processing', params: { token }, code: 0 }
        })

        const signer = this.dexContract.provider.getSigner(this.state.currentAccount)
        const signedContract = this.dexContract.connect(signer)
        const args = [toB32Str(token), { gasLimit: 3000000 }]

        // --- use callStatic to speed up error checking and avoid unnessary gas cost
        await signedContract.callStatic.approveQuoteToken(...args)
        const approveTx = await signedContract.approveQuoteToken(...args)
        const tx = await approveTx.wait()

        this.setState({
          ...this.state,
          txResponse: { op: 'approveQuoteToken', sts: 'success', msg: tx, code: 0 }
        })

      } catch (e) {
        this.setState({
          ...this.state,
          txResponse: this.#_parseErrorResponse('approveQuoteToken', e)
        })
      }
    }
  }

}


// --------------------------------------------------------------------------------
// ------------ export
export function initWeb3() {
  const dex = Dex.sharedInstance()
  const wallet = Wallet.sharedInstance(dex.updateCurrentAccount)
  wallet.init()
  dex.init()
}

export function useWeb3State() {

  const wallet = Wallet.sharedInstance()
  const dex = Dex.sharedInstance()

  const [walletState, setWalletState] = useState(wallet.initialState)
  wallet.setupState(walletState, setWalletState)

  const [dexState, setDexState] = useState(dex.initialState)
  dex.setupState(dexState, setDexState)

  return { ...walletState, ...dexState }
}

export function web3Methods() {
  const dex = Dex.sharedInstance()
  const wallet = Wallet.sharedInstance(dex.updateCurrentAccount)
  return {
    connect: wallet.connect,
    isValidAddress: dex.isValidAddress,
    loadTokenSymbol: dex.loadTokenSymbol,
    depositToken: dex.depositToken,
    withdrawToken: dex.withdrawToken,
    createLimitOrder: dex.createLimitOrder,
    createMarketOrder: dex.createMarketOrder,
    cancelOrder: dex.cancelOrder,
    addToken: dex.addToken,
    approveQuoteToken: dex.approveQuoteToken,
    markCurrentAccountOrders: dex.markCurrentAccountOrders,
    filterCurrentAccountAllOrders: dex.filterCurrentAccountAllOrders,
    scheduleMarketOrdersFetch: dex.scheduleMarketOrdersFetch,
    cancelMarketOrdersFetchSchedule: dex.cancelMarketOrdersFetchSchedule,
    filterCurrentAccountAllTrades: dex.filterCurrentAccountAllTrades,
    scheduleMarketTradesFetch: dex.scheduleMarketTradesFetch,
    cancelMarketTradesFetchSchedule: dex.cancelMarketTradesFetchSchedule,
    scheduleAllMarketTradesFetch: dex.scheduleAllMarketTradesFetch,
    cancelAllMarketTradesFetchSchedule: dex.cancelAllMarketTradesFetchSchedule,
    getMarketOrders: (base, quote) => dex.state.marketOrders[`${base}-${quote}`],
    getMarketTrades: (base, quote) => dex.state.marketTrades[`${base}-${quote}`],
    getMarketTradePairBrief: (base, quote) => dex.state.marketTradePairBrief[`${base}-${quote}`],
    getCurrentAccountOrder: () => dex.state.currentAccountOrder,
    getQuotesTokens: async (waitTimeout = 10000) => {
      let waited = 0
      while (
        waited <= waitTimeout
        &&
        (dex.state.quotes.length === 0 || dex.state.tokens.length === 0)) {
        await new Promise(r => setTimeout(r, 200));
        waited += 200
      }
      return waited > waitTimeout ? false : [dex.state.quotes, dex.state.tokens]
    },
  }
}

export function createWeb3() {
  const dex = Dex.sharedInstance()
  const wallet = Wallet.sharedInstance(dex.updateCurrentAccount)
  return {
    initWeb3: initWeb3,
    web3Methods: web3Methods(),
    useWeb3State: useWeb3State
  }
}
