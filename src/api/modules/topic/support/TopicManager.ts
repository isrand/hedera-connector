import {ITopicConfiguration} from '../interfaces/ITopicConfiguration';
import {Logger} from '@nestjs/common';

export class TopicManager {
  private static readonly logger: Logger = new Logger(TopicManager.name);
  private static readonly topicPool: Map<string, ITopicConfiguration> = new Map<string, ITopicConfiguration>();

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public static addTopic(topicId: string, topicConfiguration: Readonly<ITopicConfiguration>): void {
    this.logger.debug(`Adding topic ${topicId.replace('0.0.', '')} to cache.`);

    this.topicPool.set(topicId.replace('0.0.', ''), topicConfiguration);

    this.logger.debug(`Added topic ${topicId.replace('0.0.', '')} to cache.`);
  }

  public static getTopicConfiguration(topicId: string): ITopicConfiguration {
    this.logger.debug(`Getting topic configuration for topic ${topicId.replace('0.0.', '')} from cache.`);

    const topic: ITopicConfiguration | undefined = this.topicPool.get(topicId.replace('0.0.', ''));

    if (!topic) {
      throw new Error('Topic not found in pool');
    }

    return topic;
  }

  public static hasTopic(topicId: string): boolean {
    this.logger.debug(`Checking if topic ${topicId.replace('0.0.', '')} is cached...`);

    const isCached: boolean = this.topicPool.has(topicId.replace('0.0.', ''));

    if (!isCached) {
      this.logger.debug(`${topicId.replace('0.0.', '')} is not cached.`);
    } else {
      this.logger.debug(`${topicId.replace('0.0.', '')} is cached.`);
    }

    return isCached;
  }
}
