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
      c: [],
      // eslint-disable-next-line id-length
      h: this.calculateSHA256Hash(dataToEncrypt)
    };

    for (const participant of participants) {
      const kyberPublicKey = Buffer.from(participant.kyberPublicKey, 'base64');
      let encapsulatedAndSymmetricKey: Array<Array<number>> = this.getSymmetricAndEncapsulatedKeyForSize(kyberPublicKey);
      let initVector: Buffer = this.getInitVectorForSize(kyberPublicKey);

      const encapsulatedSymmetricKey: Array<number> | undefined = encapsulatedAndSymmetricKey[0];
      const symmetricKey: Array<number> | undefined = encapsulatedAndSymmetricKey[1];

      if (!encapsulatedSymmetricKey || !symmetricKey) {
        throw new Error('Error encrypting using kyber public key');
      }

      const cipher = crypto.createCipheriv('AES256', Buffer.from(symmetricKey), Buffer.from(initVector));
      let encrypted = cipher.update(dataToEncrypt, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      finalObject.a.push(encrypted);
      finalObject.b.push(Buffer.from(encapsulatedSymmetricKey).toString('base64'));
      finalObject.c.push(Buffer.from(initVector).toString('base64'));
    }

    return finalObject;
  }

  public encryptTopicConfiguration(participants: ReadonlyArray<Readonly<ITopicParticipant>>, dataToEncrypt: string, submitKey: string): Readonly<IEncryptedTopicConfiguration> {
    const finalObject: IEncryptedTopicConfiguration = {
      // eslint-disable-next-line id-length
      a: [],
      // eslint-disable-next-line id-length
      b: [],
      // eslint-disable-next-line id-length
      c: [],
      // eslint-disable-next-line id-length
      d: [],
      // eslint-disable-next-line id-length
      s: this.keySize,
      // eslint-disable-next-line id-length
      h: this.calculateSHA256Hash(dataToEncrypt)
    };

    for (const participant of participants) {
      const kyberPublicKey = Buffer.from(participant.kyberPublicKey, 'base64');
      let encapsulatedAndSymmetricKey: Array<Array<number>> = this.getSymmetricAndEncapsulatedKeyForSize(kyberPublicKey);
      let initVector: Buffer = this.getInitVectorForSize(kyberPublicKey);

      const encapsulatedSymmetricKey: Array<number> | undefined = encapsulatedAndSymmetricKey[0];
      const symmetricKey: Array<number> | undefined = encapsulatedAndSymmetricKey[1];

      if (!encapsulatedSymmetricKey || !symmetricKey) {
        throw new Error('Error encrypting using kyber public key');
      }

      const messageCipher = crypto.createCipheriv('AES256', Buffer.from(symmetricKey), Buffer.from(initVector));
      let encryptedMessage = messageCipher.update(dataToEncrypt, 'utf8', 'base64');
      encryptedMessage += messageCipher.final('base64');

      const submitKeyCipher = crypto.createCipheriv('AES256', Buffer.from(symmetricKey), Buffer.from(initVector));
      let encryptedSubmitKey = submitKeyCipher.update(submitKey, 'utf8', 'base64');
      encryptedSubmitKey += submitKeyCipher.final('base64');

      finalObject.a.push(encryptedMessage);
      finalObject.b.push(Buffer.from(encapsulatedSymmetricKey).toString('base64'));
      finalObject.c.push(Buffer.from(initVector).toString('base64'));
      finalObject.d.push(encryptedSubmitKey);
    }

    return finalObject;
  }

  public decryptTopicConfigurationMessage(encryptedTopicConfigurationMessage: IEncryptedTopicConfiguration, privateKey: string): ITopicConfiguration {
    for (const encryptedPayload of encryptedTopicConfigurationMessage.a) {
      for (const encapsulatedSymmetricKey of encryptedTopicConfigurationMessage.b) {
        for (const initVector of encryptedTopicConfigurationMessage.c) {
          try {
            let symmetricKey = this.decryptForSize(encapsulatedSymmetricKey, privateKey);

            const decipher = crypto.createDecipheriv('AES256', symmetricKey, Buffer.from(String(initVector), 'base64'));
            let decryptedPayload = decipher.update(encryptedPayload, 'base64', 'utf-8');
            decryptedPayload += decipher.final('utf8');

            if (this.calculateSHA256Hash(decryptedPayload) === encryptedTopicConfigurationMessage.h) {
              return JSON.parse(decryptedPayload) as ITopicConfiguration;
            }
          } catch (error: unknown) {
            continue;
          }
        }
      }
    }

    throw new Error('Error decrypting topic configuration message. Does the account have access?');
  }


  public decryptTopicMessage(encryptedTopicMessage: IEncryptedTopicMessage, consensusTimeStamp: Timestamp, sequenceNumber: number, privateKey: string): ITopicMessage {
    for (const encryptedPayload of encryptedTopicMessage.a) {
      for (const encapsulatedSymmetricKey of encryptedTopicMessage.b) {
        for (const initVector of encryptedTopicMessage.c) {
          try {
            let symmetricKey = this.decryptForSize(encapsulatedSymmetricKey, privateKey);

            const decipher = crypto.createDecipheriv('AES256', symmetricKey, Buffer.from(String(initVector), 'base64'));
            let decryptedPayload = decipher.update(encryptedPayload, 'base64', 'utf-8');
            decryptedPayload += decipher.final('utf8');

            if (this.calculateSHA256Hash(decryptedPayload) === encryptedTopicMessage.h) {
              return {
                sequenceNumber: sequenceNumber,
                payload: decryptedPayload,
                timestamp: consensusTimeStamp.toDate()
              };
            }
          } catch (error: unknown) {
            continue;
          }
        }
      }
    }

    throw new Error('Error decrypting topic message. Does the account have access?');
  }

  private calculateSHA256Hash(contents: string) {
    const hash = crypto.createHash('sha256');
    hash.update(contents);
    return hash.digest('hex');
  }

  private decryptForSize(encapsulatedSymmetricKey: string, privateKey: string) {
    switch (this.keySize) {
      case 512:
        return kyber.Decrypt512(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
      case 768:
        return kyber.Decrypt768(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
      case 1024:
        return kyber.Decrypt1024(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
    }
  }

  private getSymmetricAndEncapsulatedKeyForSize(publicKey: Buffer): Array<Array<number>> {
    switch (this.keySize) {
      case 512:
        return kyber.Encrypt512(publicKey);
      case 768:
        return kyber.Encrypt768(publicKey);
      case 1024:
        return kyber.Encrypt1024(publicKey);
      default:
        return [[]];
    }
  }

  private getInitVectorForSize(publicKey: Buffer): Buffer {
    switch (this.keySize) {
      case 512:
        return Buffer.from(kyber.Encrypt512(publicKey)[0].slice(0, 16));
      case 768:
        return Buffer.from(kyber.Encrypt768(publicKey)[0].slice(0, 16));
      case 1024:
        return Buffer.from(kyber.Encrypt1024(publicKey)[0].slice(0, 16));
      default:
        return Buffer.from([]);
    }
  }
}
