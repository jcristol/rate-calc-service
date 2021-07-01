# rate-calc-service

Express server written in Typescript calculates payout data for hourly workers.

## Setup Local Environment

In order to run and develop the project make sure you have these tools installed.

### Docker

- follow the installation instructions at [docker.com](https://docs.docker.com/get-docker/)

### Node 14+

- highly recommend installing nodejs with a package manager For example installing node on OSX with brew is just a single command

```bash
brew install node
```

- alternatively you can install nodejs if you follow the install steps on their [website](https://nodejs.org/en/download/)

### Yarn

- once nodejs is installed you can install yarn with

```bash
npm install --global yarn
```

## Run Docker

```bash
docker build -t rate-calc-service .
docker run -it -p 3000:3000 rate-calc-service
```

## Run Locally

### Install Dependencies

```bash
yarn install
```

### Run

```bash
yarn start
```