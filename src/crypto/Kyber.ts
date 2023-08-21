/* eslint-disable */
// ESLint will complain a lot in this file because of Kyber.
import {ITopicConfiguration} from "../api/modules/encryptedtopic/interfaces/ITopicConfiguration";
import {IEncryptedTopicMessage} from "../api/modules/encryptedtopic/interfaces/IEncryptedTopicMessage";
import {ITopicMessage} from "../api/modules/topic/interfaces/ITopicMessage";
import {IEncryptedTopicConfiguration} from "../api/modules/encryptedtopic/interfaces/IEncryptedTopicConfiguration";
import * as crypto from "crypto";
import {Timestamp} from "@hashgraph/sdk";
import {KyberKeyPair} from "./support/KyberKeyPair";
import {KeySize} from "./enums/KeySize";
import {IAccessListParticipant} from "../api/common/interfaces/IAccessListParticipant";
import {IEncryptedObject} from "../api/common/interfaces/IEncryptedObject";

const kyber = require('crystals-kyber');

export class Kyber {
  public constructor(private readonly keySize: number) {
  }

  public generateKeyPair(): KyberKeyPair {
    switch (this.keySize) {
      case KeySize.Kyber512:
        return new KyberKeyPair(KeySize.Kyber512, kyber.KeyGen512());
      case KeySize.Kyber768:
        return new KyberKeyPair(KeySize.Kyber768, kyber.KeyGen768());
      case KeySize.Kyber1024:
        return new KyberKeyPair(KeySize.Kyber1024, kyber.KeyGen1024());
      default:
        throw new Error('Unrecognized Kyber key size. Available sizes are 512, 768 and 1024');
    }
  }

  public encryptData(participants: ReadonlyArray<Readonly<IAccessListParticipant>>, dataToEncrypt: string): Readonly<IEncryptedObject> {
    const finalObject: IEncryptedObject = {
      // eslint-disable-next-line id-length
      a: {},
      // eslint-disable-next-line id-length
      b: {},
      // eslint-disable-next-line id-length
      h: this.calculateSHA512Hash(dataToEncrypt),
      // eslint-disable-next-line id-length
      s: this.keySize
    };

    for (const participant of participants) {
      const kyberPublicKey = Buffer.from(participant.kyberPublicKey, 'base64');
      const kyberPublicKeyHash = this.calculateSHA512Hash(participant.kyberPublicKey);

      let symmetricAndEncapsulatedKey: Array<Array<number>> = this.getSymmetricAndEncapsulatedKey(kyberPublicKey);

      const encapsulatedSymmetricKey: Array<number> | undefined = symmetricAndEncapsulatedKey[0];
      const symmetricKey: Array<number> | undefined = symmetricAndEncapsulatedKey[1];

      if (!encapsulatedSymmetricKey || !symmetricKey) {
        throw new Error('Error encrypting using kyber public key');
      }

      let initVector: Buffer = this.getInitVectorFromSymmetricKeyNumberArray(symmetricKey);

      finalObject.a[kyberPublicKeyHash] = this.symmetricEncryptData(dataToEncrypt, Buffer.from(symmetricKey), initVector);
      finalObject.b[kyberPublicKeyHash] = Buffer.from(encapsulatedSymmetricKey).toString('base64');
    }

    return finalObject;
  }

  public encryptTopicConfiguration(participants: ReadonlyArray<Readonly<IAccessListParticipant>>, dataToEncrypt: string, submitKey: string): Readonly<IEncryptedTopicConfiguration> {
    const finalObject: IEncryptedTopicConfiguration = {
      // eslint-disable-next-line id-length
      a: {},
      // eslint-disable-next-line id-length
      b: {},
      // eslint-disable-next-line id-length
      c: {},
      // eslint-disable-next-line id-length
      s: this.keySize,
      // eslint-disable-next-line id-length
      h: this.calculateSHA512Hash(dataToEncrypt)
    };

    for (const participant of participants) {
      const kyberPublicKey = Buffer.from(participant.kyberPublicKey, 'base64');
      const kyberPublicKeyHash = this.calculateSHA512Hash(participant.kyberPublicKey);
      let symmetricAndEncapsulatedKey: Array<Array<number>> = this.getSymmetricAndEncapsulatedKey(kyberPublicKey);

      const encapsulatedSymmetricKey: Array<number> | undefined = symmetricAndEncapsulatedKey[0];
      const symmetricKey: Array<number> | undefined = symmetricAndEncapsulatedKey[1];

      if (!encapsulatedSymmetricKey || !symmetricKey) {
        throw new Error('Error encrypting using kyber public key');
      }

      let initVector: Buffer = this.getInitVectorFromSymmetricKeyNumberArray(symmetricKey);

      finalObject.a[kyberPublicKeyHash] = this.symmetricEncryptData(dataToEncrypt, Buffer.from(symmetricKey), initVector);
      finalObject.b[kyberPublicKeyHash] = Buffer.from(encapsulatedSymmetricKey).toString('base64');
      finalObject.c[kyberPublicKeyHash] = this.symmetricEncryptData(submitKey, Buffer.from(symmetricKey), initVector);
    }

    return finalObject;
  }

