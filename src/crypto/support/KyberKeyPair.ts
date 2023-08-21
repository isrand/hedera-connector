import {IKyberKeyPair} from '../interfaces/IKyberKeyPair';

export class KyberKeyPair implements IKyberKeyPair {
  public size: number;
  public publicKey: string;
  public privateKey: string;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(size: number, keyPair: Array<Array<number>>) {
    if (!keyPair[0] || !keyPair[1]) {
      throw new Error('Error creating Kyber key pair');
    }

    this.size = size;
    this.publicKey = Buffer.from(keyPair[0]).toString('base64');
    this.privateKey = Buffer.from(keyPair[1]).toString('base64');
  }
}
