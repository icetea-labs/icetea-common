const Tx = require('./Tx')

const _randomBytes = require('randombytes')
const secp256k1 = require('secp256k1')

function _ensureBuffer (text, enc = 'base64') {
  if (typeof text === 'string') {
    return Buffer.from(text, enc)
  }

  return text
}

const t = {
  verify: function (signature, message, pubKey) {
    return secp256k1.verify(_ensureBuffer(message), _ensureBuffer(signature), _ensureBuffer(pubKey))
  },

  verifyTxSignature: function (tx) {
    if (!t.verify(tx.signature, tx.signatureMessage, tx.from)) {
      throw new Error('Invalid signature')
    }
  },

  generateKey: function () {
    let privKey
    do {
      privKey = _randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))
    return privKey
  },

  toPublicKey: function (privateKey) {
    return secp256k1.publicKeyCreate(_ensureBuffer(privateKey))
  },

  newKeyPair () {
    const privateKey = t.generateKey()
    const publicKey = t.toPublicKey(privateKey)
    return {
      private: privateKey.toString('base64'),
      public: publicKey.toString('base64')
    }
  },

  sign (message, privateKey) {
    return secp256k1.sign(_ensureBuffer(message), _ensureBuffer(privateKey))
  },

  signTxData (txData, privateKey) {
    const tx = new Tx(txData.from, txData.to, txData.value, txData.fee, txData.data, txData.nonce)
    txData.signature = t.sign(tx.signatureMessage, privateKey)
    if (!txData.nonce) {
      txData.nonce = tx.nonce
    }
    if (typeof txData.data !== 'string') {
      txData.data = JSON.stringify(txData.data)
    }

    return txData
  }
}

module.exports = t
