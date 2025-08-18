"use strict";
/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderedAutoRegistry = exports.OrderedRegistryBase = void 0;
const collection_base_1 = require("@tsdotnet/collection-base");
const compare_1 = require("@tsdotnet/compare");
const exceptions_1 = require("@tsdotnet/exceptions");
const linked_node_list_1 = require("@tsdotnet/linked-node-list");
class OrderedRegistryBase extends collection_base_1.ReadOnlyCollectionBase {
    constructor() {
        super();
        this._entries = new Map();
        this._listInternal = new linked_node_list_1.LinkedNodeList();
    }
    get keys() {
        const _ = this;
        return (_._keys || (_._keys = Object.freeze(collection_base_1.ExtendedIterable.create({
            *[Symbol.iterator]() {
                for (const n of _._listInternal)
                    yield n.key;
            }
        }))));
    }
    get values() {
        const _ = this;
        return (_._values || (_._values = Object.freeze(collection_base_1.ExtendedIterable.create({
            *[Symbol.iterator]() {
                for (const n of _._listInternal)
                    yield n.value;
            }
        }))));
    }
    get reversed() {
        const _ = this;
        return (_._reversed || (_._reversed = Object.freeze(collection_base_1.ExtendedIterable.create({
            *[Symbol.iterator]() {
                for (const n of _._listInternal.reversed)
                    yield copy(n);
            }
        }))));
    }
    get version() {
        return this._listInternal.version;
    }
    assertVersion(version) {
        return this._listInternal.assertVersion(version);
    }
    incrementVersion() {
        return this._listInternal.incrementVersion();
    }
    clear() {
        this._entries.clear();
        return this._listInternal.clear();
    }
    dispose() {
        this.clear();
    }
    getCount() {
        return this._listInternal.unsafeCount;
    }
    get isEmpty() {
        return !this._listInternal.unsafeCount;
    }
    contains(entry) {
        var _a;
        if (!entry)
            return false;
        const e = this._entries, key = entry.key;
        if (!e.has(key))
            return false;
        return ((_a = e.get(key)) === null || _a === void 0 ? void 0 : _a.value) === entry.value;
    }
    has(key) {
        return this._entries.has(key);
    }
    get(key) {
        var _a;
        return (_a = this._entries.get(key)) === null || _a === void 0 ? void 0 : _a.value;
    }
    _addInternal(key, value) {
        if (key == null)
            throw new exceptions_1.ArgumentNullException('key');
        if (this._entries.has(key))
            throw new exceptions_1.ArgumentException('key', 'An element with the same key already exists ');
        const node = {
            key: key,
            value: value
        };
        this._entries.set(key, node);
        this._listInternal.addNode(node);
        return this;
    }
    _setInternal(key, value) {
        const node = this._entries.get(key);
        if (node) {
            const old = node.value;
            if ((0, compare_1.areEqual)(old, value))
                return false;
            node.value = value;
        }
        else {
            this._addInternal(key, value);
        }
        return true;
    }
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
    takeFirst() {
        var _a;
        const key = (_a = this._listInternal.first) === null || _a === void 0 ? void 0 : _a.key;
        if (key === undefined)
            return undefined;
        const value = this.remove(key);
        return { key, value };
    }
    takeLast() {
        var _a;
        const key = (_a = this._listInternal.last) === null || _a === void 0 ? void 0 : _a.key;
        if (key === undefined)
            return undefined;
        const value = this.remove(key);
        return { key, value };
    }
    getFirstKeyOf(value) {
        for (const n of this._listInternal) {
            if ((0, compare_1.areEqual)(value, n.value))
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
    add(key, value) {
        return this._addInternal(key, value);
    }
    set(key, value) {
        return super._setInternal(key, value);
    }
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
    add(value) {
        const newId = ++this._lastId;
        this._addInternal(newId, value);
        return newId;
    }
    register(value) {
        for (const id of this.keys)
            if (this.get(id) === value)
                return id;
        return this.add(value);
    }
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