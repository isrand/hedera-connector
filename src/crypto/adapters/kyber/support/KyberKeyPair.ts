import {IKyberKeyPair} from '../interfaces/IKyberKeyPair';

export class KyberKeyPair implements IKyberKeyPair {
  public publicKey: string;
  public privateKey: string;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(public size: number, private readonly keyPair: Array<Array<number>>) {
    if (!this.keyPair[0] || !this.keyPair[1]) {
      throw new Error('Error creating Kyber key pair');
    }

    this.publicKey = Buffer.from(this.keyPair[0]).toString('base64');
    this.privateKey = Buffer.from(this.keyPair[1]).toString('base64');
  }
}
