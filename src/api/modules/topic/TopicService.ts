import {PrivateKey, Timestamp, TopicInfo} from '@hashgraph/sdk';
import {Injectable, Logger} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {IHederaTransactionResponse} from '../../../hedera/responses/interfaces/IHederaTransactionResponse';
import {CreateEncryptedTopicDTO} from './dtos/CreateEncryptedTopicDTO';
import {ITopicConfiguration} from './interfaces/ITopicConfiguration';
import {IEncryptedTopicConfiguration} from './interfaces/IEncryptedTopicConfiguration';
import {IHederaConnectorResponse} from '../../responses/IHederaConnectorResponse';
import {HederaTransactionResponse} from '../../../hedera/responses/HederaTransactionResponse';
import {IGetMessageFromTopicResponse} from './responses/IGetMessageFromTopicResponse';
import {TopicManager} from './support/TopicManager';
import {ITopicParticipant} from './interfaces/ITopicParticipant';
import {IEncryptedTopicMessage} from './interfaces/IEncryptedTopicMessage';
import {HederaClient} from '../../../hedera/client/HederaClient';
import {Wallet} from '../../../wallet/Wallet';
import {Configuration} from '../../../configuration/Configuration';
import {Crypto} from '../../../crypto/Crypto';

@Injectable()
export class TopicService {
  private readonly logger: Logger = new Logger(TopicService.name);
  private readonly hederaStub: HederaStub;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor() {
    this.hederaStub = new HederaStub(new HederaClient(Wallet.wallet));
  }

  /*
   *
   *Public topics
   *
   */

