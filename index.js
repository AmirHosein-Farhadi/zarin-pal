const express = require('express');
const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const schedule = require('node-schedule');
const router = require('./router');

mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// mongoose
//   .connect('mongodb://localhost:27017/GymingDb', {
//     useUnifiedTopology: true,
//   })
//   .catch((error) => {
//     console.log('Rejected To Connect To Mongo -> ', error);
//   });

mongoose
  .connect('mongodb://gyming:Gyming.Gym_Online@mongo:27017/admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => {
    console.log('Rejected To Connect To Mongo -> ', error);
  });

const app = express();

const options = {
  key: fs.readFileSync(__dirname + '/privkey.pem'),
  cert: fs.readFileSync(__dirname + '/fullchain.pem'),
};

app.use(cors());

const port = process.env.PORT || 1357;
const server = http.createServer(options, app);
router(app);

module.exports = app;

server.listen(port);
console.log('Server Running On Port -> ', port);

console.log('Starting Refund Schedule ...');
schedule.scheduleJob('0 0 * * *', () => {
  Zarinpal.UnverifiedPurchases()
    .catch((error) => console.error(error))
    .then((zarin) => {
      if (zarin.data.code + '' !== '100') {
        console.error('Request Failed');
        return;
      }

      console.error(
        new Date(),
        'Got The Unverified Purchases Successfully',
        zarin
      );

      const purchases = zarin.data.authorities;

      purchases.forEach((purchase) => {
        console.log(
          'Refunding The Purchase (authority -> ' + purchase.authority + ' )'
        );

        Zarinpal.RefundPurchase(purchase.authority)
          .catch((error) => {
            console.error(error);
            console.error('Refund Failed');
          })
          .then((zarin) => {
            console.error(zarin);
            if (zarin.data.code + '' !== '100') {
              console.error('Refunding Failed');
              return;
            }
            console.log('Refunded Successfully');
          });
      });
    });
});
