# Installation

To deploy the Hedera Connector locally run:

```bash
npm run buildDockerImage
npm run push
npm run start
```

Once the container is up and running you can port forward it through Kubernetes and access the Swagger documentation [http://localhost:4000/swagger](here).
