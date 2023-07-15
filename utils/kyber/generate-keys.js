const kyber = require('crystals-kyber');
const fs = require('fs');

if(!fs.existsSync('chart/charts/hedera-connector/artifacts')) {
  fs.mkdirSync('chart/charts/hedera-connector/artifacts');
}

if (!fs.existsSync('chart/charts/hedera-connector/artifacts/kyber_512.pub') && !fs.existsSync('chart/charts/hedera-connector/artifacts/kyber_512.priv')) {
  const keys_512 = kyber.KeyGen512();
  fs.writeFileSync('chart/charts/hedera-connector/artifacts/kyber_512.pub', Buffer.from(keys_512[0]).toString('base64'));
  fs.writeFileSync('chart/charts/hedera-connector/artifacts/kyber_512.priv', Buffer.from(keys_512[1]).toString('base64'));
}

if (!fs.existsSync('chart/charts/hedera-connector/artifacts/kyber_768.pub') && !fs.existsSync('chart/charts/hedera-connector/artifacts/kyber_768.priv')) {
  const keys_768 = kyber.KeyGen768();
  fs.writeFileSync('chart/charts/hedera-connector/artifacts/kyber_768.pub', Buffer.from(keys_768[0]).toString('base64'));
  fs.writeFileSync('chart/charts/hedera-connector/artifacts/kyber_768.priv', Buffer.from(keys_768[1]).toString('base64'));
}

if (!fs.existsSync('chart/charts/hedera-connector/artifacts/kyber_1024.pub') && !fs.existsSync('chart/charts/hedera-connector/artifacts/kyber_1024.priv')) {
  const keys_1024 = kyber.KeyGen1024();
  fs.writeFileSync('chart/charts/hedera-connector/artifacts/kyber_1024.pub', Buffer.from(keys_1024[0]).toString('base64'));
  fs.writeFileSync('chart/charts/hedera-connector/artifacts/kyber_1024.priv', Buffer.from(keys_1024[1]).toString('base64'));
}