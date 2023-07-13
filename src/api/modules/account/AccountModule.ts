import {Module} from '@nestjs/common';
import {AccountService} from './AccountService';
import {AccountController} from './AccountController';

@Module({
  controllers: [AccountController],
  providers: [AccountService]
})
export class AccountModule {}
