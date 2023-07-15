import {IHederaConnectorResponse} from '../../../responses/IHederaConnectorResponse';
import {ApiProperty} from '@nestjs/swagger';
import {HttpStatusCode} from 'axios';
import {AccountResponse} from './AccountResponse';

export class GetAllAccountsResponse {
  @ApiProperty({
    type: AccountResponse,
    isArray: true,
    example: [
      {
        hederaAccountId: '0.0.1234',
        hederaPublicKey: '302a300506032b...',
        kyber512PublicKey: 'OjcSV4DE54uUwDph4XUoF1g6EikOxju9NrDPmhChiMNa...',
        kyber768PublicKey: 'T4SZPfAhLDwsxwynGzqtZVVbilV3wKoy9BEquvwrt/Sj...',
        kyber1024PublicKey: 'd7FPALymNtNGsMA9SKKhHqgfH/rJq4bBjSUMMtaVgtei...'
      }
    ]
  })
  public accounts!: Array<AccountResponse>;
}

export class HederaConnectorGetAllAccountsResponse implements IHederaConnectorResponse {
  @ApiProperty({
    example: HttpStatusCode.Ok
  })
  public statusCode!: number;

  @ApiProperty({
    example: 'Accounts retrieved.'
  })
  public message!: string;

  @ApiProperty({
    type: GetAllAccountsResponse
  })
  public payload!: GetAllAccountsResponse;
}
