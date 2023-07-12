/* eslint-disable */

import {ITopicParticipant} from '../../../api/modules/topic/interfaces/ITopicParticipant';
import {IEncryptedTopicMessage} from '../../../api/modules/topic/interfaces/IEncryptedTopicMessage';
import {IEncryptedTopicConfiguration} from '../../../api/modules/topic/interfaces/IEncryptedTopicConfiguration';
import {ITopicConfiguration} from '../../../api/modules/topic/interfaces/ITopicConfiguration';
import {Timestamp} from '@hashgraph/sdk';
import {ITopicMessage} from '../../../api/modules/topic/interfaces/ITopicMessage';

export interface ICryptoAdapter {
  generateKeyPair: () => any;
  encryptMessage: (participants: ReadonlyArray<Readonly<ITopicParticipant>>, dataToEncrypt: string) => Readonly<IEncryptedTopicMessage>;
  encryptTopicConfiguraton: (participants: ReadonlyArray<Readonly<ITopicParticipant>>, dataToEncrypt: string, submitKey: string) => Readonly<IEncryptedTopicConfiguration>;
  decryptTopicConfigurationMessage: (encryptedTopicConfigurationMessage: Readonly<IEncryptedTopicConfiguration>) => Readonly<ITopicConfiguration>;
  decryptTopicMessage: (encryptedTopicMessage: Readonly<IEncryptedTopicMessage>, consensusTimeStamp: Readonly<Timestamp>, sequenceNumber: number) => Readonly<ITopicMessage>;
}
