import {Get, Body, Controller, Post, Param} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {AccountService} from './AccountService';
import {CreateAccountDTO} from './dto/CreateAccountDTO';
import {CreateAccountResponse} from './responses/CreateAccountResponse';
import {GetAllAccountsResponse} from './responses/GetAllAccountsResponse';
import {GetAccountResponse} from './responses/GetAccountResponse';

@ApiTags('Account')
@Controller()
export class AccountController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly accountService: AccountService) {
  }

  @Post('/account')
  @ApiOperation({
    summary: 'Create a new account.',
    description: ''
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createAccount(@Body() createAccountDTO: CreateAccountDTO): Promise<CreateAccountResponse> {
    return await this.accountService.createAccount(createAccountDTO);
  }

  @Get('/account')
  @ApiOperation({
    summary: 'Get all accounts registered on the node.',
    description: ''
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async getAllAccounts(): Promise<GetAllAccountsResponse> {
    return await this.accountService.getAllAccounts();
  }

  @Get('/account/:id')
  @ApiOperation({
    summary: 'Get information about an account registered on the node given its id.',
    description: ''
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async getAccount(@Param('id') accountId: string): Promise<GetAccountResponse> {
    return await this.accountService.getAccount(accountId);
  }
}
