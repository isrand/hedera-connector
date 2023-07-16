import {TopicInfo} from '@hashgraph/sdk';
import {Injectable, Logger} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {IHederaTransactionResponse} from '../../../hedera/responses/interfaces/IHederaTransactionResponse';
import {IHederaNetworkResponse} from '../../../hedera/responses/interfaces/IHederaNetworkResponse';
import {HederaTransactionResponse} from '../../../hedera/responses/HederaTransactionResponse';
import {IGetMessageFromTopicResponse} from './responses/IGetMessageFromTopicResponse';
import {Wallet} from '../../../wallet/Wallet';
import {Configuration} from '../../../configuration/Configuration';

@Injectable()
export class TopicService {
  private readonly logger: Logger = new Logger(TopicService.name);

  /*
   *
   *Public topics
   *
   */

  public async createPublicTopic(accountId?: string): Promise<IHederaNetworkResponse> {
    this.logger.log('Creating new public topic');

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);
    const createPublicTopicResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).createTopic(
      account.getHederaPrivateKey(),
      account.getHederaAccountId()
    );

    if (createPublicTopicResponse.receipt.topicId) {
      this.logger.log(`Created new public topic. Topic ID: ${createPublicTopicResponse.receipt.topicId.toString()}`);
    }

    return new HederaTransactionResponse(createPublicTopicResponse).parse();
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToPublicTopic(topicId: string, message: string | Uint8Array, accountId?: string): Promise<IHederaNetworkResponse> {
    this.logger.log(`Sending message '${message}' to public topic ID ${topicId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);
    const sendMessageToPublicTopicResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).sendMessageToTopic(
      topicId,
      message
    );

    this.logger.log('Sent message to public topic');

    return new HederaTransactionResponse(sendMessageToPublicTopicResponse).parse();
  }

  public async getMessageFromPublicTopic(topicId: string, sequenceNumber: number, accountId?: string): Promise<IGetMessageFromTopicResponse> {
    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    return await new HederaStub(
      account
    ).getMessageFromTopic(topicId, sequenceNumber);
  }

  public async deleteTopic(topicId: string, accountId?: string): Promise<IHederaNetworkResponse> {
    this.logger.log(`Deleting topic ${topicId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);
    const deleteTopicResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).deleteTopic(topicId);

    this.logger.log(`Deleted topic ${topicId}`);

    return new HederaTransactionResponse(deleteTopicResponse).parse();
  }

  public async getTopicInformation(topicId: string, accountId?: string): Promise<TopicInfo> {
    this.logger.log(`Getting information for topic ${topicId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    return await new HederaStub(
      account
    ).getTopicInformation(topicId);
  }
}
