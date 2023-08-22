import {DocumentBuilder, OpenAPIObject} from '@nestjs/swagger';

/* eslint-disable */
const packageJSON = require('../../../package.json');

export class OpenAPIObjectFactory {
  public getOpenAPIObject(): Omit<OpenAPIObject, 'paths'> {
    return new DocumentBuilder()
      .setTitle('Hedera Connector')
      .setVersion(String(packageJSON.version))
      .setDescription(`
Hedera Connector Swagger UI page.`)
      .build();
  }
}

/* eslint-enable */
