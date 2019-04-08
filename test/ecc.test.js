const { ecc, utils } = require('../src')

const configKey = ecc.generateKey()
const pub = ecc.toPublicKey(configKey)
console.log(pub)
console.log(ecc.toAddress(pub))

console.log(ecc.newKeyPair())
console.log(ecc.newKeyPairWithAddress())

ecc.validateAddress('tea1mxcz7pzndp69qz5cfx8mh4gw4v87unmxe5wzuc')

console.log(utils.newAccount())
