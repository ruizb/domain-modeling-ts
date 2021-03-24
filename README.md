# Domain modeling in TypeScript

After watching the talk ["Domain Modeling Made Functional" from Scott Wlaschin](https://fsharpforfunandprofit.com/ddd/), I got inspired to write a series of articles about Domain Driven Design (DDD for short) in TypeScript. Since this talk is about DDD using Functional Programming (FP), I chose to use the [fp-ts](https://github.com/gcanti/fp-ts/) ecosystem because, as far as I know, it's the most mature FP stack in TypeScript.

The articles are available on [dev.to](https://dev.to/):

- [Introduction](https://dev.to/ruizb/introduction-961)
- [The domain and some concepts](https://dev.to/ruizb/the-domain-and-some-concepts-3ene)
- [Using fp-ts and newtype-ts: types](https://dev.to/ruizb/using-fp-ts-and-newtype-ts-types-em8)
- [Using fp-ts and newtype-ts: implementation](https://dev.to/ruizb/using-fp-ts-and-newtype-ts-implementation-422a)
- [Using fp-ts and io-ts: types and implementation](https://dev.to/ruizb/using-fp-ts-and-io-ts-types-and-implementation-1k6a)

## Requirements

This project was built using Node v15.2 and npm v7. If you have **nvm**, you can use the `nvm use` command at the root of the project.

## Install

```sh
npm ci
```

## Run

To run the code that uses the first method ([fp-ts](https://github.com/gcanti/fp-ts/) + [newtype-ts](https://github.com/gcanti/newtype-ts/)), you can use the following command:

```sh
npm run run-method-1
```

To run the code of the second method ([fp-ts](https://github.com/gcanti/fp-ts/) + [io-ts](https://github.com/gcanti/io-ts/)), you can run:

```sh
npm run run-method-2
```
