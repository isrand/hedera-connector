import {Module} from '@nestjs/common';
import {TopicModule} from './api/modules/topic/TopicModule';
import {FileModule} from './api/modules/file/FileModule';
import {AccountModule} from './api/modules/account/AccountModule';
import {EncryptedTopicModule} from './api/modules/encryptedtopic/EncryptedTopicModule';
import {HashpackModule} from './api/modules/hashpack/HashpackModule';

@Module({
  imports: [
    AccountModule,
    HashpackModule,
    TopicModule,
    EncryptedTopicModule,
    FileModule
  ]
})
export class AppModule {}
