const randomBytes = require('randombytes')
const createHash = require('create-hash')
const secp256k1 = require('secp256k1')

const {
  toKeyBuffer,
  toKeyString,
  toAddressString,
  decodeAddress,
  toDataBuffer,
  stableStringify,
  DATA_ENCODING,
  BANK_ACCOUNT,
  REGULAR_ACCOUNT,
  isAddressType,
  isAddressBufferType
} = require('./codec')

const PREFIX_MAINNET = 'team'
const PREFIX_TESTNET = 'teat'

function generateKeyBuffer() {
  let privKey
  do {
    privKey = randomBytes(32)
  } while (!secp256k1.privateKeyVerify(privKey))
  return privKey
}

const t = {
  validateAddress: function (address) {
    let len
    try {
      var result = decodeAddress(address)
      const prefix = result.hrp
      if (prefix !== PREFIX_MAINNET && prefix !== PREFIX_TESTNET) {
        throw new Error('Invalid address prefix.')
      }
      len = result.data.length
    } catch (err) {
      err.message = 'Invalid address: ' + err.message
      throw err
    }

    if (len !== 32) {
      throw new Error('Invalid address length.')
    }
    return true
  },

  toPublicKeyBuffer: function (privateKey) {
    return secp256k1.publicKeyCreate(toKeyBuffer(privateKey))
  },

  toPublicKey: function (privateKey) {
    return toKeyString(t.toPublicKeyBuffer(privateKey))
  },

  toAddress: function (publicKey) {
    const hash = createHash('sha256').update(toKeyBuffer(publicKey)).digest()
    const r160Buf = createHash('ripemd160').update(hash).digest()
    return toAddressString(r160Buf, PREFIX_TESTNET)
  },

  toContractAddress: function (uniqueContent, type = BANK_ACCOUNT) {
    type = String(type)
    if (![BANK_ACCOUNT, REGULAR_ACCOUNT].includes(type)) {
      throw new Error(`Invalid account type: ${type}`)
    }

    let hash = createHash('sha256').update(uniqueContent).digest()

    do {
      hash = createHash('ripemd160').update(hash).digest()
    } while (!isAddressBufferType(hash, type))


    return toAddressString(hash, PREFIX_TESTNET)
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

  newKeyBuffers: function (accountType = REGULAR_ACCOUNT) {
    let privateKey, publicKey, address
    do {
     privateKey = generateKeyBuffer()
     publicKey = t.toPublicKeyBuffer(privateKey)
     address = t.toAddress(publicKey)
    } while (isAddressType(address, accountType))

    return {
      publicKey,
      privateKey,
      address
    }
  },

  newKeys: function (accountType = REGULAR_ACCOUNT) {
    const keys = t.newKeyBuffers(accountType)
    keys.privateKey = toKeyString(keys.privateKey)
    keys.publicKey = toKeyString(keys.publicKey)
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
