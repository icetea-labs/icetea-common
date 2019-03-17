const { ecc, utils } = require('../src')

const configKey = ecc.generateKey()
const pub = ecc.toPublicKey(configKey)
console.log(pub)
console.log(ecc.toAddress(pub))

console.log(ecc.newKeyPair())
console.log(ecc.newKeyPairWithAddress())

ecc.validateAddress('tea_3kpNpVJMiz2DQbR4y8dnK9LNiSv6')

console.log(utils.newAccount())
