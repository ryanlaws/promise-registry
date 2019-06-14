# promise-registry 
A global registry of promises, and a factory for registries. 

With a registry you can:
- Register promises (with `register`)
- Obtain registered promises (with `once`)
- Obtain promises that aren't registered yet (with `once`)

To use the global registry, use `once` and `register`.

Create a new registry with `makeRegistry`. It will have its own `once` and
`register` functions.

## OK, so what?
This lets you:
- Give promises a global name
- Treat promises like events
- Wait for promises that haven't even been made yet
- Use a promise in a completely different place from where it is generated,
    without the plumbing to pass it around

## I don't like bullet points. Talk to me.
Sometimes you need to depend on asynchronous behavior but it isn't convenient
to pass promises around as values. As long as modules use the same registry
and the same name, they get the same promise. Also, being able to get a
promise by name before it is registered removes the need to coordinate the
creation of that promise. 

This can be particularly useful for asynchronous dependencies during e.g.
initialization. 

Steps have names. 
### init.js
```javascript
const { register, once } = require('promise-registry');
const appSettings = require ('./app-settings.js');
const cookies = require ('./cookies.js');

// init/app-settings-loaded is used in ui.js but registered here.
register('init/app-settings-loaded', appSettings.load());

// init/cookies-accepted is registered in ui.js but used here.
const cookiesInitialized = once('init/cookies-accepted').then(cookies.init);
register('init/cookies-initialized', cookiesInitialized);
```

Dependencies and dependents can be declared separately. 

### ui.js

```javascript
const { register, once } = require('promise-registry');
const userMessage = require('./user-message.js');
const loadUserSettings = require('./user-settings.js');

// init/cookies-accepted is used in init.js but registered here.
register('init/cookies-accepted', userMessage.waitForAcceptCookies());

// init/cookies-initialized and init/app-settings-loaded 
//   are registered in init.js but used here.
const userSettingsLoaded = Promise.all([
    once('init/cookies-initialized'),
    once('init/app-settings-loaded')
]).then(([cookies, appSettings]) => loadUserSettings(cookies, appSettings));
```

It's all loaded in the right order as long as the registries (including the
global one) and names match up.

## Installation

Via [npm](https://www.npmjs.com/package/promise-registry):

```bash
npm install promise-registry --save
```

In [Node.js](https://nodejs.org/):

```javascript
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
