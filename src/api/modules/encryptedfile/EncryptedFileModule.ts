import {Module} from '@nestjs/common';
import {EncryptedFileController} from './EncryptedFileController';
import {EncryptedFileService} from './EncryptedFileService';

@Module({
  controllers: [EncryptedFileController],
  providers: [EncryptedFileService]
})
export class EncryptedFileModule {}
