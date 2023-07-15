import {ApiProperty} from '@nestjs/swagger';
import {HttpStatusCode} from 'axios';

export class CreateAccountErrorResponse {
  @ApiProperty({
    example: HttpStatusCode.PreconditionFailed
  })
  public statusCode!: number;

  @ApiProperty({
    example: 'Node account does not have enough balance to create new account.'
  })
  public message!: string;

  @ApiProperty({
    example: 'Precondition Failed'
  })
  public error!: string;
}
