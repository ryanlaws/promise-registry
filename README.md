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

## Usage - Default Registry

Using the default registry lets you use the global node module cache to ensure
you're using the same registry across all modules, since the default promise
registry is the same for all. However, if another dependency is using
promise-registry, you may experience name conflicts. Fortunately, any string is
valid as a key, so it is easy to "namespace" your promises, even without a
custom registry.

### app.js
```javascript
const ui = require('./ui.js');
const login = require('./login.js');
const { once } = require('promise-registry');

// "my-app" namespace - you can do this however you want
const { username } = await once('my-app/user-logged-in');
ui.displaySplashScreen(username);
```

### login.js
```javascript
const auth = require('./auth.js');
const loginPromise = auth.loginWithCreds();
register('my-app/user-logged-in', loginPromise);
```

In this example, login.js will be loaded along with app.js and its code will be
run synchronously. But even if that weren't the case (e.g. the dependency were
lazy-loaded) it would still work fine - it doesn't matter whether `register()`
or `once()` is called first.

## Usage - Custom Registry

Using custom registries lets you create a registry specifically for a group of
promises, making promise key naming conflicts less of an issue. However, it's on
you to figure how to get the registry to the promise consumers and providers
using e.g. dependency injection.
```javascript
const promiseRegistry = require('promise-registry');

const config = require('./config.js');
const userInput = require('./user-input.js');
const display = require('./display.js');

// Example functions 
const callApi = async (url) => {
    return fetch(url).then(response => response.json())
}

const getRecords = async ([response, keysToGet]) => {
    let records = [];
    keysToGet.forEach(key => {
        const record = response[key];
        records[key] = record;
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

// Call once both above promises resolve
const recordsToShow = Promise.all([apiResponse, keysToGet]).then(getRecords);

// Register another new promise
initialization.register('records-to-show', recordsToShow);

// Register a promise by a name that's already depended on
initialization.register('user-selected-keys', userInput.selectResponseKeys());

// Call once all promises resolve
initialization.once('records-to-show').then(display.showRecords);
```

## API

### `promiseRegistry.once(promiseName)`
Get promise registered with `promiseName`. Can use before registration.

### `promiseRegistry.register(promiseName, promise)`
Register `promise` with `promiseName`.

### `promiseRegistry.makeRegistry()`
Create new registry with own `once()` and `register()` functions.
