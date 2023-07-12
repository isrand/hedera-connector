import {ApiProperty} from '@nestjs/swagger';

export class SendMessageToTopicDTO {
  @ApiProperty({
    required: true,
    description: 'Message to send to the topic',
    example: 'Hello, world!'
  })
  public message!: string;
}
