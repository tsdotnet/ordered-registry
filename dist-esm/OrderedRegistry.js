/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { ExtendedIterable } from '@tsdotnet/collection-base';
import ReadOnlyCollectionBase from '@tsdotnet/collection-base/dist/ReadOnlyCollectionBase';
import areEqual from '@tsdotnet/compare/dist/areEqual';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import { LinkedNodeList } from '@tsdotnet/linked-node-list';
/**
 * A collection for registering values by key.
 */
export default class OrderedRegistry extends ReadOnlyCollectionBase {
    constructor() {
        super();
        this._entries = new Map();
        this._listInternal = new LinkedNodeList();
    }
    /**
     * Returns an in-order iterable of all keys.
     */
    get keys() {
        const _ = this;
        return _._keys || (_._keys = Object.freeze(ExtendedIterable.create({
            *[Symbol.iterator]() {
                for (const n of _._listInternal)
                    yield n.key;
            }
        })));
    }
    /**
     * Iterable for iterating this collection in reverse order.
     * @return {Iterable}
     */
    get reversed() {
        const _ = this;
        return (_._reversed || (_._reversed = Object.freeze(ExtendedIterable.create({
            *[Symbol.iterator]() {
                for (const n of _._listInternal.reversed)
                    yield copy(n);
            }
        }))));
    }
    /**
     * The version number used to track changes.
     * @returns {number}
     */
    get version() {
        return this._listInternal.version;
    }
    /**
     * Throws if the provided version does not match the current one.
     * @param {number} version
     * @returns {boolean}
     */
    assertVersion(version) {
        return this._listInternal.assertVersion(version);
    }
    /**
     * Increments the collection version.
     * Useful for tracking changes.
     * @return {number} The new version.
     */
    incrementVersion() {
        return this._listInternal.incrementVersion();
    }
    /**
     * Clears all entries.
     * @return {number} The number entries cleared.
     */
    clear() {
        this._entries.clear();
        return this._listInternal.clear();
    }
    /**
     * Clears the collection.
     * Provided for compatibility with disposal routines.
     */
    dispose() {
        this.clear();
    }
    /**
     * Gets the number of nodes in the list.
     * @return {number}
     */
    getCount() {
        return this._listInternal.unsafeCount;
    }
    /**
     * Returns true if the key exists and the value matches exactly.
     * @param entry
     * @returns {boolean}
     */
    contains(entry) {
        var _a;
        if (!entry)
            return false;
        const e = this._entries, key = entry.key;
        if (!e.has(key))
            return false;
        return ((_a = e.get(key)) === null || _a === void 0 ? void 0 : _a.value) === entry.value;
    }
    /**
     * Returns true
     * @param {TKey} key
     * @return {boolean}
     */
    has(key) {
        return this._entries.has(key);
    }
    /**
     * Returns the value if it exists.  Otherwise undefined.
     * @param {TKey} key
     * @return {TValue | undefined}
     */
    get(key) {
        var _a;
        return (_a = this._entries.get(key)) === null || _a === void 0 ? void 0 : _a.value;
    }
    /**
     * Updates or adds a value.
     * @param {TKey} key
     * @param {TValue} value
     * @return {boolean} True if the value was added or changed.  False if no change.
     */
    set(key, value) {
        const node = this._entries.get(key);
        if (node) {
            const old = node.value;
            if (areEqual(old, value))
                return false;
            node.value = value;
        }
        else {
            this.add(key, value);
        }
        return true;
    }
    /**
     * Add an entry to the end of the registry.
     * @throws If key is null.
     * @throws If key already exists.
     * @param {TKey} key
     * @param {TValue} value
     * @return {this}
     */
    add(key, value) {
        if (key == null)
            throw new ArgumentNullException('key');
        if (this._entries.has(key))
            throw new ArgumentException('key', 'An element with the same key already exists ');
        const node = {
            key: key,
            value: value
        };
        this._entries.set(key, node);
        this._listInternal.addNode(node);
        return this;
    }
    /**
     * Removes an entry and returns its value if found.
     * @param key
     */
    remove(key) {
        const e = this._entries;
        if (key == null || !e.has(key))
            return undefined;
        const node = e.get(key);
        e.delete(key);
        if (!node)
            return undefined;
        this._listInternal.removeNode(node);
        return node.value;
    }
    /**
     * Removes the first node and returns its value.
     */
    takeFirst() {
        var _a;
        const key = (_a = this._listInternal.first) === null || _a === void 0 ? void 0 : _a.key;
        if (key === undefined)
            return undefined;
        const value = this.remove(key);
        return { key, value };
    }
    /**
     * Removes the last node and returns its value.
     */
    takeLast() {
        var _a;
        const key = (_a = this._listInternal.last) === null || _a === void 0 ? void 0 : _a.key;
        if (key === undefined)
            return undefined;
        const value = this.remove(key);
        return { key, value };
    }
    /**
     * Finds the entry and returns its Id.
     * @param value
     */
    getFirstKeyOf(value) {
        for (const n of this._listInternal) {
            if (areEqual(value, n.value))
                return n.key;
        }
        return undefined;
    }
    /**
     * Adds an entry to the registry if it doesn't exist.
     * Returns true if the key did not exist and the entry was added.
     * Returns false if the key already exists.
     * @param {TKey} key
     * @param {TValue} value
     * @return {boolean}
     */
    register(key, value) {
        if (this._entries.has(key))
            return false;
        this.add(key, value);
        return true;
    }
    *_getIterator() {
        for (const n of this._listInternal)
            yield copy(n);
    }
}
export class OrderedAutoRegistry extends OrderedRegistry {
    constructor() {
        super(...arguments);
        this._lastId = 0 | 0;
    }
    /**
     * Not supported.  Use `.addValue(value: T): number` instead.
     * @throws
     * @param {TKey} id
     * @param {TValue} value
     * @return {this}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    add(id, value) {
        throw new Error('Directly adding an ID to an OrderedAutoRegistry is not supported.');
    }
    /**
     * Adds an entry and returns the ID generated for it.
     * @param {T} value
     * @return {number}
     */
    addValue(value) {
        const newId = this._lastId++;
        super.add(newId, value);
        return newId;
    }
    /**
     * Generates an Id before passing it to the handler.
     * The value returned from the handler is used to add to the registry and returned as the result.
     * @param factory
     */
    addEntry(factory) {
        const newId = this._lastId++;
        const value = factory(newId);
        super.add(newId, value);
        return value;
    }
}
function copy(kvp) {
    return { key: kvp.key, value: kvp.value };
}
//# sourceMappingURL=OrderedRegistry.js.map