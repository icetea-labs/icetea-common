
// Encapsulate codec logic here so we might change from msgpack to
// others (protobuf3, amino, bson, RLP) if desired

const msgpack = require('msgpack-lite')
const stableStringify = require('json-stable-stringify')

const basex = require('base-x')
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const base58 = basex(ALPHABET)

const bech32 = require('./bech32')

const KEY_ENCODING = 'base58'
const TX_ENCODING = 'msgpack'
const DATA_ENCODING = 'base64'

// STRING to BUFFER, support base58
const toBuffer = (text, enc = KEY_ENCODING) => {
  if (Buffer.isBuffer(text)) return text

  if (typeof text !== 'string') {
    throw new Error('Text must be a string.')
  }

  if (enc === 'base58') {
    return base58.decode(text)
  }

  return Buffer.from(text, enc)
}

// BUFFER to STRING, support base58
const toString = (buf, enc = KEY_ENCODING) => {
  if (typeof buf === 'string') return buf

  if (!Buffer.isBuffer(buf)) {
    throw new Error('Buf must be a buffer.')
  }

  if (enc === 'base58') {
    return base58.encode(buf)
  }

  return buf.toString(enc)
}

const toAddressString = (buf, prefix) => {
  return bech32.encode(prefix, _8to5bits(buf))
}

// BUFFER to ARRAY (8bits to 5bits)
const _8to5bits = (buffer) => {
  var length = buffer.byteLength
  var view = new Uint8Array(buffer)

  var bits = 0
  var value = 0
  var output = []

  for (var i = 0; i < length; i++) {
    value = (value << 8) | view[i]
    bits += 8

    while (bits >= 5) {
      output.push((value >>> (bits - 5)) & 31)
      bits -= 5
    }
  }

  if (bits > 0) {
    output.push((value << (5 - bits)) & 31)
  }
  return output
}

// Decode & encode of OBJECT <-> BUFFER
// It is more space-efficient than OBJECT stringify to JSON then convert to Buffer utf8
// Other candidates: protobuf3, amino, bson, RLP
exports.TX_ENCODING = TX_ENCODING
exports.encode = msgpack.encode
exports.decode = msgpack.decode

// Encode/decode of keys (pubic, private, address, hash) for displaying
// base58 is shorter than hex and still readable
exports.KEY_ENCODING = KEY_ENCODING
exports.toKeyBuffer = text => toBuffer(text, KEY_ENCODING)
exports.toKeyString = buf => toString(buf, KEY_ENCODING)

exports.toAddressString = toAddressString
exports.decodeAddress = bech32.decode

exports.DATA_ENCODING = DATA_ENCODING
exports.toDataBuffer = text => toBuffer(text, DATA_ENCODING)
exports.toDataString = buf => toString(buf, DATA_ENCODING)

// OBJECT to JSON string, does not effected by Object.keys ordering
exports.stableStringify = stableStringify

// STRING ,-> BUFFER, support base58
exports.toBuffer = toBuffer
exports.toString = toString
