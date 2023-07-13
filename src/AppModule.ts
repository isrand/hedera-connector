import {Module} from '@nestjs/common';
import {TopicModule} from './api/modules/topic/TopicModule';
import {FileModule} from './api/modules/file/FileModule';
import {AccountModule} from './api/modules/account/AccountModule';

@Module({
  imports: [
    AccountModule,
    TopicModule,
    FileModule
  ]
})
export class AppModule {}
