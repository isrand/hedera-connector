/* eslint-disable */

import {ITopicParticipant} from '../../api/modules/encryptedtopic/interfaces/ITopicParticipant';
import {IEncryptedTopicMessage} from '../../api/modules/encryptedtopic/interfaces/IEncryptedTopicMessage';
import {IEncryptedTopicConfiguration} from '../../api/modules/encryptedtopic/interfaces/IEncryptedTopicConfiguration';
import {ITopicConfiguration} from '../../api/modules/encryptedtopic/interfaces/ITopicConfiguration';
import {Timestamp} from '@hashgraph/sdk';
import {ITopicMessage} from '../../api/modules/topic/interfaces/ITopicMessage';
import { KyberKeyPair } from "../adapters/kyber/support/KyberKeyPair";

export interface ICryptoAdapter {
  generateKeyPair: () => KyberKeyPair;
  encryptMessage: (participants: ReadonlyArray<Readonly<ITopicParticipant>>, dataToEncrypt: string) => Readonly<IEncryptedTopicMessage>;
  encryptTopicConfiguration: (participants: ReadonlyArray<Readonly<ITopicParticipant>>, dataToEncrypt: string, submitKey: string) => Readonly<IEncryptedTopicConfiguration>;
  decryptTopicConfigurationMessage: (encryptedTopicConfigurationMessage: Readonly<IEncryptedTopicConfiguration>, privateKey: string) => Readonly<ITopicConfiguration>;
  decryptTopicMessage: (encryptedTopicMessage: Readonly<IEncryptedTopicMessage>, consensusTimeStamp: Readonly<Timestamp>, sequenceNumber: number, privateKey: string) => Readonly<ITopicMessage>;
}
