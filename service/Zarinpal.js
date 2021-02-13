const soap = require('soap');
const axios = require('axios');
const { head } = require('..');

const appConfig = {
  appTitle: 'درگاه پرداخت زرین پال مبتنی بر NodeJS',
  zarinpalMerchant: '1cd6c129-a7b0-4970-91b2-04abe62aaa0e',

  zarinpalSoapServer: 'https://zarinpal.com/pg/services/WebGate/wsdl',
};

const request = (zpamount, zpemail, zpphone, zpdesc, redirect, zpcallback) => {
  const url = appConfig.zarinpalSoapServer;
  const args = {
    MerchantID: appConfig.zarinpalMerchant,
    Amount: zpamount,
    Description: zpdesc,
    Email: zpemail,
    Mobile: zpphone,
    CallbackURL: redirect,
  };
  soap.createClient(url, (err, client) => {
    client.PaymentRequest(args, (err, result) => {
      const parseData = JSON.parse(JSON.stringify(result));
      if (Number(parseData.Status) === 100) {
        const status = true;
        const url =
          'https://www.zarinpal.com/pg/StartPay/' + parseData.Authority;
        zpcallback({ status: status, url: url });
      } else {
        const status = false;
        const code = parseData.Status;
        zpcallback({ status: status, code: 'خطایی پیش آمد! ' + code });
      }
    });
  });
};
exports.testZarin = (req, res) => {
  const { zpamount, zpemail, zpphone, zpdesc, redirect } = req.body;

  return request(zpamount, zpemail, zpphone, zpdesc, redirect, (data) => {
    console.log('====================================');
    console.log(data);
    console.log('====================================');

    if (data.status) {
      res.send(data);
    } else {
      res.status(422).send({ error: 'we have an issue', err: data.code });
    }
  });
};

exports.PaymentRequest = (inp) => {
  inp = { ...inp, MerchantID: appConfig.zarinpalMerchant };
  return new Promise((res, rej) => {
    return axios
      .post('https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json', inp)
      .then((resp) =>
        res({
          ...resp.data,
          url: 'https://www.zarinpal.com/pg/StartPay/' + resp.data.Authority,
        })
      )
      .catch((err) => rej(err.response.data));
  });
};

exports.PaymentVerification = (inp) => {
  inp = { ...inp, MerchantID: appConfig.zarinpalMerchant };
  return new Promise((res, rej) => {
    return axios
      .post(
        'https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json',
        inp
      )
      .then((resp) => res(resp.data))
      .catch((err) => rej(err.response.data));
  });
};

exports.UnverifiedPurchases = (inp) => {
  inp = { ...inp, MerchantID: appConfig.zarinpalMerchant };
  return new Promise((res, rej) => {
    return axios
      .post('https://api.zarinpal.com/pg/v4/payment/unVerified.json', inp)
      .then((resp) => res(resp.data))
      .catch((err) => rej(err.response.data));
  });
};

exports.RefundPurchase = (authority) => {
  return new Promise((res, rej) => {
    return axios
      .post(
        'https://api.zarinpal.com/pg/v4/payment/refund.json',
        {
          authority,
          merchant_id: appConfig.zarinpalMerchant,
        },
        {
          headers: {
            accept: 'application/json',
            authorization:
              'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNTExZGU0OTI4YmMwNjkwYTkyNWIxNGM4ZWM4YjdlYWQ0YzViMGUwZDM4ZmFhYjMzYjJlNzMzZGZiYjg0MWVhMjBhMjBmNDY3N2ExYWI5MGMiLCJpYXQiOiIxNjEyMTkxNzI2Ljg3ODkzMyIsIm5iZiI6IjE2MTIxOTE3MjYuODc4OTQwIiwiZXhwIjoiMTc2OTk1ODEyNi42OTUwMDkiLCJzdWIiOiI4NDc2MzkiLCJzY29wZXMiOltdfQ.Czw_f31GDnk_iNwTketCOtNcn2eTlwiaWEvUea1amQK5nfWvhUCYsHnXmcFi2Qpch2iaeJjYhn6EXw3zrH9awRVoFZGdiNN4RG2r9aFJyQdVawZN59E0OJuQYbthsenGX687PwCtnWMtVBxiDSGy8heoF6j_bvTv2D-U2CpymeQJ0rzNCBWDkd9XaAlqJYBqslSntdF477jBpJ3aCdwtsxpQFa3vNk-NrTqgFed5Us8OhJmt3eYVDaMGuhNp9CxuY64s0snjttIXz-S5M4BfMkmYn0x9SVKnCL-OYYS009DHJWyGh_DuBAg0nxJQtP7a8l63JOzAsAoM_0L71roRPT8RH3aE3xNhpFXvvLLbpgP90DBHAKNIAFklc-DGFT1OhzUzxrGJog2d7drTl75QRb90k53-MVj4YAqnRENUK8AAGfNGPFaX5gZtYxZzRVdFME6ny-RyK5uShJxTpbcGODcgha94EeGKdxDVG5829HeuOZ3-qhWiTa51gx78atH6r67Y2fTgehhkfWgVjHCRbQc9Gb_ITsgpFgQbIBjOm5BndVTZ45rEOrLJbFBg3OH0k8r5Ye4pXKSDafp5Olce_I8qlINPBQFGD1jZE3OlyHjw9g9KMdAkhp7HdjL2O3rk90Agfh0s7gq3WSYYSLktn7KSCWRTF1WbT070_DUnYts',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
          },
        }
      )
      .then((resp) => res(resp.data))
      .catch((err) => rej(err.response.data));
  });
};
