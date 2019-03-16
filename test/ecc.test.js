const { ecc } = require('../src')
const configKey = ecc.generateKey()
const from = ecc.toPublicKey(configKey)
console.log(from)

const ecc2 = require('../src/ecc')
console.log(ecc2.toPublicKey(configKey))

console.log(ecc.newKeyPair())
