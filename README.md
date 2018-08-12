# promise-registry 
promise-registry creates a registry (a la AMD) of promises to which promises
can be registered and from which promises can be obtained. It creates a
default registry which can be used right away with the exported `once` and
`register` functions.

New registries can be created with `makeRegistry` and will have their own
separate `once` and `register` functions.

## Why?
Sometimes you need to depend on asynchronous behavior but it isn't convenient
to pass promises around as values. As long as modules use the same registry
and the same name, they get the same promise. Also, being able to get a
promise by name before it is registered removes the need to coordinate the
creation of that promise. 

This can be particularly useful for asynchronous dependencies during e.g.
initialization. Steps are named, and dependencies and dependents can be
declared separately and loaded in the correct order as long as they share the
registry.

## Installation

Via [npm](https://www.npmjs.com/):

```bash
npm install promise-registry --save
```

In [Node.js](https://nodejs.org/):

```js
const promiseRegistry = require('promise-registry');
```

## Usage
```javascript
const promiseRegistry = require('promise-registry');

const config = require('./config.js');
const userInput = require('./user-input.js');

// Example functions 
const callApi = async (url) => {
    return fetch(url).then(response => response.json())
}

const getRecords = ([response, keysToGet]) => {
    let records = [];
    keysToGet.forEach(key => {
        records[key] = response[key];
    });
    return records;
}

// Make a new registry
const initialization = promiseRegistry.makeRegistry();

// Register a new promise
initialization.register('api-response', callApi(config.getApiUrl()));

// Get a registered promise
const apiResponse = initialization.once('api-response');

// Get a promise that isn't registered yet
const keysToGet = initialization.once('user-selected-keys');

// Call once resolved
Promise.all([apiResponse, keysToGet]).then(getRecords);

// Register a promise by a name that's already depended on
initialization.register('user-selected-keys', userInput.selectResponseKeys());
```

## API

### `promiseRegistry.once(promiseName)`
Get promise registered with `promiseName`. Can use before registration.

### `promiseRegistry.register(promiseName, promise)`
Register `promise` with `promiseName`.

### `promiseRegistry.makeRegistry()`
Create new registry with own `once()` and `register()` functions.
