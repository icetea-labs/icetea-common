const { ecc } = require('../src')
const configKey = '5K4kMyGz839wEsG7a9xvPNXCmtgFE5He2Q8y9eurEQ4uNgpSRq7'
const from = ecc.toPublicKey(configKey)
console.log(from)

const ecc2 = require('../src/ecc')
console.log(ecc2.toPublicKey(configKey))
