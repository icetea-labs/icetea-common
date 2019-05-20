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

  constructor ({ from, to, payer, value, fee, data, nonce }) {
    this.from = from || ''
    this.to = to || ''
    this.payer = String(payer || '')
    this.value = String(value || '')
    this.fee = fee || ''
    this.data = data || {}
    this.nonce = nonce || (Date.now() + Math.random()) // FIXME

    // if (this.value < 0 || this.fee < 0) {
    //   throw new Error('Value and fee cannot be negative.')
    // }

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
      // const isAlias = !!this.to.indexOf('.')
      // if (!isAlias) {
      //   validateAddress(this.to)
      // }
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

  isContractCreation () {
    return this.data && this.data.op === TxOp.DEPLOY_CONTRACT
  }

  isContractCall () {
    return this.data && this.data.op === TxOp.CALL_CONTRACT
  }
}
