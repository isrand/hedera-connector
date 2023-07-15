import {PrivateKey, Timestamp, TopicInfo} from '@hashgraph/sdk';
import {Injectable, Logger} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {IHederaTransactionResponse} from '../../../hedera/responses/interfaces/IHederaTransactionResponse';
import {CreateEncryptedTopicDTO} from '../encryptedtopic/dtos/CreateEncryptedTopicDTO';
import {ITopicConfiguration} from '../encryptedtopic/interfaces/ITopicConfiguration';
import {IEncryptedTopicConfiguration} from '../encryptedtopic/interfaces/IEncryptedTopicConfiguration';
import {IHederaNetworkResponse} from '../../../hedera/responses/interfaces/IHederaNetworkResponse';
import {HederaTransactionResponse} from '../../../hedera/responses/HederaTransactionResponse';
import {IGetMessageFromTopicResponse} from './responses/IGetMessageFromTopicResponse';
import {TopicManager} from '../encryptedtopic/support/TopicManager';
import {ITopicParticipant} from '../encryptedtopic/interfaces/ITopicParticipant';
import {IEncryptedTopicMessage} from '../encryptedtopic/interfaces/IEncryptedTopicMessage';
import {Wallet} from '../../../wallet/Wallet';
import {Crypto} from '../../../crypto/Crypto';
import {ITopicMessage} from './interfaces/ITopicMessage';
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
    this.logger.log(`Sending message '${message}' to public topic ID ${topicId.replace('0.0.', '')}`);

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

  /*
   *
   *Encrypted topics
   *
   */

  // eslint-disable-next-line  @typescript-eslint/prefer-readonly-parameter-types
  public async createEncryptedTopic(createEncryptedTopicDTO: CreateEncryptedTopicDTO, accountId?: string): Promise<IHederaNetworkResponse> {
    const submitKey = PrivateKey.generateED25519().toStringRaw();

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    /*
     * Construct topic configuration message
     * (Akin to a channel configuration block in Hyperledger Fabric)
     * Add node account to the topic participants, together with kyber public key
     */
    const topicConfigurationMessage: ITopicConfiguration = {
      encryptionSize: createEncryptedTopicDTO.encryptionSize,
      topicName: createEncryptedTopicDTO.topicName,
      participants: [
        ...createEncryptedTopicDTO.participants as Array<ITopicParticipant>,
        {
          hederaPublicKey: account.getHederaPublicKey(),
          kyberPublicKey: account.getKyberKeyPair(createEncryptedTopicDTO.encryptionSize).publicKey
        }
      ],
      submitKey: submitKey
    };

    // Remove doubles from the participants array...
    topicConfigurationMessage.participants = topicConfigurationMessage.participants.filter((value: Readonly<ITopicParticipant>, index, self: ReadonlyArray<Readonly<ITopicParticipant>>) => index === self.findIndex((topicParticipant: Readonly<ITopicParticipant>) => topicParticipant.hederaPublicKey === value.hederaPublicKey && topicParticipant.kyberPublicKey === value.kyberPublicKey));

    // Remove empty or incorrect entries from the participants array...
    topicConfigurationMessage.participants = topicConfigurationMessage.participants.filter((value: Readonly<ITopicParticipant>) => !(!value.kyberPublicKey || value.kyberPublicKey === '') && !(!value.hederaPublicKey || value.hederaPublicKey === ''));

    this.logger.log(`Creating new encrypted topic with configuration: ${JSON.stringify(topicConfigurationMessage)}`);

    // Construct final encrypted configuration message
    const encryptedConfigurationMessage: IEncryptedTopicConfiguration = new Crypto(createEncryptedTopicDTO.encryptionSize).adapter.encryptTopicConfiguration(topicConfigurationMessage.participants, JSON.stringify(topicConfigurationMessage), submitKey);

    // Create the topic
    const createTopicResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).createTopic(
      account.getHederaPrivateKey(),
      account.getHederaAccountId(),
      submitKey
    );

    // Send message in encrypted topic

    if (createTopicResponse.receipt.topicId) {
      await new HederaStub(
        account
      )
        .sendMessageToTopic(
          createTopicResponse.receipt.topicId.toString(),
          Buffer.from(JSON.stringify(encryptedConfigurationMessage)).toString('base64'),
          submitKey
        );

      this.logger.log(`Created new encrypted topic. Topic ID: ${JSON.stringify(createTopicResponse.receipt.topicId.toString().replace('0.0.', ''))}`);

      TopicManager.addTopic(createTopicResponse.receipt.topicId.toString().replace('0.0.', ''), topicConfigurationMessage);
    }

    return new HederaTransactionResponse(createTopicResponse).parse();
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToEncryptedTopic(topicId: string, message: string | Uint8Array, accountId?: string): Promise<unknown> {
    this.logger.log(`Sending message '${message}' to encrypted, private topic ID ${topicId.replace('0.0.', '')}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    /*
     * First, check if we have cached the topic configuration
     * If it's not cached, do cache it
     */
    if (!TopicManager.hasTopic(topicId)) {
      // Get topic configuration message
      const firstTopicMessage: IGetMessageFromTopicResponse = await new HederaStub(
        account
      ).getMessageFromTopic(topicId, 1);

      const base64EncodedEncryptedTopicConfigurationMessage: string = Buffer.from(firstTopicMessage.contents.buffer).toString('base64');

      const plaintextEncryptedTopicConfigurationMessage = Buffer.from(base64EncodedEncryptedTopicConfigurationMessage, 'base64').toString('utf8');

      const encryptedTopicConfigurationMessage: IEncryptedTopicConfiguration = JSON.parse(Buffer.from(plaintextEncryptedTopicConfigurationMessage, 'base64').toString('utf8')) as IEncryptedTopicConfiguration;

      // Decrypt topic configuration message with my private key
      const decryptedTopicConfigurationMessage: ITopicConfiguration = new Crypto(encryptedTopicConfigurationMessage.s).adapter.decryptTopicConfigurationMessage(encryptedTopicConfigurationMessage, account.getKyberKeyPair(encryptedTopicConfigurationMessage.s).privateKey);

      // Cache in the TopicManager
      TopicManager.addTopic(topicId, decryptedTopicConfigurationMessage);
    }

    const topicConfiguration = TopicManager.getTopicConfiguration(topicId);

    // Create message object
    const messageObject = {
      from: account.getHederaPublicKey(),
      payload: message
    };

    // Add Node account to message recipients
    let messageRecipients: Array<ITopicParticipant> = [
      {
        hederaPublicKey: account.getHederaPublicKey(),
        kyberPublicKey: account.getKyberKeyPair(topicConfiguration.encryptionSize).publicKey
      },
      ...topicConfiguration.participants
    ];

    // Remove duplicate recipients from messageRecipients object
    messageRecipients = messageRecipients.filter((value: Readonly<ITopicParticipant>, index, self: ReadonlyArray<Readonly<ITopicParticipant>>) => index === self.findIndex((topicParticipant) => topicParticipant.hederaPublicKey === value.hederaPublicKey && topicParticipant.kyberPublicKey === value.kyberPublicKey));

    this.logger.debug(`Encrypting message with keys for recipients ${JSON.stringify(messageRecipients)}`);

    // Encrypt message object
    const encryptedMessage: IEncryptedTopicMessage = new Crypto(topicConfiguration.encryptionSize).adapter.encryptMessage(messageRecipients, JSON.stringify(messageObject));

    const base64EncodedEncryptedMessage: string = Buffer.from(JSON.stringify(encryptedMessage)).toString('base64');

    if (!topicConfiguration.submitKey) {
      throw new Error('Topic Configuration Message has no submit key.');
    }

    // Send message to topic
    const sendMessageToTopicResponse = await new HederaStub(
      account
    ).sendMessageToTopic(
      topicId.toString(),
      base64EncodedEncryptedMessage,
      Buffer.from(topicConfiguration.submitKey).toString()
    );

    this.logger.log(`Sent message to encrypted topic. Topic ID: ${topicId.replace('0.0.', '')}`);

    return new HederaTransactionResponse(sendMessageToTopicResponse).parse();
  }

  public async getEncryptedTopicParticipants(topicId: string, accountId?: string): Promise<unknown> {
    const encryptedTopicConfigurationMessage: ITopicConfiguration = await this.getEncryptedTopicConfiguration(topicId, accountId);

    return encryptedTopicConfigurationMessage.participants;
  }

  public async getMessageFromEncryptedTopic(topicId: string, sequenceNumber: number, accountId?: string): Promise<ITopicMessage | ITopicConfiguration> {
    let topicConfiguration: ITopicConfiguration;

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    if (TopicManager.hasTopic(topicId)) {
      topicConfiguration = TopicManager.getTopicConfiguration(topicId);
    } else {
      topicConfiguration = await this.getEncryptedTopicConfiguration(topicId, accountId);
    }

    if (sequenceNumber === 1) {
      return topicConfiguration;
    }

    const getMessageFromTopicResponse: IGetMessageFromTopicResponse = await new HederaStub(
      account
    ).getMessageFromTopic(topicId, sequenceNumber);

    return this.handleEncryptedTopicMessage(topicConfiguration.encryptionSize, getMessageFromTopicResponse.contents, getMessageFromTopicResponse.consensusTimestamp, getMessageFromTopicResponse.sequenceNumber, account.getKyberKeyPair(topicConfiguration.encryptionSize).privateKey);
  }

  public async getEncryptedTopicConfiguration(topicId: string, accountId?: string): Promise<ITopicConfiguration> {
    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    const firstTopicMessage: IGetMessageFromTopicResponse = await new HederaStub(
      account
    ).getMessageFromTopic(topicId, 1);

    const base64EncodedEncryptedTopicConfigurationMessage: string = Buffer.from(firstTopicMessage.contents.buffer).toString('base64');

    const plaintextEncryptedTopicConfigurationMessage = Buffer.from(base64EncodedEncryptedTopicConfigurationMessage, 'base64').toString('utf8');

    const encryptedTopicConfigurationMessage: IEncryptedTopicConfiguration = JSON.parse(Buffer.from(plaintextEncryptedTopicConfigurationMessage, 'base64').toString('utf8')) as IEncryptedTopicConfiguration;
    // Decrypt topic configuration message with my private key
    const decryptedTopicConfigurationMessage: ITopicConfiguration = new Crypto(encryptedTopicConfigurationMessage.s).adapter.decryptTopicConfigurationMessage(encryptedTopicConfigurationMessage, account.getKyberKeyPair(encryptedTopicConfigurationMessage.s).privateKey);

    TopicManager.addTopic(topicId, decryptedTopicConfigurationMessage);

    return decryptedTopicConfigurationMessage;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public handleEncryptedTopicMessage(encryptionSize: number, contents: Uint8Array | string, consensusTimeStamp: Timestamp, sequenceNumber: number, privateKey: string): ITopicMessage | ITopicConfiguration {
    const encryptedMessage = Buffer.from(Buffer.from(contents).toString(), 'base64').toString();

    return new Crypto(encryptionSize).adapter.decryptTopicMessage(JSON.parse(encryptedMessage) as IEncryptedTopicMessage, consensusTimeStamp, sequenceNumber, privateKey);
  }
}
