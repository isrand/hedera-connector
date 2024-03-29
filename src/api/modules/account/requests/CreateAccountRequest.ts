import {ApiProperty} from '@nestjs/swagger';

export class CreateAccountRequest {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Initial balance to create the account with',
    example: 100
  })
  public initialBalance!: number;
}
