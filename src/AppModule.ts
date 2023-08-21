import {Module} from '@nestjs/common';
import {TopicModule} from './api/modules/topic/TopicModule';
import {FileModule} from './api/modules/file/FileModule';
import {AccountModule} from './api/modules/account/AccountModule';
import {EncryptedTopicModule} from './api/modules/encryptedtopic/EncryptedTopicModule';
import {EncryptedFileModule} from './api/modules/encryptedfile/EncryptedFileModule';

@Module({
  imports: [
    AccountModule,
    TopicModule,
    EncryptedTopicModule,
    FileModule,
    EncryptedFileModule
  ]
})
export class AppModule {}
