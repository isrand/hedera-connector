# Hedera Hashgraph Testnet Connector

This repository contains a NestJS API server to simplify integration with the Hedera Hashgraph Testnet. Its main features are Node multitenancy and an implementation of post-quantum cryptography on top of the public Blockchain layer.

## Table of Contents
1. [Setup](#setup)
   - [Dependencies](#dependencies)
   - [Kubernetes Environment](#kubernetes-environment)
   - [Credentials](#credentials)
     - [Wallet Provider](#wallet-provider)
     - [Hedera Account](#hedera-account)
     - [Public / Private Keys](#public--private-keys)
2. [Installation](#installation)
3. [Removal](#removal)

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

#### Wallet Provider

You can choose to start the Connector with two wallet types: `filesystem` and `couchdb`. To select either, change the `wallet.type` key in the `values.yaml` file in the chart directory.

##### Filesystem

The _filesystem_ wallet type stores all information about the multiple accounts on the node on the path `/opt/wallet` inside of the container. A PersistentVolumeClaim is used to store this data between microservice restarts.

##### CouchDB

The _couchdb_ wallet type stores account information in a collection called `accounts` in the referenced CouchDB instance. By default, when starting the application locally, a CouchDB instance is deployed next to the Hedera Connector pod.

If you want to make use of a managed database service (like IBM Cloudant or Azure CosmosDB) you will have to set the `settings.local` toggle to false in `values.yaml`, specify the database URL (without `username:password`) under `wallet.couchdb.url`, and update the `database-credentials.yaml` secret with the correct username and password for the database.

#### Hedera Account

> If you don't have a Hedera Hashgraph Testnet account you can create one [here](https://portal.hedera.com/register).

The Hedera Connector uses an Account's information (Account Id, Hedera Public Key and Hedera Private Key) and Crystals-Kyber key pair to perform transactions and queries on the network.

You can find your Hedera Account information [in the Hedera Portal](https://portal.hedera.com) - use the DER-encoded keys.

Add your Hedera Account Id, Hedera Public Key and Hedera Private Key in the `values.yaml` file in the `chart` directory.

#### Public / Private Keys

The Hedera Connector uses a set of [Crystals-Kyber](https://pq-crystals.org/kyber/) public / private keys for end-to-end encryption. It makes use of the three key bit sizes: 512, 768, and 1024. Different key sizes are used for flexibility when encrypting data, to reduce the size of the encrypted data and speed up the encryption mechanism.

You can choose to bootstrap the microservice with these keys in two ways:

##### 1. Start the microservice

If you want a quick start you can just run the microservice. It will create the keys on bootstrap and place them in its filesystem.

##### 2. Import your own key(s)

If you already have a set of public / private Crystals-Kyber keys you want to use you can choose to start the microservice with these.
You need to encode in base64 the contents of your keys and place them under the `/chart/artifacts` folder. The names of the files must be

`kyber_<keysize>.priv` and `kyber_<keysize>.pub`

like the following:

```
/chart/artifacts/kyber_512.priv | /chart/artifacts/kyber_512.pub
/chart/artifacts/kyber_768.priv | /chart/artifacts/kyber_768.pub
/chart/artifacts/kyber_1024.priv | /chart/artifacts/kyber_1024.pub
```

The remaining key sizes that can't be found will be automatically generated when the microservice starts.

On the other hand, if you don't have your own set of keys you can run `npm run generateKyberKeys` to create the six files listed above.

## Installation

To deploy the Hedera Connector locally run:

```bash
npm run buildDockerImage
npm run push
npm run start
```

Once the container is up and running you can port forward it through Kubernetes and access the Swagger documentation on http://localhost:4000/swagger. Here you will see a list of endpoints and operations you can perform.

## Removal

To remove the Hedera Connector, run:

```bash
npm run stop
```