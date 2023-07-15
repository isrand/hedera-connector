import {Module} from '@nestjs/common';
import {EncryptedTopicService} from './EncryptedTopicService';
import {EncryptedTopicController} from './EncryptedTopicController';
import {EncryptedTopicGateway} from './EncryptedTopicGateway';

@Module({
  controllers: [EncryptedTopicController],
  providers: [
    EncryptedTopicService,
    EncryptedTopicGateway
  ]
})
export class EncryptedTopicModule {}
