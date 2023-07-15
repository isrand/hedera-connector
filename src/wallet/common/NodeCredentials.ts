import {Logger} from '@nestjs/common';
import * as fs from 'fs';
import {IKyberKeyPair} from '../../crypto/adapters/kyber/interfaces/IKyberKeyPair';
import {Crypto} from '../../crypto/Crypto';
import {Account} from '../support/Account';
import {KyberKeySize} from '../../crypto/adapters/kyber/enums/KyberKeySize';

export class NodeCredentials {
  private readonly logger: Logger = new Logger(NodeCredentials.name);

  private readonly pathToCredentialsDirectory: string = '/opt/credentials';

  public loadNodeAccount(): Account {
    return new Account(
      this.loadNodeHederaAccountId(),
      this.loadNodeHederaPublicKey(),
      this.loadNodeHederaPrivateKey(),
      this.loadNodeKyberKeys()
    );
  }

  private loadNodeHederaAccountId(): string {
    return fs.readFileSync(`${this.pathToCredentialsDirectory}/hedera_account_id`).toString();
  }

  private loadNodeHederaPublicKey(): string {
    return fs.readFileSync(`${this.pathToCredentialsDirectory}/hedera_public_key`).toString();
  }

  private loadNodeHederaPrivateKey(): string {
    return fs.readFileSync(`${this.pathToCredentialsDirectory}/hedera_private_key`).toString();
  }

  private loadNodeKyberKeys(): Array<IKyberKeyPair> {
    const keys: Array<IKyberKeyPair> = [];

    for (const size of [KyberKeySize.Kyber512, KyberKeySize.Kyber768, KyberKeySize.Kyber1024]) {
      this.logger.debug(`Loading Kyber private / public key pair of size ${size}`);
      const publicKey = fs.readFileSync(`${this.pathToCredentialsDirectory}/kyber_${size}_public_key`).toString();
      const privateKey = fs.readFileSync(`${this.pathToCredentialsDirectory}/kyber_${size}_private_key`).toString();

      if (publicKey === 'empty' || privateKey === 'empty') {
        this.logger.debug(`Kyber private / public key pair of size ${size} not found. Generating now..`);
        const keyPair = new Crypto(size).adapter.generateKeyPair();

        keys.push({
          size: size,
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey
        });

        continue;
      }

      keys.push({
        size: size,
        publicKey: publicKey,
        privateKey: privateKey
      });

      this.logger.debug(`Loaded Kyber private / public key pair of size ${size}`);
    }

    return keys;
  }
}
