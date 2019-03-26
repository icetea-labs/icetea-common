const randomBytes = require('randombytes')
const createHash = require('create-hash')
const secp256k1 = require('secp256k1')

const {
  toKeyBuffer,
  toKeyString,
  toDataBuffer,
  stableStringify,
  DATA_ENCODING
} = require('./codec')

const PREFIX = 'tea'
const SEPARATOR = '_'

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
      len = toKeyBuffer(address).length
    } catch (err) {
      err.message = 'Invalid address: ' + err.message
      throw err
    }

    if (len !== 20) {
      throw new Error('Invalid address length.')
    }
  },

  generateKeyBuffer: function () {
    let privKey
    do {
      privKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))
    return privKey
  },

  generateKey: function () {
    return toKeyString(t.generateKeyBuffer())
  },

  toPublicKeyBuffer: function (privateKey) {
    return secp256k1.publicKeyCreate(toKeyBuffer(privateKey))
  },

  toPublicKey: function (privateKey) {
    return toKeyString(t.toPublicKeyBuffer(privateKey))
  },

  toAddress: function (publicKey) {
    const r160Buf = createHash('ripemd160').update(toKeyBuffer(publicKey)).digest()
    return PREFIX + SEPARATOR + toKeyString(r160Buf)
  },

  toPubKeyAndAddressBuffer: function (privKey) {
    const publicKey = t.toPublicKeyBuffer(privKey)
    return {
      publicKey,
      address: t.toAddress(publicKey)
    }
  },

  toPubKeyAndAddress: function (privKey) {
    const { publicKey, address } = t.toPubKeyAndAddressBuffer(privKey)
    return {
      publicKey: toKeyString(publicKey),
      address
    }
  },

  newKeyPairBuffer: function () {
    const privateKey = t.generateKeyBuffer()
    return {
      publicKey: t.toPublicKeyBuffer(privateKey),
      privateKey: privateKey
    }
  },

  newKeyPair: function () {
    const { publicKey, privateKey } = t.newKeyPairBuffer()
    return {
      publicKey: toKeyString(publicKey),
      privateKey: toKeyString(privateKey)
    }
  },

  newKeyPairWithAddressBuffer: function () {
    const privateKey = t.generateKeyBuffer()
    const keys = t.toPubKeyAndAddressBuffer(privateKey)
    keys.privateKey = privateKey
    return keys
  },

  newKeyPairWithAddress: function () {
    const privateKey = t.generateKeyBuffer()
    const keys = t.toPubKeyAndAddress(privateKey)
    keys.privateKey = toKeyString(privateKey)
    return keys
  },

  verify: function (hash32bytes, signature, pubKey) {
    return secp256k1.verify(toDataBuffer(hash32bytes), toDataBuffer(signature), toKeyBuffer(pubKey))
  },

  sign: function (hash32bytes, privateKey) {
    return secp256k1.sign(toDataBuffer(hash32bytes), toKeyBuffer(privateKey))
  },

  stableHashObject: function (obj, enc = DATA_ENCODING) {
    if (typeof obj !== 'string') {
      obj = stableStringify(obj)
    }
    const hash = createHash('sha256').update(obj)
    return enc ? hash.digest(enc) : hash.digest()
  }
}

module.exports = t