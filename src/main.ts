import {NestFactory} from '@nestjs/core';
import {AppModule} from './AppModule';
import {SwaggerModule} from '@nestjs/swagger';
import {Wallet} from './wallet/Wallet';
import {EncryptedTopicManager} from './api/modules/encryptedtopic/support/EncryptedTopicManager';
import {OpenAPIObjectFactory} from './utils/openapi/OpenAPIObjectFactory';

export class Main {
  public async bootstrap(): Promise<void> {
    // Initialize the node wallet
    await Wallet.initialize();

    // Initialize the topic manager
    await EncryptedTopicManager.initialize();

    // Initialize application
    const app = await NestFactory.create(AppModule);

    const swaggerDocument = SwaggerModule.createDocument(app, new OpenAPIObjectFactory().getOpenAPIObject());
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
