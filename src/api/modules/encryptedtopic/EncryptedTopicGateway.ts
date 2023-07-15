import {SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {Socket} from 'socket.io';
import {TopicMessage, TopicMessageQuery} from '@hashgraph/sdk';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import * as Long from 'long';
import {Wallet} from '../../../wallet/Wallet';
import {Configuration} from '../../../configuration/Configuration';
import {EncryptedTopicService} from './EncryptedTopicService';
import {GatewayGetTopicMessages} from '../topic/dtos/GatewayGetTopicMessages';

@WebSocketGateway()
export class EncryptedTopicGateway {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly encryptedTopicService: EncryptedTopicService) {
  }

  @SubscribeMessage('encrypted_topic_messages')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async getEncryptedTopicMessages(clientSocket: Readonly<Socket>, getTopicMessageParameters: Readonly<GatewayGetTopicMessages>): Promise<void> {
    const account = getTopicMessageParameters.accountId ? await Wallet.getAccount(getTopicMessageParameters.accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    const topicConfiguration = await this.encryptedTopicService.getEncryptedTopicConfiguration(getTopicMessageParameters.topicId, account.getHederaAccountId());

    const topicMessageQuery = new TopicMessageQuery({
      topicId: getTopicMessageParameters.topicId
    }).setStartTime(0);

    topicMessageQuery.subscribe(
      new HederaStub(
        account
      ).client,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (error: TopicMessage) => {
        clientSocket.emit('encrypted_topic_error', JSON.stringify(error));
      },
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (message: TopicMessage) => {
        clientSocket.emit('encrypted_topic_message', this.encryptedTopicService.handleEncryptedTopicMessage(topicConfiguration.encryptionSize, message.contents, message.consensusTimestamp, (message.sequenceNumber as Long).toNumber(), account.getKyberKeyPair(topicConfiguration.encryptionSize).privateKey));
      }
    );
  }
}
