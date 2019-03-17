const ecc = require('./ecc')
const Tx = require('./Tx')
const { toKeyBuffer, toDataString } = require('./codec')

function newAccount () {
  return getAccount(ecc.generateKeyBuffer())
}

function getAccount (privateKey) {
  if (!privateKey || !(typeof privateKey === 'string' || Buffer.isBuffer(privateKey))) {
    throw new Error('Invalid private key. Private key must be a Buffer or a string.')
  }
  privateKey = toKeyBuffer(privateKey)
  if (privateKey.length !== 32) {
    throw new Error('Invalid private key length.')
  }

  const { publicKey, address } = ecc.toPubKeyAndAddressBuffer(privateKey)
  const sign = function (message) {
    return ecc.sign(message, privateKey)
  }
  const signTx = function (txData) {
    return signTransaction(txData, privateKey)
  }

  return {
    address,
    publicKey,
    privateKey,
    sign,
    signTransaction: signTx
  }
}

function signTransaction (txData, privateKey) {
  privateKey = toKeyBuffer(privateKey)
  txData.publicKey = ecc.toPublicKey(privateKey)
  const tx = new Tx(txData.to, txData.value, txData.fee, txData.data, txData.nonce)
  txData.signature = toDataString(ecc.sign(tx.sigHash, privateKey).signature)

  if (!txData.nonce) {
    txData.nonce = tx.nonce
  }
  if (typeof txData.data !== 'string') {
    txData.data = JSON.stringify(txData.data)
  }

  return txData
}

function verifyTxSignature (tx) {
  if (!ecc.verify(tx.sigHash, tx.signature, tx.publicKey)) {
    throw new Error('Invalid signature')
  }
}

module.exports = { signTransaction, verifyTxSignature, newAccount, getAccount }
