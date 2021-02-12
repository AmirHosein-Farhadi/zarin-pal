const Zarinpal = require('../service/Zarinpal');
const Purchase = require('../models/Purchase');

exports.registerPurchase = (req, res) => {
    const {userId, packageId, price, authority} = req.body;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const newPurchase = new Purchase({
        userId: userId,
        packageId: packageId,
        Authority: authority,
        price: price,
        isPaid: false,
    })

    Purchase.findOne({authority}).exec().catch(error => {
        console.log('Could Not Find Purchase -> ' + error)
    }).then(foundedPurchase => {
        if (!foundedPurchase || !foundedPurchase.Authority) {
            newPurchase.save()
                .then(purchaseSaved => {
                    res.send({purchase: purchaseSaved});
                })
                .catch((err) => {
                    res.status(422).send({error: 'we have an issue', err})
                });
        } else {
            res.send({purchase: foundedPurchase});
        }
    })

}

exports.payPurchase = async (req, res) => {
    const {Amount, CallbackURL, Description, Email, Mobile} = req.body;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    Zarinpal.PaymentRequest({Amount, CallbackURL, Description, Email, Mobile})
        .then((zarin) => {
            console.log(zarin);
            return res.send({zarin});
        })
        .catch((err) => res.status(422).send({error: 'we have an issue', err}));
};

exports.checkPay = (req, res) => {
    const {Authority} = req.body;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    Purchase.findOne({Authority, isChecked: false}).exec().catch(error => {
        console.log('Could Not Find Purchase -> ' + error)
    })
        .then(findedPurchase => {
            if (!findedPurchase || !findedPurchase.Authority){
                return res.send({message: 'can not find your purchase or your purchase is not suitable'})
            }
            Zarinpal.PaymentVerification({Authority, Amount: findedPurchase.price})
                .catch(error => {
                    console.log('Could Not Check With ZarinPal -> ', error)
                }).then(zarin => {
                if (zarin.RefID && !findedPurchase.isPaid) {
                    findedPurchase.isPaid = true;
                    findedPurchase.isChecked = true;
                    findedPurchase.save().then(findedPurchaseSaved => findedPurchaseSaved)
                }
                return res.send({zarin, purchase: findedPurchase})
            })
        })
        .catch(err => {
            console.log(err.toString())
            res.status(422).send({error: 'we have an issue', err})
        })
}

exports.getPurchase = (req, res) => {
    Purchase.findById(req.query._id)
        .exec()
        .then((findedPurchase) => res.json({purchase: findedPurchase}))
        .catch((err) => res.status(422).send({error: 'we have an issue', err}))
}

exports.getOwnPurchases = (req, res) => {

    Purchase.find({user: req.user._id})
        .exec()
        .then((findedPurchases) => res.json({purchases: findedPurchases}))
        .catch((err) => res.status(422).send({error: 'we have an issue', err}))
}

exports.getAllPurchases = (req, res) => {

    let query = {};

    Purchase.find(query)
        .limit(30)
        .sort({_id: -1})
        .exec()
        .then((findedPurchases) => res.json({purchases: findedPurchases}))
        .catch((err) => res.status(422).send({error: 'we have an issue', err}))
}
