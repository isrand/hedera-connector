/* eslint-disable */
// ESLint will complain a lot in this file because of Kyber.
import {ITopicConfiguration} from '../../api/modules/topic/interfaces/ITopicConfiguration';
import {IEncryptedTopicMessage} from '../../api/modules/topic/interfaces/IEncryptedTopicMessage';
import {ITopicMessage} from '../../api/modules/topic/interfaces/ITopicMessage';
import {ICryptoAdapter} from './interfaces/ICryptoAdapter';
import {ITopicParticipant} from '../../api/modules/topic/interfaces/ITopicParticipant';
import {IEncryptedTopicConfiguration} from '../../api/modules/topic/interfaces/IEncryptedTopicConfiguration';
import * as crypto from 'crypto';
import {Timestamp} from '@hashgraph/sdk';
import { Wallet } from "../../wallet/Wallet";

const kyber = require('crystals-kyber');

export class Kyber implements ICryptoAdapter {
  public constructor(private readonly keySize: number) {
  }

  public generateKeyPair() {
    switch (this.keySize) {
      case 512:
        return kyber.KeyGen512();
      case 768:
        return kyber.KeyGen768();
      case 1024:
        return kyber.KeyGen1024();
    }
  }

  public encryptMessage(participants: ReadonlyArray<Readonly<ITopicParticipant>>, dataToEncrypt: string): Readonly<IEncryptedTopicMessage> {
    const finalObject: IEncryptedTopicMessage = {
      // eslint-disable-next-line id-length
      a: [],
      // eslint-disable-next-line id-length
      b: [],
      // eslint-disable-next-line id-length
      c: []
    };

    for (const participant of participants) {
      let iv: Buffer = Buffer.from([]);
      let c_key: Array<Array<number>> = [[]];
      const kyberPublicKey = Buffer.from(participant.kyberPublicKey, 'base64');
      switch (this.keySize) {
        case 512:
          iv = Buffer.from(kyber.Encrypt512(kyberPublicKey)[0].slice(0, 16));
          c_key = kyber.Encrypt512(kyberPublicKey);
          break;
        case 768:
          iv = Buffer.from(kyber.Encrypt768(kyberPublicKey)[0].slice(0, 16));
          c_key = kyber.Encrypt768(kyberPublicKey);
          break;
        case 1024:
          iv = Buffer.from(kyber.Encrypt1024(kyberPublicKey)[0].slice(0, 16));
          c_key = kyber.Encrypt1024(kyberPublicKey);
          break;
      }
      const c: Array<number> | undefined = c_key[0];
      const key: Array<number> | undefined = c_key[1];

      if (!c || !key) {
        throw new Error('Error encrypting using kyber public key');
      }

      const cipher = crypto.createCipheriv('AES256', Buffer.from(key), Buffer.from(iv));
      let encrypted = cipher.update(dataToEncrypt, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      finalObject.a.push(encrypted);
      finalObject.b.push(Buffer.from(c).toString('base64'));
      finalObject.c.push(Buffer.from(iv).toString('base64'));
    }

    return finalObject;
  }

  public encryptTopicConfiguraton(participants: ReadonlyArray<Readonly<ITopicParticipant>>, dataToEncrypt: string, submitKey: string): Readonly<IEncryptedTopicConfiguration> {
    const finalObject: IEncryptedTopicConfiguration = {
      // eslint-disable-next-line id-length
      a: [],
      // eslint-disable-next-line id-length
      b: [],
      // eslint-disable-next-line id-length
      c: [],
      // eslint-disable-next-line id-length
      d: [],

      s: this.keySize
    };

    for (const participant of participants) {
      let iv: Buffer = Buffer.from([]);
      let c_key: Array<Array<number>> = [[]];
      const kyberPublicKey = Buffer.from(participant.kyberPublicKey, 'base64');
      switch (this.keySize) {
        case 512:
          iv = Buffer.from(kyber.Encrypt512(kyberPublicKey)[0].slice(0, 16));
          c_key = kyber.Encrypt512(kyberPublicKey);
          break;
        case 768:
          iv = Buffer.from(kyber.Encrypt768(kyberPublicKey)[0].slice(0, 16));
          c_key = kyber.Encrypt768(kyberPublicKey);
          break;
        case 1024:
          iv = Buffer.from(kyber.Encrypt1024(kyberPublicKey)[0].slice(0, 16));
          c_key = kyber.Encrypt1024(kyberPublicKey);
          break;
      }
      const c: Array<number> | undefined = c_key[0];
      const key: Array<number> | undefined = c_key[1];

      if (!c || !key) {
        throw new Error('Error encrypting using kyber public key');
      }

      const messageCipher = crypto.createCipheriv('AES256', Buffer.from(key), Buffer.from(iv));
      let encryptedMessage = messageCipher.update(dataToEncrypt, 'utf8', 'base64');
      encryptedMessage += messageCipher.final('base64');

      const submitKeyCipher = crypto.createCipheriv('AES256', Buffer.from(key), Buffer.from(iv));
      let encryptedSubmitKey = submitKeyCipher.update(submitKey, 'utf8', 'base64');
      encryptedSubmitKey += submitKeyCipher.final('base64');

      finalObject.a.push(encryptedMessage);
      finalObject.b.push(Buffer.from(c).toString('base64'));
      finalObject.c.push(Buffer.from(iv).toString('base64'));
      finalObject.d.push(encryptedSubmitKey);
    }

    return finalObject;
  }

  public decryptTopicConfigurationMessage(encryptedTopicConfigurationMessage: IEncryptedTopicConfiguration): ITopicConfiguration {
    let symmetricKey;
    let symmetricKeyIndex = -1;

    for (const encapsulatedSymmetricKey of encryptedTopicConfigurationMessage.b) {
      try {
        switch (this.keySize) {
          case 512:
            symmetricKey = kyber.Decrypt512(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(Wallet.getKyberKeyPair(this.keySize).privateKey, 'base64'));
            break;
          case 768:
            symmetricKey = kyber.Decrypt768(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(Wallet.getKyberKeyPair(this.keySize).privateKey, 'base64'));
            break;
          case 1024:
            symmetricKey = kyber.Decrypt1024(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(Wallet.getKyberKeyPair(this.keySize).privateKey, 'base64'));
            break;
        }
        symmetricKeyIndex = encryptedTopicConfigurationMessage.b.indexOf(encapsulatedSymmetricKey);
      } catch (error: unknown) {
      }
    }

    if (!symmetricKey || symmetricKeyIndex === -1) {
      throw new Error('Could not find encapsulated symmetric key in array.');
    }

    const initVector: Buffer = Buffer.from(String(encryptedTopicConfigurationMessage.c.at(symmetricKeyIndex)), 'base64');
    if (!initVector) {
      throw new Error('Could not find init vector in array.');
    }

    for (const encryptedPayload of encryptedTopicConfigurationMessage.a) {
      try {
        const decipher = crypto.createDecipheriv('AES256', symmetricKey, initVector);
        let decryptedPayload = decipher.update(encryptedPayload, 'base64', 'utf-8');
        decryptedPayload += decipher.final('utf8');

        return JSON.parse(decryptedPayload) as ITopicConfiguration;
      } catch (error: unknown) {
      }
    }

    throw new Error('Could not decrypt topic configuration message.');
  }

  public decryptTopicMessage(encryptedTopicMessage: IEncryptedTopicMessage, consensusTimeStamp: Timestamp, sequenceNumber: number): ITopicMessage {
    let symmetricKey;
    let symmetricKeyIndex = -1;

    for (const encapsulatedSymmetricKey of encryptedTopicMessage.b) {
      try {
        switch (this.keySize) {
          case 512:
            symmetricKey = kyber.Decrypt512(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(Wallet.getKyberKeyPair(this.keySize).privateKey, 'base64'));
            break;
          case 768:
            symmetricKey = kyber.Decrypt768(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(Wallet.getKyberKeyPair(this.keySize).privateKey, 'base64'));
            break;
          case 1024:
            symmetricKey = kyber.Decrypt1024(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(Wallet.getKyberKeyPair(this.keySize).privateKey, 'base64'));
            break;
        }
        symmetricKeyIndex = encryptedTopicMessage.b.indexOf(encapsulatedSymmetricKey);
      } catch (error: unknown) {
      }
    }

    if (!symmetricKey || symmetricKeyIndex === -1) {
      throw new Error('Could not find encapsulated symmetric key in array.');
    }

    const initVector: Buffer = Buffer.from(String(encryptedTopicMessage.c.at(symmetricKeyIndex)), 'base64');

    if (!initVector) {
      throw new Error('Could not find init vector in array.');
    }

    for (const encryptedPayload of encryptedTopicMessage.a) {
      try {
        const decipher = crypto.createDecipheriv('AES256', symmetricKey, initVector);
        let decryptedPayload = decipher.update(encryptedPayload, 'base64', 'utf-8');
        decryptedPayload += decipher.final('utf8');

        return {
          sequenceNumber: sequenceNumber,
          payload: decryptedPayload,
          timestamp: consensusTimeStamp.toDate()
        };
      } catch (error: unknown) {
      }
    }

    throw new Error('Could not decrypt topic message.');
  }
}
