import {ICryptoAdapter} from './adapters/interfaces/ICryptoAdapter';
import {Kyber} from './adapters/Kyber';

export class Crypto {
  public adapter: ICryptoAdapter;
  public constructor(keySize: number) {
    this.adapter = new Kyber(keySize);
  }
}
