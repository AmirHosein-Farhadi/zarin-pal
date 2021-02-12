const bodyParser = require("body-parser");
const PurchaseController = require("./controllers/PurchaseController");

const jsonParser = bodyParser.json();

module.exports = (app) => {
    app.post('/purchase/register', jsonParser, PurchaseController.registerPurchase)
    app.get('/purchase/get/purchase', jsonParser, PurchaseController.getPurchase)
    app.get('/purchase/get/own/purchases', jsonParser, PurchaseController.getOwnPurchases)
    app.get('/purchase/get/all/purchases', jsonParser, PurchaseController.getAllPurchases)
    app.post('/purchase/send/zarinpal', jsonParser, PurchaseController.payPurchase)
    app.post('/purchase/check/zarinpal', jsonParser, PurchaseController.checkPay)
};
