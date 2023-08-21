import {Get, Body, Controller, Post, Param} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import {AccountService} from './AccountService';
import {CreateAccountRequest} from './requests/CreateAccountRequest';
import {HederaConnectorCreateAccountResponse} from './responses/CreateAccountResponse';
import {HederaConnectorGetAllAccountsResponse} from './responses/GetAllAccountsResponse';
import {HederaConnectorGetAccountResponse} from './responses/GetAccountResponse';
import {ApiPreconditionFailedResponse} from '@nestjs/swagger/dist/decorators/api-response.decorator';
import {CreateAccountErrorResponse} from './errors/CreateAccountErrorResponse';
import {GetAccountErrorResponse} from './errors/GetAccountErrorResponse';
import {HederaConnectorAccountBalanceResponse} from './responses/AccountBalanceResponse';

@ApiTags('Account')
@Controller()
export class AccountController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly accountService: AccountService) {
  }

  @Post('/account')
  @ApiOperation({
    summary: 'Create a new account.',
    description: `This endpoint registers a new account on the node's wallet.
The account consists of a new Hedera account (and its associated account ID, public / private key) and a set of Crystals-Kyber keys of 512-bit, 768-bit, and 1024-bit sizes used for encryption.

A new account needs to be created with an initial balance that they will then use to perform operations on the Hedera network. The initial balance is subtracted from the Node account and transferred to the new account on creation.`
  })
  @ApiBody({
    type: CreateAccountRequest,
    required: true
  })
  @ApiCreatedResponse({
    description: 'Account created response.',
    type: HederaConnectorCreateAccountResponse
  })
  @ApiPreconditionFailedResponse({
    description: 'Account creation error: Node account does not have enough balance.',
    type: CreateAccountErrorResponse
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createAccount(@Body() createAccountRequest: CreateAccountRequest): Promise<HederaConnectorCreateAccountResponse> {
    return await this.accountService.createAccount(createAccountRequest);
  }

  @Get('/account')
  @ApiOperation({
    summary: 'Get all accounts registered on the node.',
    description: 'This endpoint returns the publicly available information about all the accounts registered on the node.'
  })
  @ApiOkResponse({
    description: 'Accounts retrieved response.',
    type: HederaConnectorGetAllAccountsResponse
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async getAllAccounts(): Promise<HederaConnectorGetAllAccountsResponse> {
    return await this.accountService.getAllAccounts();
  }

  @Get('/account/:id')
  @ApiOperation({
    summary: 'Get information about an account registered on the node given its id.',
    description: 'This endpoint returns the publicly available information about an account registered on the node given its ID.'
  })
  @ApiOkResponse({
    description: 'Account retrieved response.',
    type: HederaConnectorGetAccountResponse
  })
  @ApiNotFoundResponse({
    description: 'Account retrieval error response.',
    type: GetAccountErrorResponse
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async getAccount(@Param('id') accountId: string): Promise<HederaConnectorGetAccountResponse> {
    return await this.accountService.getAccount(accountId);
  }

  @Get('/account/:id/balance')
  @ApiOperation({
    summary: 'Get the balance of an account given its id.',
    description: 'This endpoint returns the balance of an account given its id.'
  })
  @ApiOkResponse({
    description: 'Account retrieved response.',
    type: HederaConnectorGetAccountResponse
  })
  @ApiNotFoundResponse({
    description: 'Account retrieval error response.',
    type: GetAccountErrorResponse
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async getAccountBalance(@Param('id') accountId: string): Promise<HederaConnectorAccountBalanceResponse> {
    return await this.accountService.getAccountBalance(accountId);
  }
}
