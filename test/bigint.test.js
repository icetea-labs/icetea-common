const { codec } = require('../src')

const src = 1n
const e = codec.encode(src)
const d = codec.decode(e)
console.log(e, d)
