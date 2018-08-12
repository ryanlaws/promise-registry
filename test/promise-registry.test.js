const promiseRegistry = require("../promise-registry");

describe("promiseRegistry", () => {
    it("provides a makeRegistry() function", () => {
        expect(typeof promiseRegistry.makeRegistry).toBe('function');
    });

    it("provides a once() function", () => {
        expect(typeof promiseRegistry.once).toBe('function');
    });

    it("provides a register() function", () => {
        expect(typeof promiseRegistry.register).toBe('function');
    });
});

const { once } = promiseRegistry;
describe("once", () => {
    it("returns registered promise", () => {
        const registered = register('sparrow', Promise.resolve("A small bird"));
        const retrieved = once('sparrow');

        expect(retrieved).toEqual(registered);
    });

    it("returns a promise even if not registered", () => {
        const promise = once('ocelot');

        expect(promise instanceof Promise).toBe(true);
    });

    it("returns same promise for same name", () => {
        const retrieved1 = once('guppy');
        const retrieved2 = once('guppy');

        expect(retrieved1).toEqual(retrieved2);
    })

    it("resolves with registered promise", async () => {
        const waiting = once('hawk');
        register('hawk', Promise.resolve("Bird of prey"));

        const capitalized = (await waiting).toUpperCase();

        expect(capitalized).toEqual("BIRD OF PREY");
    });

    it("resolves all with registered promise", async () => {
        const append = y => x => x + y;
        const calm = once('rabbit').then(append('.'));
        const excited = once('rabbit').then(append('!!!'));
        register('rabbit', Promise.resolve("Warm and fuzzy"));
        const confused = once('rabbit').then(append('?'));

        expect(await calm).toEqual("Warm and fuzzy.");
        expect(await excited).toEqual("Warm and fuzzy!!!");
        expect(await confused).toEqual("Warm and fuzzy?");
    });
});

const { register } = promiseRegistry;
describe("register", () => {
    it("adds promise to registry, allowing retrieval", async () => {
        register('eel', Promise.resolve("Snake-like sea creature"));
        const capitalized = (await once('eel')).toUpperCase();

        expect(capitalized).toEqual("SNAKE-LIKE SEA CREATURE");
    });

    it("throws if name is invalid", () => {
        expect(() => {
            register(null, Promise.resolve("nothing"));
        }).toThrow();
    })

    it("throws if promise is invalid", () => {
        expect(() => {
            register("duck", null);
        }).toThrow();
    })

    it("throws if promise already registered", () => {
        register('bear', Promise.resolve("Large mammal"));

        expect(() => {
            register('bear', Promise.resolve("Has fangs and claws"));
        }).toThrow();
    });
});

const { makeRegistry } = promiseRegistry;
describe("makeRegistry", () => {
    const defaultOnce = once;
    const defaultRegister = register;

    const newRegistry = makeRegistry();

    it("creates new promise registry with distinct once and register", () => {
        expect(typeof newRegistry.once).toBe('function');
        expect(typeof newRegistry.register).toBe('function');

        expect(newRegistry.once).not.toEqual(defaultOnce);
        expect(newRegistry.register).not.toEqual(defaultRegister);
    });

    it("has register() that does not collide with default", () => {
        defaultRegister("planets", Promise.resolve(9));
        expect(() => {
            newRegistry.register("planets", Promise.resolve(10));
        }).not.toThrow();
    });

    it("has register() and once() that use its own registry", async () => {
        const spider = makeRegistry();
        const beetle = makeRegistry();
        const dog = makeRegistry();
        const human = makeRegistry();
        defaultRegister("legs", Promise.resolve("Move around"));

        expect(() => {
            spider.register("legs", Promise.resolve(8));
        }).not.toThrow();
        expect(() => {
            beetle.register("legs", Promise.resolve(6));
        }).not.toThrow();
        expect(() => {
            dog.register("legs", Promise.resolve(4));
        }).not.toThrow();
        expect(() => {
            human.register("legs", Promise.resolve(2));
        }).not.toThrow();

        expect(await spider.once("legs")).toBe(8);
        expect(await beetle.once("legs")).toBe(6);
        expect(await dog.once("legs")).toBe(4);
        expect(await human.once("legs")).toBe(2);
    });
});