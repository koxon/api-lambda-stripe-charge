export function processRequest(stripeEvent) {
   // Process events
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded':
      console.log(`OK payment_intent.succeeded`);
      processRequest(stripeEvent);
      return 'OK';
    case 'customer.updated':
      console.log(`OK customer.updated`);
      return 'OK';
    case 'customer.created':
      console.log(`OK customer.created`);
      return 'OK';
    case 'charge.succeeded':
      console.log(`OK charge.succeeded`);
      return 'OK';
    case 'customer.subscription.created':
      console.log(`OK customer.subscription.created`);
      return 'OK';
    case 'customer.subscription.updated':
      console.log(`OK customer.subscription.updated`);
      return 'OK';
    case 'invoice.payment_failed':
      console.log(`OK invoice.payment_failed`);
      return 'OK';
    case 'invoice.paid':
      console.log(`OK invoice.paid`);
      return 'OK';
    default:
      throw `⚠️  Unsupported Stripe event: ${stripeEvent.type}`;
  }
}

export default processRequest;