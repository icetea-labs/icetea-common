const { TxOp } = require('./enum')
const { validateAddress, stableHashObject } = require('./ecc')

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

  constructor (to, value, fee, data, nonce) {
    this.to = to || ''
    this.value = parseFloat(value) || 0
    this.fee = parseFloat(fee) || 0
    this.data = data || {}
    this.nonce = nonce || (Date.now() + Math.random()) // FIXME

    if (this.value < 0 || this.fee < 0) {
      throw new Error('Value and fee cannot be negative.')
    }

    if (typeof this.data.op !== 'undefined' &&
      this.data.op !== TxOp.CALL_CONTRACT &&
      this.data.op !== TxOp.DEPLOY_CONTRACT) {
      throw new Error(`Invalid TxOp: ${data.op}`)
    }

    if (!this.to) {
      if (this.data.op !== TxOp.DEPLOY_CONTRACT) {
        throw new Error("Transaction 'to' is required.")
      }
    } else {
      if (this.data.op === TxOp.DEPLOY_CONTRACT) {
        throw new Error("Cannot set transaction 'to' when deploying a contract.")
      }
      const isAlias = !!this.to.indexOf('.')
      if (!isAlias) {
        validateAddress(this.to)
      }
    }

    const content = {
      to: this.to,
      value: this.value,
      fee: this.fee,
      data: this.data,
      nonce: this.nonce
    }
    this.signatureMessage = stableHashObject(content, 'base64')
  }

  setSignature (signature) {
    this.signature = signature
    return this
  }

  isContractCreation () {
    return this.data && this.data.op === TxOp.DEPLOY_CONTRACT
  }

  isContractCall () {
    return this.data && this.data.op === TxOp.CALL_CONTRACT
  }
}