  public async createPublicTopic(): Promise<IHederaConnectorResponse> {
    this.logger.log('Creating new public topic');

    const createPublicTopicResponse: IHederaTransactionResponse = await this.hederaStub.createTopic(
      this.hederaStub.getClient().hederaPrivateKey,
      this.hederaStub.getClient().hederaAccountId
    );

    if (createPublicTopicResponse.receipt.topicId) {
      this.logger.log(`Created new public topic. Topic ID: ${createPublicTopicResponse.receipt.topicId.toString()}`);
    }

    return new HederaTransactionResponse(createPublicTopicResponse).parse();
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToPublicTopic(topicId: string, message: string | Uint8Array): Promise<IHederaConnectorResponse> {
    this.logger.log(`Sending message '${message}' to public topic ID ${topicId.replace('0.0.', '')}`);

    const sendMessageToPublicTopicResponse: IHederaTransactionResponse = await this.hederaStub.sendMessageToTopic(
      topicId,
      message
    );

    this.logger.log('Sent message to public topic');

    return new HederaTransactionResponse(sendMessageToPublicTopicResponse).parse();
  }

  public async getMessageFromPublicTopic(topicId: string, sequenceNumber: number): Promise<IGetMessageFromTopicResponse> {
    return await this.hederaStub.getMessageFromTopic(topicId, sequenceNumber);
  }

  public async deleteTopic(topicId: string): Promise<IHederaConnectorResponse> {
    this.logger.log(`Deleting topic ${topicId}`);

    const deleteTopicResponse: IHederaTransactionResponse = await this.hederaStub.deleteTopic(topicId);

    this.logger.log(`Deleted topic ${topicId}`);

    return new HederaTransactionResponse(deleteTopicResponse).parse();
  }

  public async getTopicInformation(topicId: string): Promise<TopicInfo> {
    this.logger.log(`Getting information for topic ${topicId}`);

    return await this.hederaStub.getTopicInformation(topicId);
  }

  /*
   *
   *Encrypted topics
   *
   */

  // eslint-disable-next-line  @typescript-eslint/prefer-readonly-parameter-types
  public async createEncryptedTopic(createEncryptedTopicDTO: CreateEncryptedTopicDTO): Promise<IHederaConnectorResponse> {
    const submitKey = PrivateKey.generateED25519().toStringRaw();

    /*
     * Construct topic configuration message
     * (Akin to a channel configuration block in Hyperledger Fabric)
     * Add node account to the topic participants, together with kyber public key
     */
    const topicConfigurationMessage: ITopicConfiguration = {
      topicName: createEncryptedTopicDTO.topicName,
      participants: [
        ...createEncryptedTopicDTO.participants as Array<ITopicParticipant>, {
          hederaPublicKey: Configuration.hederaPublicKey,
          kyberPublicKey: Configuration.kyberPublicKey
        }
      ],
      submitKey: submitKey
    };

    // Remove doubles from the participants array...
    topicConfigurationMessage.participants = topicConfigurationMessage.participants.filter((value: Readonly<ITopicParticipant>, index, self: ReadonlyArray<Readonly<ITopicParticipant>>) => index === self.findIndex((topicParticipant: Readonly<ITopicParticipant>) => topicParticipant.hederaPublicKey === value.hederaPublicKey && topicParticipant.kyberPublicKey === value.kyberPublicKey));

    this.logger.log(`Creating new encrypted topic with configuration: ${JSON.stringify(topicConfigurationMessage)}`);

    // Construct final encrypted configuration message
    const encryptedConfigurationMessage: IEncryptedTopicConfiguration = Crypto.adapter.encryptTopicConfiguraton(topicConfigurationMessage.participants, JSON.stringify(topicConfigurationMessage), submitKey);

    // Create the topic
    const createTopicResponse: IHederaTransactionResponse = await this.hederaStub.createTopic(
      Configuration.hederaPrivateKey,
      Configuration.hederaAccountId,
      submitKey
    );

    // Send message in encrypted topic

    if (createTopicResponse.receipt.topicId) {
      await this.hederaStub.sendMessageToTopic(
        createTopicResponse.receipt.topicId.toString(),
        Buffer.from(JSON.stringify(encryptedConfigurationMessage)).toString('base64'),
        submitKey
      );

      this.logger.log(`Created new encrypted topic. Topic ID: ${JSON.stringify(createTopicResponse.receipt.topicId.toString().replace('0.0.', ''))}`);

      // TopicManager.addTopic(createTopicResponse.receipt.topicId.toString().replace('0.0.', ''), topicConfigurationMessage);
    }

    return new HederaTransactionResponse(createTopicResponse).parse();
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToEncryptedTopic(topicId: string, message: string | Uint8Array, recipients?: Array<string>): Promise<unknown> {
    this.logger.log(`Sending message '${message}' to encrypted, private topic ID ${topicId.replace('0.0.', '')}`);

    /*
     * First, check if we have cached the topic configuration
     * If it's not cached, do cache it
     */
    if (!TopicManager.hasTopic(topicId)) {
      // Get topic configuration message
      const firstTopicMessage: IGetMessageFromTopicResponse = await this.hederaStub.getMessageFromTopic(topicId, 1);

      const base64EncodedEncryptedTopicConfigurationMessage: string = Buffer.from(firstTopicMessage.contents.buffer).toString('base64');

      const plaintextEncryptedTopicConfigurationMessage = Buffer.from(base64EncodedEncryptedTopicConfigurationMessage, 'base64').toString('utf8');

      const encryptedTopicConfigurationMessage: IEncryptedTopicConfiguration = JSON.parse(Buffer.from(plaintextEncryptedTopicConfigurationMessage, 'base64').toString('utf8')) as IEncryptedTopicConfiguration;

      // Decrypt topic configuration message with my private key
      const decryptedTopicConfigurationMessage: ITopicConfiguration = Crypto.adapter.decryptTopicConfigurationMessage(encryptedTopicConfigurationMessage);

      // Cache in the TopicManager
      TopicManager.addTopic(topicId, decryptedTopicConfigurationMessage);
    }

    const topicConfiguration = TopicManager.getTopicConfiguration(topicId);

    // Create message object
    const messageObject = {
      from: Configuration.hederaPublicKey,
      payload: message
    };

    let messageRecipients: Array<ITopicParticipant> = [
      {
        hederaPublicKey: Configuration.hederaPublicKey,
        kyberPublicKey: Configuration.kyberPublicKey
      }
    ];

    if (recipients) {
      for (const recipientPublicKey of recipients) {
        const recipientInParticipants = topicConfiguration.participants.find((participant: Readonly<ITopicParticipant>) => {
          return participant.hederaPublicKey === recipientPublicKey;
        });

        if (recipientInParticipants) {
          messageRecipients.push(recipientInParticipants);
        }
      }
    } else {
      messageRecipients = topicConfiguration.participants;
    }

    // Remove duplicate recipients from messageRecipients object
    messageRecipients = messageRecipients.filter((value: Readonly<ITopicParticipant>, index, self: ReadonlyArray<Readonly<ITopicParticipant>>) => index === self.findIndex((topicParticipant) => topicParticipant.hederaPublicKey === value.hederaPublicKey && topicParticipant.kyberPublicKey === value.kyberPublicKey));

    this.logger.debug(`Encrypting message with keys for recipients ${JSON.stringify(messageRecipients)}`);

    // Encrypt message object
    const encryptedMessage: IEncryptedTopicMessage = Crypto.adapter.encryptMessage(messageRecipients, JSON.stringify(messageObject));

    const base64EncodedEncryptedMessage: string = Buffer.from(JSON.stringify(encryptedMessage)).toString('base64');

    if (!topicConfiguration.submitKey) {
      throw new Error('Topic Configuration Message has no submit key.');
    }

    // Send message to topic
    const sendMessageToTopicResponse = await this.hederaStub.sendMessageToTopic(
      topicId.toString(),
      base64EncodedEncryptedMessage,
      Buffer.from(topicConfiguration.submitKey).toString()
    );

    this.logger.log(`Sent message to encrypted topic. Topic ID: ${topicId.replace('0.0.', '')}`);

    return new HederaTransactionResponse(sendMessageToTopicResponse).parse();
  }

  public async getEncryptedTopicParticipants(topicId: string): Promise<unknown> {
    const encryptedTopicConfigurationMessage: ITopicConfiguration = await this.getMessageFromEncryptedTopic(topicId, 1) as ITopicConfiguration;

    return encryptedTopicConfigurationMessage.participants;
  }

  public async getMessageFromEncryptedTopic(topicId: string, sequenceNumber: number): Promise<string | unknown> {
    if (TopicManager.hasTopic(topicId)) {
      return TopicManager.getTopicConfiguration(topicId);
    }

    // Topic configuration message
    if (sequenceNumber === 1) {
      const firstTopicMessage: IGetMessageFromTopicResponse = await this.hederaStub.getMessageFromTopic(topicId, 1);

      const base64EncodedEncryptedTopicConfigurationMessage: string = Buffer.from(firstTopicMessage.contents.buffer).toString('base64');

      const plaintextEncryptedTopicConfigurationMessage = Buffer.from(base64EncodedEncryptedTopicConfigurationMessage, 'base64').toString('utf8');

      const encryptedTopicConfigurationMessage: IEncryptedTopicConfiguration = JSON.parse(Buffer.from(plaintextEncryptedTopicConfigurationMessage, 'base64').toString('utf8')) as IEncryptedTopicConfiguration;

      // Decrypt topic configuration message with my private key
      return Crypto.adapter.decryptTopicConfigurationMessage(encryptedTopicConfigurationMessage);
    }

    const getMessageFromTopicResponse: IGetMessageFromTopicResponse = await this.hederaStub.getMessageFromTopic(topicId, sequenceNumber);

    return this.handleEncryptedTopicMessage(getMessageFromTopicResponse.contents, getMessageFromTopicResponse.consensusTimestamp, getMessageFromTopicResponse.sequenceNumber);
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public handleEncryptedTopicMessage(contents: Uint8Array | string, consensusTimeStamp: Timestamp, sequenceNumber: number): string | unknown {
    const encryptedMessage = Buffer.from(Buffer.from(contents).toString(), 'base64').toString();

    return Crypto.adapter.decryptTopicMessage(JSON.parse(encryptedMessage) as IEncryptedTopicMessage, consensusTimeStamp, sequenceNumber);
  }
}
