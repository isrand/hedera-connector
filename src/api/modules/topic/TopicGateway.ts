import {SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {Socket} from 'socket.io';
import {TopicMessage, TopicMessageQuery} from '@hashgraph/sdk';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {GatewayGetTopicMessages} from './dtos/GatewayGetTopicMessages';
import {Wallet} from '../../../wallet/Wallet';
import {Configuration} from '../../../configuration/Configuration';

@WebSocketGateway()
export class TopicGateway {
  @SubscribeMessage('topic_messages')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async getPublicTopicMessages(clientSocket: Readonly<Socket>, getTopicMessageParameters: Readonly<GatewayGetTopicMessages>): Promise<void> {
    const account = getTopicMessageParameters.accountId ? await Wallet.getAccount(getTopicMessageParameters.accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    const topicMessageQuery = new TopicMessageQuery({
      topicId: getTopicMessageParameters.topicId
    }).setStartTime(0);

    topicMessageQuery.subscribe(
      new HederaStub(
        account
      ).client,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (error: TopicMessage) => {
        clientSocket.emit('topic_error', JSON.stringify(error));
      },
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (message: TopicMessage) => {
        clientSocket.emit('topic_message', JSON.stringify(message));
      }
    );
  }
}
