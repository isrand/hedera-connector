export class Configuration {
  public static hederaAccountId: string = String(process.env['HEDERA_ACCOUNT_ID']);
  public static hederaPublicKey: string = String(process.env['HEDERA_PUBLIC_KEY']);
  public static hederaPrivateKey: string = String(process.env['HEDERA_PRIVATE_KEY']);

  // Crypto variables
  public static rsaPublicKey: string = String(process.env['RSA_PUBLIC_KEY']);
  public static rsaPrivateKey: string = String(process.env['RSA_PRIVATE_KEY']);

  public static kyberPublicKey: string = String(process.env['KYBER_PUBLIC_KEY']);
  public static kyberPrivateKey: string = String(process.env['KYBER_PRIVATE_KEY']);

  public static encryptionAlgorithm: string = String(process.env['ENCRYPTION_ALGORITHM']);

  public static walletType: string = String(process.env['WALLET_TYPE']);
}
