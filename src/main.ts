import {NestFactory} from '@nestjs/core';
import {AppModule} from './AppModule';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {Wallet} from './wallet/Wallet';
import {EncryptedTopicManager} from './api/modules/encryptedtopic/support/EncryptedTopicManager';

export class Main {
  public async bootstrap(): Promise<void> {
    // Initialize the node wallet
    await Wallet.initialize();

    // Initialize the topic manager
    await EncryptedTopicManager.initialize();

    // Initialize application
    const app = await NestFactory.create(AppModule);

    // Create Swagger page
    const documentation = new DocumentBuilder()
      .setTitle('Hedera Hashgraph Connector')
      .setVersion('1.0')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, documentation);
    SwaggerModule.setup('swagger', app, swaggerDocument, {
      customCss: '.topbar {display:none};',
      customSiteTitle: 'Hedera Hashgraph Connector'
    });

    // Enable CORS
    app.enableCors();

    // Start application on port 4000
    await app.listen(4000);
  }
}

new Main().bootstrap().catch((error: unknown) => {
  console.error(error);

  process.exit(1);
});
