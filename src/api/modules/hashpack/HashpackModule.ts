import {Module} from '@nestjs/common';
import {HashpackController} from './HashpackController';
import {HashpackService} from './HashpackService';

@Module({
  controllers: [HashpackController],
  providers: [HashpackService]
})
export class HashpackModule {}
