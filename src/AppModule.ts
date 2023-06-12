import {Module} from '@nestjs/common';
import {TopicModule} from './api/modules/topic/TopicModule';
import {FileModule} from './api/modules/file/FileModule';

@Module({
  imports: [
    TopicModule,
    FileModule
  ]
})
export class AppModule {}
