function assertNameIsValid(name) {
    if (typeof name !== 'string')
        throw new Error('name is not a string');
}

function assertPromiseIsValid(promise) {
    if (!(promise instanceof Promise))
        throw new Error('promise is not a Promise');
}

function assertPreRegistrationPromiseNonexistent(registry, name) {
    if (!registry[name].resolveOnRegister)
        throw new Error(`promise already registered with name "${name}".`);
}

function registerWithoutPromise(registry, name) {
    let resolveOnRegister;

    let tempPromise = new Promise((resolve) => {
        resolveOnRegister = resolve;
    });

    registry[name] = {
        resolveOnRegister,
        promise: tempPromise
    };

    return tempPromise;
}

function resolvePreRegistrationPromise(registry, name, promise) {
    return promise.then(registry[name].resolveOnRegister);
}

function registerWithPromise(registry, name, promise) {
    if (registry[name]) {
        assertPreRegistrationPromiseNonexistent(registry, name);
        resolvePreRegistrationPromise(registry, name, promise);
    }

    registry[name] = { promise };
    return promise;
}

function makeRegister(registry) {
    return function register(name, promise) {
        assertNameIsValid(name);
        assertPromiseIsValid(promise);
        return registerWithPromise(registry, name, promise);
    }
}

function makeOnce(registry) {
    return function once(name) {
        assertNameIsValid(name);

        if (!registry[name])
            registerWithoutPromise(registry, name);

        return registry[name].promise;
    }
}

const makeRegistry = function () {
    let _registry = {};

    return {
        register: makeRegister(_registry),
        once: makeOnce(_registry)
    };
}

const defaultRegistry = makeRegistry();
const promiseRegistry = { ...defaultRegistry, makeRegistry };
module.exports = promiseRegistry;
