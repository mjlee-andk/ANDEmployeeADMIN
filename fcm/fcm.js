var FCM = require('fcm-node');
var serverKey = require('../config/and-employees-private-key.json');
var fcm = new FCM(serverKey);

module.exports = {
	fcmObj : fcm
}