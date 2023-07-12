export class Configuration {
  public static hederaAccountId: string = String(process.env['HEDERA_ACCOUNT_ID']);
  public static hederaPublicKey: string = String(process.env['HEDERA_PUBLIC_KEY']);
  public static hederaPrivateKey: string = String(process.env['HEDERA_PRIVATE_KEY']);

  public static kyberPublicKey: string = String(process.env['KYBER_PUBLIC_KEY']);
  public static kyberPrivateKey: string = String(process.env['KYBER_PRIVATE_KEY']);

  public static walletType: string = String(process.env['WALLET_TYPE']);
}
