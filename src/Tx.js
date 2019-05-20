const { TxOp } = require('./enum')
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
    this.payer = String(payer || '')
    this.value = String(value || '')
    this.fee = fee || ''
    this.data = data || {}
    this.nonce = nonce || (Date.now() + Math.random()) // FIXME

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
