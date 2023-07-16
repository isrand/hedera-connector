import {PrivateKey, Timestamp} from '@hashgraph/sdk';
import {Injectable, Logger} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {IHederaTransactionResponse} from '../../../hedera/responses/interfaces/IHederaTransactionResponse';
import {CreateEncryptedTopicDTO} from './dtos/CreateEncryptedTopicDTO';
import {ITopicConfiguration} from './interfaces/ITopicConfiguration';
import {IEncryptedTopicConfiguration} from './interfaces/IEncryptedTopicConfiguration';
import {IHederaNetworkResponse} from '../../../hedera/responses/interfaces/IHederaNetworkResponse';
import {HederaTransactionResponse} from '../../../hedera/responses/HederaTransactionResponse';
import {IGetMessageFromTopicResponse} from '../topic/responses/IGetMessageFromTopicResponse';
import {EncryptedTopicManager} from './support/EncryptedTopicManager';
import {ITopicParticipant} from './interfaces/ITopicParticipant';
import {IEncryptedTopicMessage} from './interfaces/IEncryptedTopicMessage';
import {Wallet} from '../../../wallet/Wallet';
import {Crypto} from '../../../crypto/Crypto';
import {ITopicMessage} from '../topic/interfaces/ITopicMessage';
import {Configuration} from '../../../configuration/Configuration';

@Injectable()
export class EncryptedTopicService {
  private readonly logger: Logger = new Logger(EncryptedTopicService.name);

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
      ).sendMessageToTopic(
        createTopicResponse.receipt.topicId.toString(),
        Buffer.from(JSON.stringify(encryptedConfigurationMessage)).toString('base64'),
        submitKey
      );

      this.logger.log(`Created new encrypted topic. Topic ID: ${JSON.stringify(createTopicResponse.receipt.topicId.toString())}`);

      await EncryptedTopicManager.addTopic(createTopicResponse.receipt.topicId.toString(), topicConfigurationMessage);
    }

    return new HederaTransactionResponse(createTopicResponse).parse();
  }

  public async getAllEncryptedTopicConfigurations(): Promise<Array<ITopicConfiguration>> {
    return Promise.resolve(EncryptedTopicManager.getAllTopicConfigurations());
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToEncryptedTopic(topicId: string, message: string | Uint8Array, accountId?: string): Promise<unknown> {
    this.logger.log(`Sending message '${message}' to encrypted, private topic ID ${topicId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    /*
     * First, check if we have cached the topic configuration
     * If it's not cached, do cache it
     */
    if (!EncryptedTopicManager.hasTopic(topicId)) {
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
      await EncryptedTopicManager.addTopic(topicId, decryptedTopicConfigurationMessage);
    }

    const topicConfiguration = EncryptedTopicManager.getTopicConfiguration(topicId);

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

    this.logger.log(`Sent message to encrypted topic. Topic ID: ${topicId}`);

    return new HederaTransactionResponse(sendMessageToTopicResponse).parse();
  }

  public async getEncryptedTopicParticipants(topicId: string, accountId?: string): Promise<unknown> {
    if (EncryptedTopicManager.hasTopic(topicId)) {
      return EncryptedTopicManager.getTopicConfiguration(topicId).participants;
    } else {
      const encryptedTopicConfiguration = await this.getEncryptedTopicConfiguration(topicId, accountId);

      return encryptedTopicConfiguration.participants;
    }
  }

  public async getMessageFromEncryptedTopic(topicId: string, sequenceNumber: number, accountId?: string): Promise<ITopicMessage | ITopicConfiguration> {
    let topicConfiguration: ITopicConfiguration;

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    if (EncryptedTopicManager.hasTopic(topicId)) {
      topicConfiguration = EncryptedTopicManager.getTopicConfiguration(topicId);
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

    await EncryptedTopicManager.addTopic(topicId, decryptedTopicConfigurationMessage);

    return decryptedTopicConfigurationMessage;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public handleEncryptedTopicMessage(encryptionSize: number, contents: Uint8Array | string, consensusTimeStamp: Timestamp, sequenceNumber: number, privateKey: string): ITopicMessage | ITopicConfiguration {
    const encryptedMessage = Buffer.from(Buffer.from(contents).toString(), 'base64').toString();

    return new Crypto(encryptionSize).adapter.decryptTopicMessage(JSON.parse(encryptedMessage) as IEncryptedTopicMessage, consensusTimeStamp, sequenceNumber, privateKey);
  }
}
