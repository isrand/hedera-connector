import {Module} from '@nestjs/common';
import {FileController} from './FileController';
import {FileService} from './FileService';

@Module({
  controllers: [FileController],
  providers: [FileService]
})
export class FileModule {}
