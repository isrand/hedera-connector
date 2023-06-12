import {Module} from '@nestjs/common';
import {TopicController} from './TopicController';
import {TopicService} from './TopicService';
import {TopicGateway} from './TopicGateway';
import {EncryptedTopicController} from './EncryptedTopicController';

@Module({
  controllers: [
    TopicController,
    EncryptedTopicController
  ],
  providers: [
    TopicService,
    TopicGateway
  ]
})
export class TopicModule {}
