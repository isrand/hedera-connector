import {IAccessListParticipant} from '../../../../common/interfaces/IAccessListParticipant';

export interface ITopicConfiguration {
  encryptionSize: number;
  topicName: string;
  participants: Array<IAccessListParticipant>;
  submitKey?: string;
  topicId?: string;
}
