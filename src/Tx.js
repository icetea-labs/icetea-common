const { TxOp, ContractMode } = require('./enum')
const { stableHashObject } = require('./ecc')

module.exports = class {
  // create contract
  // data = {
  //    op: 0,
  //    src: "console.log('hello world')";
  // }
  // call contract function
  // data = {
  //    op: 1,
  //    name: "functionName",
  //    params: [1, "hello"]
  // }
  //
  // Some op in the future: set alias/options, vote, etc.

  constructor ({ from, to, payer, value, fee, data, nonce }) {
    this.from = from || ''
    this.to = to || ''
    this.payer = payer || ''
    this.value = String(value || '')
    this.fee = String(fee || '')
    this.data = data || {}
    this.nonce = nonce || (Date.now() + Math.random()) // FIXME

    // some validation
    if (this.isContractCreation()) {
      if (this.data.mode !== undefined && this.data.mode !== ContractMode.JS_RAW && this.data.mode !== ContractMode.WASM) {
        throw new Error('Invalid contract source mode: ' + this.data.mode)
      } else if (!this.data.src) {
        throw new Error('You must provide contract source to deploy contract.')
      }
    }

    const content = {
      from: this.from,
      to: this.to,
      payer: this.payer,
      value: this.value,
      fee: this.fee,
      data: this.data,
      nonce: this.nonce
    }
    this.sigHash = stableHashObject(content)
  }

  setEvidence (evidence) {
    this.evidence = evidence
    return this
  }

  messageName () {
    return this.data == undefined ? undefined : this.data.name // eslint-disable-line
  }

  messageParams () {
    return this.data == undefined ? undefined : (this.data.params || []) // eslint-disable-line
  }

  isSimpleTransfer () {
    return this.data == undefined || this.data.op == undefined // eslint-disable-line
  }

  isContractCreation () {
    return this.data && this.data.op === TxOp.DEPLOY_CONTRACT
  }

  isContractCall () {
    return this.data && this.data.op === TxOp.CALL_CONTRACT
  }
}
