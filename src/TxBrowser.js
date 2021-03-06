var style = require('./styles/basicStyles')
var util = require('./helpers/global')
var EventManager = require('./lib/eventManager')
var traceHelper = require('./helpers/traceHelper')
var yo = require('yo-yo')
var ui = require('./helpers/ui')
var init = require('./helpers/init')

function TxBrowser (_web3) {
  util.extend(this, new EventManager())
  this.web3 = _web3

  this.blockNumber
  this.txNumber
  this.hash
  this.from
  this.to
  this.view

  this.setDefaultValues()
}

// creation 0xa9619e1d0a35b2c1d686f5b661b3abd87f998d2844e8e9cc905edb57fc9ce349
// invokation 0x71a6d583d16d142c5c3e8903060e8a4ee5a5016348a9448df6c3e63b68076ec4 0xcda2b2835add61af54cf83bd076664d98d7908c6cd98d86423b3b48d8b8e51ff
// test:
// creation: 0x72908de76f99fca476f9e3a3b5d352f350a98cd77d09cebfc59ffe32a6ecaa0b
// invokation: 0x20ef65b8b186ca942fcccd634f37074dde49b541c27994fc7596740ef44cfd51

TxBrowser.prototype.setDefaultValues = function () {
  this.from = ' - '
  this.to = ' - '
  this.hash = ' - '
  this.blockNumber = null
  this.txNumber = '0xcda2b2835add61af54cf83bd076664d98d7908c6cd98d86423b3b48d8b8e51ff'
  this.connectInfo = ''
  this.checkWeb3()
}

TxBrowser.prototype.submit = function () {
  if (!this.txNumber) {
    return
  }
  this.trigger('newTxLoading', [this.blockNumber, this.txNumber, tx])
  var tx
  try {
    if (this.txNumber.indexOf('0x') !== -1) {
      tx = this.web3.eth.getTransaction(this.txNumber)
    } else {
      tx = this.web3.eth.getTransactionFromBlock(this.blockNumber, this.txNumber)
    }
  } catch (e) {
    console.log(e)
  }
  console.log(JSON.stringify(tx))
  if (tx) {
    if (!tx.to) {
      tx.to = traceHelper.contractCreationToken('0')
    }
    this.from = tx.from
    this.to = tx.to
    this.hash = tx.hash
    this.trigger('newTraceRequested', [this.blockNumber, this.txNumber, tx])
  } else {
    var mes = '<not found>'
    this.from = mes
    this.to = mes
    this.hash = mes
    console.log('cannot find ' + this.blockNumber + ' ' + this.txNumber)
  }
  yo.update(this.view, this.render())
}

TxBrowser.prototype.updateWeb3Url = function (ev) {
  init.setProvider(this.web3, ev.target.value)
  this.checkWeb3()
  yo.update(this.view, this.render())
}

TxBrowser.prototype.checkWeb3 = function () {
  try {
    console.log('block ' + this.web3.eth.blockNumber)
    this.connectInfo = 'Connected to ' + this.web3.currentProvider.host
  } catch (e) {
    console.log(e)
    this.connectInfo = e.message
  }
}

TxBrowser.prototype.updateBlockN = function (ev) {
  this.blockNumber = ev.target.value
}

TxBrowser.prototype.updateTxN = function (ev) {
  this.txNumber = ev.target.value
}

TxBrowser.prototype.init = function (ev) {
  this.setDefaultValues()
  yo.update(this.view, this.render())
}

TxBrowser.prototype.render = function () {
  var self = this
  var view = yo`<div style=${ui.formatCss(style.container)}>
        <span>Node URL: </span><input onkeyup=${function () { self.updateWeb3Url(arguments[0]) }} value=${this.web3.currentProvider ? this.web3.currentProvider.host : ' - none - '} type='text' />
        <span>${this.connectInfo}</span>
        <br />
        <br />
        <input onkeyup=${function () { self.updateBlockN(arguments[0]) }} type='text' placeholder=${'Block number (default 1000110)' + this.blockNumber} />
        <input onkeyup=${function () { self.updateTxN(arguments[0]) }} type='text' value=${this.txNumber} placeholder=${'Transaction Number or hash (default 2) ' + this.txNumber} />
        <button onclick=${function () { self.submit() }}>
          Get
        </button>
        <button onclick=${function () { self.trigger('unloadRequested') }}>Unload</button>
        <div style=${ui.formatCss(style.transactionInfo)}>
          <table>
            <tbody>
              <tr>
                <td>
                  Hash:
                </td>
                <td>
                  ${this.hash}
                </td>
              </tr>
              <tr>
                <td>
                  From:
                </td>
                <td>
                  ${this.from}
                </td>
              </tr>
              <tr>
                <td>
                  To:
                </td>
                <td>
                  ${this.to}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

module.exports = TxBrowser
