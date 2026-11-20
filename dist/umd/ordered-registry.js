(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tsdotnet/collection-base'), require('@tsdotnet/compare'), require('@tsdotnet/exceptions'), require('@tsdotnet/linked-node-list')) :
    typeof define === 'function' && define.amd ? define(['exports', '@tsdotnet/collection-base', '@tsdotnet/compare', '@tsdotnet/exceptions', '@tsdotnet/linked-node-list'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.tsdotnet = global.tsdotnet || {}, global.tsdotnet.orderedRegistry = global.tsdotnet.orderedRegistry || {}), global.tsdotnet.collectionBase, global.tsdotnet.compare, global.tsdotnet.exceptions, global.tsdotnet.linkedNodeList));
})(this, (function (exports, collectionBase, compare, exceptions, linkedNodeList) { 'use strict';

    /*!
     * @author electricessence / https://github.com/electricessence/
     * Licensing: MIT
     */
    class OrderedRegistryBase extends collectionBase.ReadOnlyCollectionBase {
        _entries;
        _listInternal;
        constructor() {
            super();
            this._entries = new Map();
            this._listInternal = new linkedNodeList.LinkedNodeList();
        }
        _keys;
        _values;
        get keys() {
            const _ = this;
            return (_._keys || (_._keys = Object.freeze(collectionBase.ExtendedIterable.create({
                *[Symbol.iterator]() {
                    for (const n of _._listInternal)
                        yield n.key;
                }
            }))));
        }
        get values() {
            const _ = this;
            return (_._values || (_._values = Object.freeze(collectionBase.ExtendedIterable.create({
                *[Symbol.iterator]() {
                    for (const n of _._listInternal)
                        yield n.value;
                }
            }))));
        }
        _reversed;
        get reversed() {
            const _ = this;
            return (_._reversed || (_._reversed = Object.freeze(collectionBase.ExtendedIterable.create({
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
            if (!entry)
                return false;
            const e = this._entries, key = entry.key;
            if (!e.has(key))
                return false;
            return e.get(key)?.value === entry.value;
        }
        has(key) {
            return this._entries.has(key);
        }
        get(key) {
            return this._entries.get(key)?.value;
        }
        _addInternal(key, value) {
            if (key == null)
                throw new exceptions.ArgumentNullException('key');
            if (this._entries.has(key))
                throw new exceptions.ArgumentException('key', 'An element with the same key already exists ');
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
                if (compare.areEqual(old, value))
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
            const key = this._listInternal.first?.key;
            if (key === undefined)
                return undefined;
            const value = this.remove(key);
            return { key, value };
        }
        takeLast() {
            const key = this._listInternal.last?.key;
            if (key === undefined)
                return undefined;
            const value = this.remove(key);
            return { key, value };
        }
        getFirstKeyOf(value) {
            for (const n of this._listInternal) {
                if (compare.areEqual(value, n.value))
                    return n.key;
            }
            return undefined;
        }
        *_getIterator() {
            for (const n of this._listInternal)
                yield copy(n);
        }
    }
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
    class OrderedAutoRegistry extends OrderedRegistryBase {
        _lastId = 0 | 0;
        constructor() {
            super();
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
    function copy(kvp) {
        return { key: kvp.key, value: kvp.value };
    }

    exports.OrderedAutoRegistry = OrderedAutoRegistry;
    exports.OrderedRegistryBase = OrderedRegistryBase;
    exports.default = OrderedRegistry;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=ordered-registry.js.map
