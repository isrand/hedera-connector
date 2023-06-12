import {ApiProperty} from '@nestjs/swagger';
import {HederaConnectorRequestDTO} from '../../../common/dto/HederaConnectorRequestDTO';

export class SendMessageToTopicDTO extends HederaConnectorRequestDTO {
  @ApiProperty({
    required: true,
    description: 'Message to send to the topic',
    example: 'Hello, world!'
  })
  public message!: string;
}
