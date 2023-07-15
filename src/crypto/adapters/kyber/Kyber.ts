/* eslint-disable */
// ESLint will complain a lot in this file because of Kyber.
import {ITopicConfiguration} from "../../../api/modules/encryptedtopic/interfaces/ITopicConfiguration";
import {IEncryptedTopicMessage} from "../../../api/modules/encryptedtopic/interfaces/IEncryptedTopicMessage";
import {ITopicMessage} from "../../../api/modules/topic/interfaces/ITopicMessage";
import {ICryptoAdapter} from "../../interfaces/ICryptoAdapter";
import {ITopicParticipant} from "../../../api/modules/encryptedtopic/interfaces/ITopicParticipant";
import {IEncryptedTopicConfiguration} from "../../../api/modules/encryptedtopic/interfaces/IEncryptedTopicConfiguration";
import * as crypto from "crypto";
import {Timestamp} from "@hashgraph/sdk";
import {KyberKeyPair} from "./support/KyberKeyPair";
import {KyberKeySize} from "./enums/KyberKeySize";

const kyber = require('crystals-kyber');

export class Kyber implements ICryptoAdapter {
  public constructor(private readonly keySize: number) {
  }

  public generateKeyPair(): KyberKeyPair {
    switch (this.keySize) {
      case KyberKeySize.Kyber512:
        return new KyberKeyPair(KyberKeySize.Kyber512, kyber.KeyGen512());
      case KyberKeySize.Kyber768:
        return new KyberKeyPair(KyberKeySize.Kyber768, kyber.KeyGen768());
      case KyberKeySize.Kyber1024:
        return new KyberKeyPair(KyberKeySize.Kyber1024, kyber.KeyGen1024());
      default:
        throw new Error('Unrecognized Kyber key size. Available sizes are 512, 768 and 1024');
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
      let symmetricAndEncapsulatedKey: Array<Array<number>> = this.getSymmetricAndEncapsulatedKey(kyberPublicKey);
      let initVector: Buffer = this.getInitVector(kyberPublicKey);

      const encapsulatedSymmetricKey: Array<number> | undefined = symmetricAndEncapsulatedKey[0];
      const symmetricKey: Array<number> | undefined = symmetricAndEncapsulatedKey[1];

      if (!encapsulatedSymmetricKey || !symmetricKey) {
        throw new Error('Error encrypting using kyber public key');
      }

      finalObject.a.push(this.symmetricEncryptData(dataToEncrypt, symmetricKey, initVector));
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
      let symmetricAndEncapsulatedKey: Array<Array<number>> = this.getSymmetricAndEncapsulatedKey(kyberPublicKey);
      let initVector: Buffer = this.getInitVector(kyberPublicKey);

      const encapsulatedSymmetricKey: Array<number> | undefined = symmetricAndEncapsulatedKey[0];
      const symmetricKey: Array<number> | undefined = symmetricAndEncapsulatedKey[1];

      if (!encapsulatedSymmetricKey || !symmetricKey) {
        throw new Error('Error encrypting using kyber public key');
      }

      finalObject.a.push(this.symmetricEncryptData(dataToEncrypt, symmetricKey, initVector));
      finalObject.b.push(Buffer.from(encapsulatedSymmetricKey).toString('base64'));
      finalObject.c.push(Buffer.from(initVector).toString('base64'));
      finalObject.d.push(this.symmetricEncryptData(submitKey, symmetricKey, initVector));
    }

    return finalObject;
  }

  public decryptTopicConfigurationMessage(encryptedTopicConfigurationMessage: IEncryptedTopicConfiguration, privateKey: string): ITopicConfiguration {
    for (const encryptedPayload of encryptedTopicConfigurationMessage.a) {
      for (const encapsulatedSymmetricKey of encryptedTopicConfigurationMessage.b) {
        for (const initVector of encryptedTopicConfigurationMessage.c) {
          try {
            const symmetricKey = this.decryptEncapsulatedSymmetricKey(encapsulatedSymmetricKey, privateKey);
            const decryptedData = this.symmetricDecryptData(encryptedPayload, symmetricKey, initVector);

            if (this.calculateSHA256Hash(decryptedData) === encryptedTopicConfigurationMessage.h) {
              return JSON.parse(decryptedData) as ITopicConfiguration;
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
            const symmetricKey = this.decryptEncapsulatedSymmetricKey(encapsulatedSymmetricKey, privateKey);
            const decryptedData = this.symmetricDecryptData(encryptedPayload, symmetricKey, initVector);

            if (this.calculateSHA256Hash(decryptedData) === encryptedTopicMessage.h) {
              return {
                sequenceNumber: sequenceNumber,
                payload: decryptedData,
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

  private symmetricEncryptData(dataToEncrypt: string, symmetricKey: Array<number>, initVector: Buffer): string {
    const messageCipher = crypto.createCipheriv('AES256', Buffer.from(symmetricKey), Buffer.from(initVector));
    let encryptedData = messageCipher.update(dataToEncrypt, 'utf8', 'base64');
    encryptedData += messageCipher.final('base64');

    return encryptedData;
  }

  private symmetricDecryptData(dataToDecrypt: string, symmetricKey: Buffer, initVector: string) {
    const decipher = crypto.createDecipheriv('AES256', symmetricKey, Buffer.from(String(initVector), 'base64'));
    let decryptedData = decipher.update(dataToDecrypt, 'base64', 'utf-8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
  }

  private decryptEncapsulatedSymmetricKey(encapsulatedSymmetricKey: string, privateKey: string) {
    switch (this.keySize) {
      case KyberKeySize.Kyber512:
        return kyber.Decrypt512(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
      case KyberKeySize.Kyber768:
        return kyber.Decrypt768(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
      case KyberKeySize.Kyber1024:
        return kyber.Decrypt1024(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
    }
  }

  private getSymmetricAndEncapsulatedKey(publicKey: Buffer): Array<Array<number>> {
    switch (this.keySize) {
      case KyberKeySize.Kyber512:
        return kyber.Encrypt512(publicKey);
      case KyberKeySize.Kyber768:
        return kyber.Encrypt768(publicKey);
      case KyberKeySize.Kyber1024:
        return kyber.Encrypt1024(publicKey);
      default:
        return [[]];
    }
  }

  private getInitVector(publicKey: Buffer): Buffer {
    switch (this.keySize) {
      case KyberKeySize.Kyber512:
        return Buffer.from(kyber.Encrypt512(publicKey)[0].slice(0, 16));
      case KyberKeySize.Kyber768:
        return Buffer.from(kyber.Encrypt768(publicKey)[0].slice(0, 16));
      case KyberKeySize.Kyber1024:
        return Buffer.from(kyber.Encrypt1024(publicKey)[0].slice(0, 16));
      default:
        return Buffer.from([]);
    }
  }
}
