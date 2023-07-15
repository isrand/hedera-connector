import {Controller, Post} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {HashpackService} from './HashpackService';

@ApiTags('Hashpack')
@Controller()
export class HashpackController {
  public constructor(private readonly hashpackService: HashpackService) {
  }

  @Post('/hashpack/pair')
  @ApiOperation({
    summary: 'Pair a Hedera wallet.',
    description: 'This endpoint returns the publicly available information about an account registered on the node given its ID.'
  }) // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async pairAccount(): Promise<Array<string>> {
    return await this.hashpackService.pairWithWallet();
  }
}
