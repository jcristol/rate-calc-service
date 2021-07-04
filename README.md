# rate-calc-service

Serverless function written in Typescript calculates payout data for hourly workers.

# Production Urls

## /v1/calculateWorkerHours

```
https://rate-calc-service.vercel.app/v1/calculateWorkerHours
```

## /status

```
https://rate-calc-service.vercel.app/status
```

## Setup Local Environment

To develop the project you will need these tools.

### Node 14+

Highly recommend installing Node 14 with a package manager. 
```bash
brew install node
```
alternatively you can install Node 14 following the install steps on the nodejs [website](https://nodejs.org/en/download/)

### Yarn

install yarn after node is installed

```bash
npm install --global yarn
```

## Run Locally

### Install Dependencies

```bash
yarn install
```

### Run

```bash
yarn dev
```
