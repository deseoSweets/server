var crypto = require('crypto');

var data = {
	"amount": "1",
	"curr": "RON",
	"invoice_id": "123",
	"order_desc": "Comanda test",
	"merch_id": "44841002198",
	"timestamp": "20231009105150",
	"nonce": "522d2594b9d65b850aa01dfc4914ea14",
};

var datakeys = Object.keys(data);
	
var hmac = '';
for (var i = 0; i < datakeys.length; i++) {
	if (data[datakeys[i]].length === 0) {
		hmac += '-';
	} else {
		hmac += data[datakeys[i]].length + data[datakeys[i]];
	}
}

// Replace with your actual binKey here
var binKey = Buffer.from("00112233445566778899AABBCCDDEEFF", "hex");
var hmacx = crypto.createHmac("md5", binKey).update(hmac, 'utf8').digest('hex');
data["fp_hash"] = hmacx;

console.log("Computed fp_hash:", data["fp_hash"]);