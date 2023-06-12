# Hedera Hashgraph Testnet Connector

This repository contains a NestJS API server to simplify integration with the Hedera Hashgraph Testnet.

## Setup

### Dependencies

To simplify dependency management it is recommended that you install [Homebrew](http://brew.sh).

To deploy the Connector locally you wil need:

* [Docker](https://docker.com) (`brew install cask docker`) (Tested: v4.19.0)
* [Minikube](https://minikube.sigs.k8s.io/) (`brew install minikube`) (Tested: v1.30.1)
* [Helm](https://helm.sh) (`brew install helm`)
* [NodeJS](https://nodejs.org) (`brew install node`)

You will also need to install the NPM packages used in this project:

```bash
npm install
```

### Kubernetes environment

Minikube is used as a minimal Kubernetes environment. The registry addon is used to store the Connector's image. To create the cluster run:


```bash
minikube start --insecure-registry localhost:5000
minikube addons enable registry
MINIKUBE_IP=$(minikube ip)
docker run --detach --rm --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$MINIKUBE_IP:5000"
```

### Credentials

> If you don't have a Hedera Hashgraph Testnet account you can create one [here](https://portal.hedera.com/register).

The Hedera Connector uses an Account's information (Account Id, Hedera Public Key and Hedera Private Key) and Crystals-Kyber key pair to perform transactions and queries on the network. To boostrap your Hedera Connector with your information, you need to fill in the secret `chart/templates/secrets/credentials.yaml`.

You can find your Hedera Account information [in the Hedera Portal](https://portal.hedera.com) - use the DER-encoded keys.
You can create the necessary Crystals-Kyber private and public keys by running:

```bash
npm run generateKyberKeys
```

This will output the public and private keys in base64 encoding. 

> **Warning**
> If you want to contribute to this repository and you have filled in the credentials secret, make sure to remove it from the worktree so you don't accidentally push your data:
> ```bash
> git update-index --skip-worktree chart/templates/secrets/credentials.yaml
> ```


## Installation

To deploy the Hedera Connector locally run:

```bash
npm run buildDockerImage
npm run push
npm run start
```

## Removal

To remove the Hedera Connector, run:

```bash
npm run stop
```