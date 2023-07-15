import {IHederaTransactionResponse} from '../../responses/interfaces/IHederaTransactionResponse';
import {IGetMessageFromTopicResponse} from '../../../api/modules/topic/responses/IGetMessageFromTopicResponse';
import {Client, TopicInfo} from '@hashgraph/sdk';
import {IHederaCreateAccountResponse} from '../../responses/interfaces/IHederaCreateAccountResponse';

/*
 * The IHederaStub interface defines a HederaStub object that can be used to interact
 * with the Hedera network, or implemented by a mock class to facilitate unit testing.
 */
export interface IHederaStub {
  client: Client;

  // Account
  createAccount: (initialBalance: number) => Promise<IHederaCreateAccountResponse>;

  // Topic
  createTopic: (adminKey: string, renewAccountId: string, submitKey?: string) => Promise<IHederaTransactionResponse>;
  getTopicInformation: (topicId: string) => Promise<TopicInfo>;
  deleteTopic: (topicId: string) => Promise<IHederaTransactionResponse>;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sendMessageToTopic: (topicId: string, message: string | Uint8Array, submitKey?: string) => Promise<IHederaTransactionResponse>;
  getMessageFromTopic: (topicId: string, sequenceNumber: number) => Promise<IGetMessageFromTopicResponse>;

  // File
  createFile: (contents?: string) => Promise<IHederaTransactionResponse>;
  updateFile: (fileId: string, contents?: string) => Promise<IHederaTransactionResponse>;
  deleteFile: (fileId: string) => Promise<IHederaTransactionResponse>;
  appendToFile: (fileId: string, contents: string) => Promise<IHederaTransactionResponse>;
  getFileContents: (fileId: string, fileEncoding?: string) => Promise<string>;
}
