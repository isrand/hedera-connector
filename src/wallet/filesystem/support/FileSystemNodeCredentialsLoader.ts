import {Logger} from '@nestjs/common';
import * as fs from 'fs';
import {IKyberKeyPair} from '../../interfaces/IKyberKeyPair';
import {Crypto} from '../../../crypto/Crypto';
import {Account} from '../../support/Account';

export class FileSystemNodeCredentialsLoader {
  private readonly logger: Logger = new Logger(FileSystemNodeCredentialsLoader.name);

  private readonly pathToCredentialsDirectory: string = '/opt/credentials';

  public loadNodeAccountFromCredentials(): Account {
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

  /* eslint-disable */
  private loadNodeKyberKeys(): Array<IKyberKeyPair> {
    const keys: Array<IKyberKeyPair> = [];

    for (const size of [512, 768, 1024]) {
      this.logger.debug(`Loading Kyber private / public key pair of size ${size}`);
      const publicKey = fs.readFileSync(`${this.pathToCredentialsDirectory}/kyber_${size}_public_key`).toString();
      const privateKey = fs.readFileSync(`${this.pathToCredentialsDirectory}/kyber_${size}_private_key`).toString();

      if (publicKey === 'empty' || privateKey === 'empty') {
        this.logger.debug(`Kyber private / public key pair of size ${size} not found. Generating now..`);
        const keyPair = new Crypto(size).adapter.generateKeyPair();

        keys.push({
          size: size,
          publicKey: Buffer.from(keyPair[0]).toString('base64'),
          privateKey: Buffer.from(keyPair[1]).toString('base64')
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
  /* eslint-enable */
}
