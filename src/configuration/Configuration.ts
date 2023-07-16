export class Configuration {
  public static nodeHederaAccountId: string = String(process.env['NODE_HEDERA_ACCOUNT_ID']) || '';

  public static couchDBURL: string = String(process.env['COUCHDB_URL']);
  public static couchDBUser: string = String(process.env['COUCHDB_USER']);
  public static couchDBPassword: string = String(process.env['COUCHDB_PASSWORD']);
}
