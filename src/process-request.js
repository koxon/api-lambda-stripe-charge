import publish from './pubsub-repository.js';

export async function processRequest(stripeEvent) {

  const supportedEvents = [
    'payment_intent.succeeded',
    'customer.created',
    'customer.updated',
    'charge.succeeded',
    'customer.subscription.created',
    'customer.subscription.updated',
    'invoice.payment_failed',
    'invoice.paid',
    'checkout.session.completed',
    'checkout.session.expired'
  ];

  if (!supportedEvents.includes(stripeEvent.type))
    throw `⚠️  Unsupported Stripe event: ${stripeEvent.type}`;

  console.log('Publish to SQS');
  await publish(stripeEvent, process.env.TOPIC_ARN);
  
  return 'OK';
}

export default processRequest;