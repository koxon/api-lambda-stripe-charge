const AWS = require('aws-sdk'),
  ssm = new AWS.SSM(),
  processResponse = require('./src/process-response'),
  // processSubscription = require('./src/process-subscription'),
  STRIPE_SECRET_KEY_NAME = `/${process.env.SSM_STRIPE_SECRET_KEY}`,
  STRIPE_ENDPOINT_SECRET_NAME = `/${process.env.SSM_STRIPE_ENDPOINT_SECRET}`,
  IS_CORS = true;

let data = await ssm.getParameter({ Name: STRIPE_SECRET_KEY_NAME, WithDecryption: true }).promise();
console.log(data);
let stripeSecretKeyValue = data.Parameter.Value;

data = await ssm.getParameter({ Name: STRIPE_ENDPOINT_SECRET_NAME, WithDecryption: true }).promise();
console.log(data);
let stripeEndpointSecret = data.Parameter.Value;

let stripe = require('stripe')(stripeSecretKeyValue);

exports.handler = (event) => {
  console.log(event);

  if (!event.body) {
    return Promise.resolve(processResponse(IS_CORS, 'Body invalid', 400));
  }

  if (!event.headers['Stripe-Signature']) {
    return Promise.resolve(processResponse(IS_CORS, 'No stripe signature', 400));
  }

  // Verify the signature sent by Stripe
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, event.headers['Stripe-Signature'], stripeEndpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return Promise.resolve(processResponse(IS_CORS, `Webhook signature verification failed.`, 400));
  }

  console.log(`StripeEvent type: ${stripeEvent.type}`);

  // Process events
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded':
      return Promise.resolve(processResponse(IS_CORS, `OK`, 200));
    case 'customer.updated':
      return Promise.resolve(processResponse(IS_CORS, `OK`, 200));
    case 'charge.succeeded':
      return Promise.resolve(processResponse(IS_CORS, `OK`, 200));
    default:
      console.error(`Unsupported Stripe event: ${stripeEvent.type}`);
      return Promise.resolve(processResponse(IS_CORS, `Unsupported event ${stripeEvent.type}`, 400));
  }
};