  public decryptTopicConfigurationMessage(encryptedTopicConfigurationMessage: IEncryptedTopicConfiguration, privateKey: string): ITopicConfiguration {
    for (const encryptedPayload of Object.values(encryptedTopicConfigurationMessage.a)) {
      for (const encapsulatedSymmetricKey of Object.values(encryptedTopicConfigurationMessage.b)) {
        try {
          const symmetricKey = this.decryptEncapsulatedSymmetricKey(encapsulatedSymmetricKey, privateKey);
          const initVector = this.getInitVectorFromSymmetricKeyNumberArray(symmetricKey);
          const decryptedData = this.symmetricDecryptData(encryptedPayload, symmetricKey, initVector);

          if (this.calculateSHA512Hash(decryptedData) === encryptedTopicConfigurationMessage.h) {
            return JSON.parse(decryptedData) as ITopicConfiguration;
          }
        } catch (error: unknown) {
          continue;
        }
      }
    }

    throw new Error('Error decrypting topic configuration message. Does the account have access?');
  }

  public decryptFile(encryptedFile: IEncryptedObject, privateKey: string): string {
    for (const encryptedPayload of Object.values(encryptedFile.a)) {
      for (const encapsulatedSymmetricKey of Object.values(encryptedFile.b)) {
        try {
          const symmetricKey = this.decryptEncapsulatedSymmetricKey(encapsulatedSymmetricKey, privateKey);
          const initVector = this.getInitVectorFromSymmetricKeyNumberArray(symmetricKey);
          const decryptedData = this.symmetricDecryptData(encryptedPayload, symmetricKey, initVector);

          if (this.calculateSHA512Hash(decryptedData) === encryptedFile.h) {
            return decryptedData;
          }
        } catch (error: unknown) {
          continue;
        }
      }
    }

    throw new Error('Error decrypting file. Does the account have access?');
  }

  public decryptTopicMessage(encryptedTopicMessage: IEncryptedTopicMessage, consensusTimeStamp: Timestamp, sequenceNumber: number, privateKey: string): ITopicMessage {
    for (const encryptedPayload of Object.values(encryptedTopicMessage.a)) {
      for (const encapsulatedSymmetricKey of Object.values(encryptedTopicMessage.b)) {
        try {
          const symmetricKey = this.decryptEncapsulatedSymmetricKey(encapsulatedSymmetricKey, privateKey);
          const initVector = this.getInitVectorFromSymmetricKeyNumberArray(symmetricKey);
          const decryptedData = this.symmetricDecryptData(encryptedPayload, symmetricKey, initVector);

          if (this.calculateSHA512Hash(decryptedData) === encryptedTopicMessage.h) {
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

    throw new Error('Error decrypting topic message. Does the account have access?');
  }

  private calculateSHA512Hash(contents: string) {
    const hash = crypto.createHash('sha512');
    hash.update(contents);

    return hash.digest('hex');
  }

  private symmetricEncryptData(dataToEncrypt: string, symmetricKey: Buffer, initVector: Buffer): string {
    const messageCipher = crypto.createCipheriv('AES256', Buffer.from(symmetricKey), Buffer.from(initVector));
    let encryptedData = messageCipher.update(dataToEncrypt, 'utf8', 'base64');
    encryptedData += messageCipher.final('base64');

    return encryptedData;
  }

  private symmetricDecryptData(dataToDecrypt: string, symmetricKey: Buffer, initVector: Buffer) {
    const decipher = crypto.createDecipheriv('AES256', Buffer.from(symmetricKey), Buffer.from(initVector));
    let decryptedData = decipher.update(dataToDecrypt, 'base64', 'utf-8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
  }

  private decryptEncapsulatedSymmetricKey(encapsulatedSymmetricKey: string, privateKey: string) {
    switch (this.keySize) {
      case KeySize.Kyber512:
        return kyber.Decrypt512(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
      case KeySize.Kyber768:
        return kyber.Decrypt768(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
      case KeySize.Kyber1024:
        return kyber.Decrypt1024(Buffer.from(encapsulatedSymmetricKey, 'base64'), Buffer.from(privateKey, 'base64'));
    }
  }

  private getSymmetricAndEncapsulatedKey(publicKey: Buffer): Array<Array<number>> {
    switch (this.keySize) {
      case KeySize.Kyber512:
        return kyber.Encrypt512(publicKey);
      case KeySize.Kyber768:
        return kyber.Encrypt768(publicKey);
      case KeySize.Kyber1024:
        return kyber.Encrypt1024(publicKey);
      default:
        return [[]];
    }
  }

  private getInitVectorFromSymmetricKeyNumberArray(symmetricKey: Array<number>): Buffer {
    return Buffer.from(symmetricKey.filter((_, index) => index % 2 === 0))
  }
}
