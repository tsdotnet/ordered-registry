"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderedAutoRegistry = exports.OrderedRegistryBase = void 0;
const tslib_1 = require("tslib");
const collection_base_1 = require("@tsdotnet/collection-base");
const ReadOnlyCollectionBase_1 = tslib_1.__importDefault(require("@tsdotnet/collection-base/dist/ReadOnlyCollectionBase"));
const areEqual_1 = tslib_1.__importDefault(require("@tsdotnet/compare/dist/areEqual"));
const ArgumentException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentException"));
const ArgumentNullException_1 = tslib_1.__importDefault(require("@tsdotnet/exceptions/dist/ArgumentNullException"));
const linked_node_list_1 = require("@tsdotnet/linked-node-list");
/**
 * A collection for registering values by key.
 * This base class is intended to facilitate specialized control.
 * Sub-classes control how items are added.
 */
class OrderedRegistryBase extends ReadOnlyCollectionBase_1.default {
    constructor() {
        super();
        this._entries = new Map();
        this._listInternal = new linked_node_list_1.LinkedNodeList();
    }
    /**
     * Returns an in-order iterable of all keys.
     */
    get keys() {
        const _ = this;
        return (_._keys || (_._keys = Object.freeze(collection_base_1.ExtendedIterable.create({
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
        return (_._values || (_._values = Object.freeze(collection_base_1.ExtendedIterable.create({
            *[Symbol.iterator]() {
                for (const n of _._listInternal)
                    yield n.value;
            }
        }))));
    }
    /**
     * Iterable for iterating this collection in reverse order.
     * @return {Iterable}
     */
    get reversed() {
        const _ = this;
        return (_._reversed || (_._reversed = Object.freeze(collection_base_1.ExtendedIterable.create({
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
     * Add an entry to the end of the registry.
     * @throws If key is null.
     * @throws If key already exists.
     * @param {TKey} key
     * @param {TValue} value
     * @return {this}
     */
    _addInternal(key, value) {
        if (key == null)
            throw new ArgumentNullException_1.default('key');
        if (this._entries.has(key))
            throw new ArgumentException_1.default('key', 'An element with the same key already exists ');
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
            if ((0, areEqual_1.default)(old, value))
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
            if ((0, areEqual_1.default)(value, n.value))
                return n.key;
        }
        return undefined;
    }
    *_getIterator() {
        for (const n of this._listInternal)
            yield copy(n);
    }
}
exports.OrderedRegistryBase = OrderedRegistryBase;
class OrderedRegistry extends OrderedRegistryBase {
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
exports.default = OrderedRegistry;
class OrderedAutoRegistry extends OrderedRegistryBase {
    constructor() {
        super();
        this._lastId = 0 | 0;
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
exports.OrderedAutoRegistry = OrderedAutoRegistry;
function copy(kvp) {
    return { key: kvp.key, value: kvp.value };
}
//# sourceMappingURL=OrderedRegistry.js.map