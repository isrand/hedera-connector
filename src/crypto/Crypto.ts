import {ICryptoAdapter} from './interfaces/ICryptoAdapter';
import {Kyber} from './adapters/kyber/Kyber';

export class Crypto {
  public adapter: ICryptoAdapter;
  public constructor(keySize: number) {
    this.adapter = new Kyber(keySize);
  }
}
