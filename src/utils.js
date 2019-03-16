const ecc = require('./ecc')
const Tx = require('./Tx')

function _ensureBuffer(text, enc = 'base64') {
    return typeof text === 'string' ? Buffer.from(text, enc) : text
}

function newAccount() {
    return ecc.getAccount(ecc.generateKeyBuffer())
}

function getAccount(privateKey, privateKeyEnc = 'base64') {
    if (!privateKey || !(typeof privateKey === 'string' || Buffer.isBuffer(privateKey))) {
        throw new Error('Invalid private key. Private key must be a Buffer or a string.')
    }
    privateKey = _ensureBuffer(privateKey, privateKeyEnc)
    if (privateKey.length !== 32) {
        throw new Error('Invalid private key length.')
    }

    const publicKey = ecc.toPublicKeyBuffer(privateKey)
    const address = ecc.toAddress(publicKey)
    const sign = function (message) {
        return ecc.sign(message, privateKey)
    }
    const signTxData = function (txData, enc = 'base64') {
        return ecc.signTxData(txData, privateKey, enc)
    }

    return {
        address,
        publicKey,
        privateKey,
        sign,
        signTxData
    }
}

function signTxData(txData, privateKey, enc = 'base64') {
    privateKey = _ensureBuffer(privateKey)
    txData.publicKey = ecc.toPublicKey(privateKey)
    const tx = new Tx(txData.to, txData.value, txData.fee, txData.data, txData.nonce)
    txData.signature = ecc.sign(tx.signatureMessage, privateKey).signature.toString(enc)

    if (!txData.nonce) {
        txData.nonce = tx.nonce
    }
    if (typeof txData.data !== 'string') {
        txData.data = JSON.stringify(txData.data)
    }

    return txData
}

function verifyTxSignature(tx) {
    if (!ecc.verify(tx.signature, tx.signatureMessage, tx.publicKey)) {
        throw new Error('Invalid signature')
    }
}

module.exports = { signTxData, verifyTxSignature, newAccount, getAccount }