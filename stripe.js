const AWS = require('aws-sdk'),
  ssm = new AWS.SSM(),
  processResponse = require('./src/process-response'),
  // processSubscription = require('./src/process-subscription'),
  STRIPE_SECRET_KEY_NAME = `/${process.env.SSM_STRIPE_SECRET_KEY}`,
  STRIPE_ENDPOINT_SECRET_NAME = `/${process.env.STRIPE_ENDPOINT_SECRET_NAME}`,
  IS_CORS = true,
  stripeSecretKeyValue = ssm.getParameter({ Name: STRIPE_SECRET_KEY_NAME, WithDecryption: true }),
  stripeEndpointSecret = ssm.getParameter({ Name: STRIPE_ENDPOINT_SECRET_NAME, WithDecryption: true }),
  stripe = require('stripe')(stripeSecretKeyValue);

exports.handler = (event) => {
  console.log(event);

  if (!event.body) {
    return Promise.resolve(processResponse(IS_CORS, 'invalid', 400));
  }

  // Verify the signature sent by Stripe
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, request.headers['stripe-signature'], stripeEndpointSecret.Parameter.value);
  } catch (err) {
    console.err(`⚠️  Webhook signature verification failed.`, err.message);
    return response.sendStatus(400);
  }

  console.log(`StripeEvent type: ${stripeEvent.type}`);

  // Process events
  switch (stripeEvent.type) {
    case 'subscription.created':
      return Promise.resolve(processResponse(IS_CORS, `OK`, 200));
    case 'customer.created':
      return Promise.resolve(processResponse(IS_CORS, `OK`, 200));
    case 'charge.succeeded':
      return Promise.resolve(processResponse(IS_CORS, `OK`, 200));
    default:
      console.err(`Unsupported Stripe event: ${stripeEvent.type}`);
      return Promise.resolve(processResponse(IS_CORS, `Unsupported event ${stripeEvent.type}`, 400));
  }
};
