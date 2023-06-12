import {ITopicParticipant} from './ITopicParticipant';

export interface ITopicConfiguration {
  topicName: string;
  participants: Array<ITopicParticipant>;
  submitKey?: string;
}
