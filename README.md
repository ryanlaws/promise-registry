# promise-registry 
promise-registry creates a registry of promises to which promises can be
registered and from which promises can be obtained. It creates a default
registry which can be used right away with the exported `once` and `register`
functions.

New registries can be created with `makeRegistry` and will have their own
separate `once` and `register` functions.

## Installation

Via [npm](https://www.npmjs.com/):

```bash
npm install promise-registry --save
```

In [Node.js](https://nodejs.org/):

```js
const promiseRegistry = require('promise-registry');
```

## API

### `promiseRegistry.once(promiseName)`
Get promise registered with `promiseName`. Can use before registration.

### `promiseRegistry.register(promiseName, promise)`
Register `promise` with `promiseName`.

### `promiseRegistry.makeRegistry()`
Create new registry with own once() and register() functions.
