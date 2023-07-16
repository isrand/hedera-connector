import {ITopicConfiguration} from '../interfaces/ITopicConfiguration';
import {Logger} from '@nestjs/common';
import {CouchDBAdapter} from '../../../../wallet/couchdb/support/CouchDBAdapter';
import {Configuration} from '../../../../configuration/Configuration';
import * as nano from 'nano';

export class EncryptedTopicManager {
  private static readonly logger: Logger = new Logger(EncryptedTopicManager.name);
  private static readonly topicPool: Map<string, ITopicConfiguration> = new Map<string, ITopicConfiguration>();

  private static couchDBAdapter: CouchDBAdapter;
  private static readonly topicCollectionName: string = 'topics';

  public static async initialize(): Promise<void> {
    this.logger.debug('Initializing Topic Configuration database storage...');

    this.couchDBAdapter = new CouchDBAdapter(
      Configuration.couchDBURL,
      Configuration.couchDBUser,
      Configuration.couchDBPassword
    );

    if (!await this.doesTopicCollectionExist()) {
      this.logger.debug('Topic Configuration database collection not found, creating...');

      await this.createTopicCollection();
    } else {
      this.logger.debug('Loading all existing Topic Configuration documents from database...');

      const topicsFromDatabase: Array<ITopicConfiguration & nano.IdentifiedDocument> = await this.loadTopicsFromDatabase();

      for (const topic of topicsFromDatabase) {
        this.topicPool.set(topic._id, {
          topicName: topic.topicName,
          participants: topic.participants,
          submitKey: String(topic.submitKey),
          encryptionSize: topic.encryptionSize
        });
      }

      this.logger.debug('Loaded all existing Topic Configuration documents from database.');
    }
  }

  public static getAllTopicConfigurations(): Array<ITopicConfiguration> {
    const allTopicIds: Array<ITopicConfiguration> = [];

    for (const topicId of this.topicPool.keys()) {
      const topicConfiguration: ITopicConfiguration = this.getTopicConfiguration(topicId);
      allTopicIds.push({
        topicId: topicId,
        topicName: topicConfiguration.topicName,
        encryptionSize: topicConfiguration.encryptionSize,
        participants: topicConfiguration.participants
      });
    }

    return allTopicIds;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public static async addTopic(topicId: string, topicConfiguration: Readonly<ITopicConfiguration>): Promise<void> {
    const topicConfigurationObjectInDatabase: nano.IdentifiedDocument & ITopicConfiguration = {
      // eslint-disable-next-line  @typescript-eslint/naming-convention
      _id: topicId,
      ...topicConfiguration
    };

    this.logger.debug(`Storing topic ${topicId} on database.`);
    await this.couchDBAdapter.storeInCollection(this.topicCollectionName, topicConfigurationObjectInDatabase);
    this.logger.debug(`Stored topic ${topicId} on database.`);

    this.logger.debug(`Adding topic ${topicId} to cache.`);
    this.topicPool.set(topicId, topicConfiguration);
    this.logger.debug(`Added topic ${topicId} to cache.`);
  }

  public static getTopicConfiguration(topicId: string): ITopicConfiguration {
    this.logger.debug(`Getting topic configuration for topic ${topicId} from cache.`);

    const topic: ITopicConfiguration | undefined = this.topicPool.get(topicId);

    if (!topic) {
      throw new Error('Topic not found in pool');
    }

    return topic;
  }

  public static hasTopic(topicId: string): boolean {
    this.logger.debug(`Checking if topic ${topicId} is cached...`);

    const isCached: boolean = this.topicPool.has(topicId);

    if (!isCached) {
      this.logger.debug(`${topicId} is not cached.`);
    } else {
      this.logger.debug(`${topicId} is cached.`);
    }

    return isCached;
  }

  private static async doesTopicCollectionExist(): Promise<boolean> {
    return await this.couchDBAdapter.collectionExists(this.topicCollectionName);
  }

  private static async createTopicCollection(): Promise<void> {
    await this.couchDBAdapter.createCollection(this.topicCollectionName);
  }

  private static async loadTopicsFromDatabase(): Promise<Array<ITopicConfiguration & nano.IdentifiedDocument>> {
    const topics: Array<ITopicConfiguration & nano.IdentifiedDocument> = [];

    const topicsInDatabase: nano.DocumentListResponse<unknown> = await this.couchDBAdapter.getAllFromCollection(this.topicCollectionName);

    for (const topicDocument of topicsInDatabase.rows) {
      const castedTopic = topicDocument.doc as unknown as ITopicConfiguration;
      topics.push({
        // eslint-disable-next-line  @typescript-eslint/naming-convention
        _id: topicDocument.id,
        encryptionSize: castedTopic.encryptionSize,
        topicName: castedTopic.topicName,
        participants: castedTopic.participants,
        submitKey: String(castedTopic.submitKey)
      });
    }

    return topics;
  }
}
