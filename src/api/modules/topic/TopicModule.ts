import {Module} from '@nestjs/common';
import {TopicController} from './TopicController';
import {TopicService} from './TopicService';
import {TopicGateway} from './TopicGateway';

@Module({
  controllers: [TopicController],
  providers: [
    TopicService,
    TopicGateway
  ]
})
export class TopicModule {}
