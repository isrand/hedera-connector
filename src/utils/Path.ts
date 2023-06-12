export class Path {
  public static readonly toWallet: string = '/opt/wallet';

  public static readonly toNodeAccountInfo: string = `${this.toWallet}/node_account.json`;
  public static readonly toNodeRSAPrivateKey: string = `${this.toWallet}/private_key`;
}
