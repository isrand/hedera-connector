const kyber = require('crystals-kyber');

const publicKey_privateKey = kyber.KeyGen1024();
const publicKey = publicKey_privateKey[0];
const privateKey = publicKey_privateKey[1];

console.log(Buffer.from(publicKey).toString('base64'));
console.log('-----')
console.log(Buffer.from(privateKey).toString('base64'));
