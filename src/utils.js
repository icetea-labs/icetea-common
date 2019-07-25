const ecc = require('./ecc')
const Tx = require('./Tx')
const { toKeyBuffer, toDataString } = require('./codec')
const { AccountType } = require('./enum')

function newAccount (accountType) {
  return getAccount(ecc.newKeyBuffers(accountType))
}

function newRegularAccount () {
  return newAccount(AccountType.REGULAR_ACCOUNT)
}

function newBankAccount () {
  return newAccount(AccountType.BANK_ACCOUNT)
}

function getAccount (privateKey) {
  if (!privateKey) {
    throw new Error('Private key is required.')
  }

  let publicKey, address

  // In case they pass in an object created by ecc.newKeyBuffers
  if (privateKey.privateKey) {
    publicKey = privateKey.publicKey
    address = privateKey.address
    privateKey = privateKey.privateKey
  }

  if (typeof privateKey !== 'string' && !Buffer.isBuffer(privateKey)) {
    throw new Error('Invalid private key. Private key must be a Buffer or a string.')
  }

  // ensure private key is Buffer
  privateKey = toKeyBuffer(privateKey)
  if (privateKey.length !== 32) {
    throw new Error('Invalid private key length.')
  }

  if (!publicKey || !address) {
    ({ publicKey, address } = ecc.toPubKeyAndAddressBuffer(privateKey))
  }

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
  txData.evidence = txData.evidence || []
  const evidence = {}

  evidence.pubkey = ecc.toPublicKey(privateKey)
  const tx = new Tx(txData)
  evidence.signature = toDataString(ecc.sign(tx.sigHash, privateKey).signature)

  txData.evidence.push(evidence)

  if (!txData.nonce) {
    txData.nonce = tx.nonce
  }

  return txData
}

function verifyTxSignature (tx, collectSigners = true) {
  let evidence = tx.evidence
  if (!Array.isArray(evidence)) {
    evidence = [evidence]
  }

  const signers = []
  evidence.forEach(e => {
    if (!ecc.verify(tx.sigHash, e.signature, e.pubkey)) {
      throw new Error('Invalid signature.')
    }
    if (collectSigners) {
      signers.push(ecc.toAddress(e.pubkey))
    }
  })

  if (collectSigners) {
    tx.signers = signers
  }
}

module.exports = { signTransaction, verifyTxSignature, newAccount, newRegularAccount, newBankAccount, getAccount }
