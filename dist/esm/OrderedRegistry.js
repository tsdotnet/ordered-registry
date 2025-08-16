/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { ExtendedIterable, ReadOnlyCollectionBase } from '@tsdotnet/collection-base';
import { areEqual } from '@tsdotnet/compare';
import { ArgumentException, ArgumentNullException } from '@tsdotnet/exceptions';
import { LinkedNodeList } from '@tsdotnet/linked-node-list';
/**
 * A collection for registering values by key.
 * This base class is intended to facilitate specialized control.
 * Sub-classes control how items are added.
 */
export class OrderedRegistryBase extends ReadOnlyCollectionBase {
    _entries;
    _listInternal;
    constructor() {
        super();
        this._entries = new Map();
        this._listInternal = new LinkedNodeList();
    }
    _keys;
    _values;
    /**
     * Returns an in-order iterable of all keys.
     */
    get keys() {
        const _ = this;
        return (_._keys || (_._keys = Object.freeze(ExtendedIterable.create({
            *[Symbol.iterator]() {
                for (const n of _._listInternal)
                    yield n.key;
            }
        }))));
    }
    /**
     * Returns an in-order iterable of all values.
     */
    get values() {
        const _ = this;
        return (_._values || (_._values = Object.freeze(ExtendedIterable.create({
            *[Symbol.iterator]() {
                for (const n of _._listInternal)
                    yield n.value;
            }
        }))));
    }
    _reversed;
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
     * Gets the number of entries.
     * @return {number}
     */
    getCount() {
        return this._listInternal.unsafeCount;
    }
    /**
     * Returns true if there are no entries.
     * @return {boolean}
     */
    get isEmpty() {
        return !this._listInternal.unsafeCount;
    }
    /**
     * Returns true if the key exists and the value matches exactly.
     * @param entry
     * @returns {boolean}
     */
    contains(entry) {
        if (!entry)
            return false;
        const e = this._entries, key = entry.key;
        if (!e.has(key))
            return false;
        return e.get(key)?.value === entry.value;
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
        return this._entries.get(key)?.value;
    }
    /**
     * Add an entry to the end of the registry.
     * @throws If key is null.
     * @throws If key already exists.
     * @param {TKey} key
     * @param {TValue} value
     * @return {this}
     */
    _addInternal(key, value) {
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
     * Updates or adds a value.
     * @param {TKey} key
     * @param {TValue} value
     * @return {boolean} True if the value was added or changed.  False if no change.
     */
    _setInternal(key, value) {
        const node = this._entries.get(key);
        if (node) {
            const old = node.value;
            if (areEqual(old, value))
                return false;
            node.value = value;
        }
        else {
            this._addInternal(key, value);
        }
        return true;
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
        const key = this._listInternal.first?.key;
        if (key === undefined)
            return undefined;
        const value = this.remove(key);
        return { key, value };
    }
    /**
     * Removes the last node and returns its value.
     */
    takeLast() {
        const key = this._listInternal.last?.key;
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
    *_getIterator() {
        for (const n of this._listInternal)
            yield copy(n);
    }
}
export default class OrderedRegistry extends OrderedRegistryBase {
    constructor() {
        super();
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
        return this._addInternal(key, value);
    }
    /**
     * Updates or adds a value.
     * @param {TKey} key
     * @param {TValue} value
     * @return {boolean} True if the value was added or changed.  False if no change.
     */
    set(key, value) {
        return super._setInternal(key, value);
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
        if (this.has(key))
            return false;
        this._addInternal(key, value);
        return true;
    }
}
export class OrderedAutoRegistry extends OrderedRegistryBase {
    _lastId = 0 | 0;
    constructor() {
        super();
    }
    /**
     * Adds an entry and returns the ID generated for it.
     * @param {T} value
     * @return {number}
     */
    add(value) {
        const newId = ++this._lastId;
        this._addInternal(newId, value);
        return newId;
    }
    /**
     * Adds an entry to the registry if it doesn't exist.
     * @param {T} value
     * @return {boolean} The id of the entry.
     */
    register(value) {
        for (const id of this.keys)
            if (this.get(id) === value)
                return id;
        return this.add(value);
    }
    /**
     * Generates an Id before passing it to the handler.
     * The value returned from the handler is used to add to the registry and returned as the result.
     * @param factory
     */
    addEntry(factory) {
        const newId = ++this._lastId;
        const value = factory(newId);
        this._addInternal(newId, value);
        return value;
    }
}
function copy(kvp) {
    return { key: kvp.key, value: kvp.value };
}
//# sourceMappingURL=OrderedRegistry.js.map