/* global BigInt */

const { codec } = require('../src')

const src = BigInt(1)
const e = codec.encode(src)
const d = codec.decode(e)
console.log(e, d)
