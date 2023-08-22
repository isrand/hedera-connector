import {NestFactory} from '@nestjs/core';
import {AppModule} from '../AppModule';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as fs from 'fs';

export class Main {
  public async bootstrap(): Promise<void> {
    // Initialize application
    const app = await NestFactory.create(AppModule);

    // Create Swagger page
    const documentation = new DocumentBuilder()
      .setTitle('Hedera Hashgraph Connector')
      .setVersion('1.0')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, documentation);

    const path: string = String(process.argv[2]);

    fs.writeFileSync(path, JSON.stringify(swaggerDocument).replaceAll('undefined', '0.0.1234'));
  }
}

new Main().bootstrap().catch((error: unknown) => {
  console.error(error);

  process.exit(1);
});