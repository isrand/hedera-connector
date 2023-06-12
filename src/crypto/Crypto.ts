import {ICryptoAdapter} from './adapters/interfaces/ICryptoAdapter';
import {EncryptionAlgorithm} from './enums/EncryptionAlgorithm';
import {Kyber} from './adapters/Kyber';

export class Crypto {
  public static adapter: ICryptoAdapter;

  public static initializeAdapter(algorithm: string): void {
    if (algorithm === EncryptionAlgorithm.Kyber) {
      this.adapter = new Kyber();
    }
  }
}
