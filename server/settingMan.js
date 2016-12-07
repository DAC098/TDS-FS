var SettingsManager = require('./SettingsManager/index.js')('./settings.json');

let temp = SettingsManager.get('http.host');

console.log('temp:',temp);

SettingsManager.http.host = '127.0.0.1';

console.log('changed to:',SettingsManager.http.host);

console.log('test:',SettingsManager.ssl);

module.exports = SettingsManager;
