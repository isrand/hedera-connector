import {SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {Socket} from 'socket.io';
import {TopicMessage, TopicMessageQuery} from '@hashgraph/sdk';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {TopicService} from './TopicService';
import {GatewayGetTopicMessages} from './dtos/GatewayGetTopicMessages';
import * as Long from 'long';
import {TopicManager} from './support/TopicManager';

/*
 * TopicGateway implements a websocket endpoint to allow for a constant streaming of messages from public
 * and encrypted, private topics.
 */
@WebSocketGateway()
export class TopicGateway {
  private readonly hederaStub: HederaStub;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly topicService: TopicService) {
    this.hederaStub = new HederaStub();
  }

  @SubscribeMessage('topic_messages')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public getPublicTopicMessages(clientSocket: Readonly<Socket>, getTopicMessageParameters: Readonly<GatewayGetTopicMessages>): void {
    const topicMessageQuery = new TopicMessageQuery({
      topicId: getTopicMessageParameters.topicId
    }).setStartTime(0);

    topicMessageQuery.subscribe(
      this.hederaStub.client,
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

  @SubscribeMessage('encrypted_topic_messages')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public getEncryptedTopicMessages(clientSocket: Readonly<Socket>, getTopicMessageParameters: Readonly<GatewayGetTopicMessages>): void {
    const topicConfiguration = TopicManager.getTopicConfiguration(getTopicMessageParameters.topicId);
    const topicMessageQuery = new TopicMessageQuery({
      topicId: getTopicMessageParameters.topicId
    }).setStartTime(0);

    topicMessageQuery.subscribe(
      this.hederaStub.client,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (error: TopicMessage) => {
        clientSocket.emit('encrypted_topic_error', JSON.stringify(error));
      },
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (message: TopicMessage) => {
        clientSocket.emit('encrypted_topic_message', this.topicService.handleEncryptedTopicMessage(topicConfiguration.encryptionSize, message.contents, message.consensusTimestamp, (message.sequenceNumber as Long).toNumber()));
      }
    );
  }
}
