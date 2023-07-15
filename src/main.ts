import {NestFactory} from '@nestjs/core';
import {AppModule} from './AppModule';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {Configuration} from './configuration/Configuration';
import {Wallet} from './wallet/Wallet';

export class Main {
  public async bootstrap(): Promise<void> {
    // Initialize the node wallet depending on the configuration passed via environment variables
    await Wallet.initialize(Configuration.walletType);
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
