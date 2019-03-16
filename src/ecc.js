const randomBytes = require('randombytes')
const createHash = require('create-hash')
const secp256k1 = require('secp256k1')

const { base58, stableStringify } = require('./codec')

const PREFIX = 'tea'
const SEPARATOR = '_'

function _ensureBuffer(text, enc = 'base64') {
  return typeof text === 'string' ? Buffer.from(text, enc) : text
}

const t = {
  validateAddress: function (address) {
    const parts = address.split(SEPARATOR)
    if (parts.length !== 2) {
      throw new Error('Invalid address prefix.')
    }

    const prefix = parts[0]
    address = parts[1]

    if (prefix !== PREFIX && !/^\d+$/.test(prefix)) {
      throw new Error('Invalid address prefix.')
    }

    let len
    try {
      len = base58.decode(address).length
    } catch (err) {
      err.message = 'Invalid address: ' + err.message
      throw err
    }

    if (len !== 20) {
      throw new Error('Invalid address length.')
    }
  },

  verify: function (signature, message, pubKey) {
    return secp256k1.verify(_ensureBuffer(message), _ensureBuffer(signature), _ensureBuffer(pubKey))
  },

  generateKeyBuffer: function () {
    let privKey
    do {
      privKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))
    return privKey
  },

  generateKey: function (enc = 'base64') {
    return t.generateKeyBuffer().toString(enc)
  },

  toPublicKeyBuffer: function (privateKey) {
    return secp256k1.publicKeyCreate(_ensureBuffer(privateKey))
  },

  toPublicKey: function (privateKey, enc = 'base64') {
    return t.toPublicKeyBuffer(privateKey).toString(enc)
  },

  toAddress: function (publicKey, enc = 'base64') {
    const r160Buf = createHash('ripemd160').update(_ensureBuffer(publicKey, enc)).digest()
    return PREFIX + SEPARATOR + base58.encode(r160Buf)
  },

  toPubKeyAndAddress: function (privKey, enc = 'base64') {
    const publicKey = t.toPublicKeyBuffer(privKey)
    return {
      publicKey: publicKey.toString(enc),
      address: t.toAddress(publicKey, enc)
    }
  },

  newKeyPair: function (enc = 'base64') {
    const privateKey = t.generateKeyBuffer()
    return {
      publicKey: t.toPublicKey(privateKey, enc),
      privateKey: privateKey.toString(enc)
    }
  },

  newKeyPairWithAddress: function (enc = 'base64') {
    const privateKey = t.generateKeyBuffer()
    const keys = t.toPubKeyAndAddress(privateKey, enc)
    keys.privateKey = privateKey.toString(enc)
    return keys
  },

  sign: function (message, privateKey) {
    return secp256k1.sign(_ensureBuffer(message), _ensureBuffer(privateKey))
  },

  stableHashObject: function (obj, enc) {
    if (typeof obj !== 'string') {
      obj = stableStringify(obj)
    }
    const hash = createHash('sha256').update(obj)
    if (enc) {
      return hash.digest(enc) // Text
    }
    return hash.digest() // Buffer
  }

}

module.exports = t
