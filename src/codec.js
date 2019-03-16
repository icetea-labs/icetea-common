
// Encapsulate codec logic here so we might change from msgpack to
// others (protobuf3, amino, bson, RLP) if desired

const msgpack = require('msgpack-lite')
const stableStringify = require('json-stable-stringify')

const basex = require('base-x')
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

exports.base58 = basex(ALPHABET)

exports.encode = msgpack.encode
exports.decode = msgpack.decode

exports.stableStringify = stableStringify
