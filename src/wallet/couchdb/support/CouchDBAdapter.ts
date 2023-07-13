import * as nano from 'nano';

export class CouchDBAdapter {
  private readonly databaseConnector: nano.ServerScope;

  public constructor(
    private readonly databaseUrl: string,
    private readonly databaseUsername: string,
    private readonly databasePassword: string
  ) {
    this.databaseConnector = nano({
      url: this.databaseUrl,
      requestDefaults: {
        auth: {
          username: this.databaseUsername,
          password: this.databasePassword
        }
      }
    });
  }

  public async collectionExists(collectionName: string): Promise<boolean> {
    try {
      await this.databaseConnector.db.get(collectionName);

      return true;
    } catch (error: unknown) {
      return false;
    }
  }

  public async documentExists(collectionName: string, id: string): Promise<boolean> {
    try {
      await this.databaseConnector.use(collectionName).get(id);

      return true;
    } catch (error: unknown) {
      return false;
    }
  }

  public async createCollection(collectionName: string): Promise<void> {
    await this.databaseConnector.db.create(collectionName);
  }

  public async getAllFromCollection(collectionName: string): Promise<nano.DocumentListResponse<unknown>> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return await this.databaseConnector.use(collectionName).list({include_docs: true});
  }

  public async getFromCollectionById(collectionName: string, id: string): Promise<nano.DocumentGetResponse> {
    if (!await this.documentExists(collectionName, id)) {
      throw new Error('Document not found.');
    }

    return await this.databaseConnector.use(collectionName).get(id);
  }

  // eslint-disable-next-line  @typescript-eslint/prefer-readonly-parameter-types
  public async storeInCollection(collectionName: string, object: unknown & nano.IdentifiedDocument): Promise<nano.DocumentInsertResponse> {
    return await this.databaseConnector.use(collectionName).insert(object);
  }
}
