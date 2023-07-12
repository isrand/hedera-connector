import {
  FileAppendTransaction,
  FileCreateTransaction,
  LocalProvider,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  Transaction,
  Wallet,
  Hbar,
  TopicMessageQuery,
  TopicMessage,
  TopicInfoQuery,
  FileContentsQuery,
  FileUpdateTransaction,
  TopicDeleteTransaction,
  TopicInfo,
  FileDeleteTransaction
} from '@hashgraph/sdk';
import {HederaClient} from '../client/HederaClient';
import {IHederaTransactionResponse} from '../responses/interfaces/IHederaTransactionResponse';
import {IHederaStub} from './interfaces/IHederaStub';
import {IGetMessageFromTopicResponse} from '../../api/modules/topic/responses/IGetMessageFromTopicResponse';
import {InternalServerErrorException} from '@nestjs/common';
import * as Long from 'long';
import * as CredentialsWallet from '../../wallet/Wallet';

/*
 *The HederaStub class implements the methods from IHederaStub
 *using the actual Hedera Hashgraph SDK to communicate
 *with the network.
 */
export class HederaStub implements IHederaStub {
  private readonly hederaWallet: Wallet;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly hederaClient: HederaClient) {
    this.hederaWallet = new Wallet(CredentialsWallet.Wallet.getHederaAccountId(), CredentialsWallet.Wallet.getHederaPrivateKey(), new LocalProvider());
  }

  // "getClient" returns the HederaClient instance that this stub is using.
  public getClient(): HederaClient {
    return this.hederaClient;
  }

  /*
   * "createTopic" creates a new topic on the Hedera network. This method is used to
   * create both public and encrypted (private) topics.
   */
  public async createTopic(adminKey: string, renewAccountId: string, submitKey?: string): Promise<IHederaTransactionResponse> {
    const transaction: TopicCreateTransaction = new TopicCreateTransaction({
      adminKey: PrivateKey.fromString(adminKey),
      autoRenewAccountId: renewAccountId
    });

    if (submitKey) {
      transaction.setSubmitKey(PrivateKey.fromString(submitKey));
    }

    await transaction.freezeWithSigner(this.hederaWallet);
    await this.signWithSigner(transaction, this.hederaWallet);

    return await this.executeWithSigner(transaction, this.hederaWallet);
  }

  // "deleteTopic" deletes a topic, public or encrypted.
  public async deleteTopic(topicId: string): Promise<IHederaTransactionResponse> {
    const transaction: Transaction = await new TopicDeleteTransaction({
      topicId: topicId
    }).freezeWithSigner(this.hederaWallet);

    await this.signWithSigner(transaction, this.hederaWallet);

    return await this.executeWithSigner(transaction, this.hederaWallet);
  }

  public async getTopicInformation(topicId: string): Promise<TopicInfo> {
    const topicInfo: TopicInfoQuery = new TopicInfoQuery({
      topicId: topicId
    });

    return await topicInfo.executeWithSigner(this.hederaWallet);
  }

  /*
   * "sendMessageToTopic" send a message to a topic on the Hedera network. This method is used to
   * send messages to both public and encrypted (private) topics.
   */
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToTopic(topicId: string, message: string | Uint8Array, submitKey?: string): Promise<IHederaTransactionResponse> {
    const transaction: Transaction = await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: message
    }).freezeWithSigner(this.hederaWallet);

    // submitKey is used in either encrypted topics or publicly available, but access-controlled topics
    if (submitKey) {
      await transaction.sign(PrivateKey.fromString(submitKey));
    }

    await this.signWithSigner(transaction, this.hederaWallet);

    return this.executeWithSigner(transaction, this.hederaWallet);
  }

  public async getMessageFromTopic(topicId: string, sequenceNumber: number): Promise<IGetMessageFromTopicResponse> {
    // First, check if topic has messages up to "sequenceNumber"
    const topicInfo = new TopicInfoQuery({
      topicId: topicId
    });

    const topicInfoResponse: TopicInfo = await topicInfo.executeWithSigner(this.hederaWallet);

    if (Number(sequenceNumber) > (topicInfoResponse.sequenceNumber as Long).toNumber()) {
      throw new InternalServerErrorException('Topic sequence number is less than the one provided.');
    }

    const topicMessageQuery = new TopicMessageQuery({
      topicId: topicId
    }).setStartTime(0);

    const message: TopicMessage = await new Promise((resolve, reject) => {
      topicMessageQuery.subscribe(
        this.hederaClient.client,
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        (error: TopicMessage) => {
          reject(error);
        },
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        (topicMessage: TopicMessage) => {
          // Check if the original message was split among different chunks
          if (topicMessage.chunks.length > 0) {
            for (const chunk of topicMessage.chunks) {
              if ((chunk.sequenceNumber as Long).toNumber() === Number(sequenceNumber)) {
                resolve(topicMessage);
              }
            }
          }

          // Check if the original message is kept within just one message (no chunks)
          if ((topicMessage.sequenceNumber as Long).toNumber() === Number(sequenceNumber)) {
            resolve(topicMessage);
          }
        }
      );
    });

    return {
      sequenceNumber: (message.sequenceNumber as Long).toNumber(),
      contents: message.contents,
      consensusTimestamp: message.consensusTimestamp
    };
  }

  /*
   * "createFile" creates a file in the Hedera file service. Files can be left empty at first.
   * This is done to not run into a TRANSACTION_OVERSIZE error upon file creation.
   * To add data to an empty file, you need to use the "appendToFile" method below.
   */
  public async createFile(contents?: string): Promise<IHederaTransactionResponse> {
    const transaction: Transaction = await new FileCreateTransaction({
      contents: contents,
      keys: [this.hederaWallet.getAccountKey()]
    }).freezeWithSigner(this.hederaWallet);

    await this.signWithSigner(transaction, this.hederaWallet);

    return await this.executeWithSigner(transaction, this.hederaWallet);
  }

  public async updateFile(fileId: string, contents?: string): Promise<IHederaTransactionResponse> {
    const transaction: Transaction = await new FileUpdateTransaction({
      fileId: fileId,
      contents: contents,
      keys: [this.hederaWallet.getAccountKey()]
    }).freezeWithSigner(this.hederaWallet);

    await this.signWithSigner(transaction, this.hederaWallet);

    return await this.executeWithSigner(transaction, this.hederaWallet);
  }

  public async deleteFile(fileId: string): Promise<IHederaTransactionResponse> {
    const transaction: Transaction = await new FileDeleteTransaction({
      fileId: fileId
    }).freezeWithSigner(this.hederaWallet);

    await this.signWithSigner(transaction, this.hederaWallet);

    return await this.executeWithSigner(transaction, this.hederaWallet);
  }

  // "appendToFile" adds contents to a file given its file id.
  public async appendToFile(fileId: string, contents: string): Promise<IHederaTransactionResponse> {
    const transaction: Transaction = await new FileAppendTransaction({
      fileId: fileId,
      contents: contents
    }).setMaxTransactionFee(new Hbar(5))
      .freezeWithSigner(this.hederaWallet);

    await this.signWithSigner(transaction, this.hederaWallet);

    return await this.executeWithSigner(transaction, this.hederaWallet);
  }

  public async getFileContents(fileId: string, fileEncoding?: string): Promise<string> {
    try {
      const query = new FileContentsQuery({
        fileId: fileId
      });

      const fileContentsUint8Array: Uint8Array = await query.executeWithSigner(this.hederaWallet);
      let fileContentsString: string = fileContentsUint8Array.toString();

      if (fileEncoding && fileEncoding === 'base64') {
        fileContentsString = Buffer.from(fileContentsString, 'base64').toString();
      }

      return fileContentsString;
    } catch (error: unknown) {
      console.log(error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async signWithSigner(transaction: Readonly<Transaction>, signer: Readonly<Wallet>): Promise<void> {
    await transaction.signWithSigner(signer);
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async executeWithSigner(transaction: Readonly<Transaction>, signer: Readonly<Wallet>): Promise<IHederaTransactionResponse> {
    const response = await transaction.executeWithSigner(signer);
    const receipt = await response.getReceiptWithSigner(signer);
    const record = await response.getRecordWithSigner(signer);

    return {
      response: response,
      receipt: receipt,
      record: record
    };
  }
}
