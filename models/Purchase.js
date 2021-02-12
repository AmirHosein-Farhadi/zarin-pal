const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
    userId: {type: String},
    packageId: {type: String},
    price: {type: Number, default: 0},
    Authority: {type: String, unique: true},
    isPaid: {type: Boolean, default: false},
    isChecked: {type: Boolean, default: false},
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const ModelClass = mongoose.model('Purchase', PurchaseSchema);

module.exports = ModelClass;
