import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export async function publish(data, topic) {
  console.log('SNS Topic', topic);
  console.log('Sending to SNS', JSON.stringify(data));

  const snsClient = new SNSClient({});
  console.log('Sending...');
  const response = await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify(data),
      TopicArn: topic,
    }),
  );
  console.log('PUB to SNS', response);
  // {
  //   '$metadata': {
  //     httpStatusCode: 200,
  //     requestId: 'e7f77526-e295-5325-9ee4-281a43ad1f05',
  //     extendedRequestId: undefined,
  //     cfId: undefined,
  //     attempts: 1,
  //     totalRetryDelay: 0
  //   },
  //   MessageId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  // }
  return response;
}

export default publish;