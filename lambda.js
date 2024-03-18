import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import processRequest from './src/process-request.js';
import processResponse from './src/process-response.js';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY_NAME = `/${process.env.SSM_STRIPE_SECRET_KEY}`;
const STRIPE_ENDPOINT_SECRET_NAME = `/${process.env.SSM_STRIPE_ENDPOINT_SECRET}`;
const IS_CORS = true;

// Getting secrets from SSM
const ssm = new SSMClient();

// Get Strip secretkey
let command = new GetParameterCommand({ Name: STRIPE_SECRET_KEY_NAME, WithDecryption: true });
let data = await ssm.send(command);
const stripeSecretKeyValue = data.Parameter.Value;

// Get webhook endpoint secret
command = new GetParameterCommand({ Name: STRIPE_ENDPOINT_SECRET_NAME, WithDecryption: true });
data = await ssm.send(command);
const stripeEndpointSecret = data.Parameter.Value;

// Import and load stripe with private key from SSM
const stripe = new Stripe(stripeSecretKeyValue);

export const handler = async (event) => {
  console.log(event);

  if (!event.body) 
    return Promise.resolve(processResponse(IS_CORS, 'Body invalid', 400));

  if (!event.headers['Stripe-Signature']) 
    return Promise.resolve(processResponse(IS_CORS, 'No stripe signature', 400));

  // Verify the signature sent by Stripe
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, event.headers['Stripe-Signature'], stripeEndpointSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return Promise.resolve(processResponse(IS_CORS, `Webhook signature verification failed.`, 400));
  }

  console.log(`StripeEvent type: ${stripeEvent.type}`);

  try {
    const response = await processRequest(stripeEvent);
    return Promise.resolve(processResponse(IS_CORS, response, 200));
  } catch (err) {
    console.error(err);
    return Promise.resolve(processResponse(IS_CORS, err.message, 400));
  }
};
