import {ITopicParticipant} from './ITopicParticipant';

export interface ITopicConfiguration {
  encryptionSize: number;
  topicName: string;
  participants: Array<ITopicParticipant>;
  submitKey?: string;
}
