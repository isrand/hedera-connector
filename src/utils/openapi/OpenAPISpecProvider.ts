import {NestFactory} from '@nestjs/core';
import {AppModule} from '../../AppModule';
import {OpenAPIObject, SwaggerModule} from '@nestjs/swagger';
import * as fs from 'fs';
import {OpenAPIObjectFactory} from './OpenAPIObjectFactory';

export class Main {
  public async bootstrap(): Promise<void> {
    // Initialize application
    const app = await NestFactory.create(AppModule);

    const openAPISpec = SwaggerModule.createDocument(app, new OpenAPIObjectFactory().getOpenAPIObject());

    const path = String(process.argv[2]);

    fs.writeFileSync(path, this.sanitizeSpec(openAPISpec));
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  private sanitizeSpec(spec: OpenAPIObject): string {
    const stringifiedOpenAPISpec = JSON.stringify(spec);

    stringifiedOpenAPISpec.replaceAll('undefined', '0.0.1234');
    stringifiedOpenAPISpec.replaceAll('a ccount', 'account');

    return stringifiedOpenAPISpec;
  }
}

new Main().bootstrap().catch((error: unknown) => {
  console.error(error);

  process.exit(1);
});
