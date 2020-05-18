/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { ExtendedIterable } from '@tsdotnet/collection-base';
import ReadOnlyCollectionBase from '@tsdotnet/collection-base/dist/ReadOnlyCollectionBase';
declare type KeyValuePair<TKey, TValue> = {
    key: TKey;
    value: TValue;
};
/**
 * A collection for registering values by key.
 */
export default class OrderedRegistry<TKey, TValue> extends ReadOnlyCollectionBase<KeyValuePair<TKey, TValue>> {
    private readonly _entries;
    private readonly _listInternal;
    constructor();
    private _keys?;
    /**
     * Returns an in-order iterable of all keys.
     */
    get keys(): Readonly<ExtendedIterable<TKey>>;
    private _reversed?;
    /**
     * Iterable for iterating this collection in reverse order.
     * @return {Iterable}
     */
    get reversed(): ExtendedIterable<KeyValuePair<TKey, TValue>>;
    /**
     * The version number used to track changes.
     * @returns {number}
     */
    get version(): number;
    /**
     * Throws if the provided version does not match the current one.
     * @param {number} version
     * @returns {boolean}
     */
    assertVersion(version: number): true | never;
    /**
     * Increments the collection version.
     * Useful for tracking changes.
     * @return {number} The new version.
     */
    incrementVersion(): number;
    /**
     * Clears all entries.
     * @return {number} The number entries cleared.
     */
    clear(): number;
    /**
     * Clears the collection.
     * Provided for compatibility with disposal routines.
     */
    dispose(): void;
    /**
     * Gets the number of nodes in the list.
     * @return {number}
     */
    getCount(): number;
    /**
     * Returns true if the key exists and the value matches exactly.
     * @param entry
     * @returns {boolean}
     */
    contains(entry: KeyValuePair<TKey, TValue>): boolean;
    /**
     * Returns true
     * @param {TKey} key
     * @return {boolean}
     */
    has(key: TKey): boolean;
    /**
     * Add an entry to the end of the registry.
     * @throws If key is null.
     * @throws If key already exists.
     * @param {TKey} key
     * @param {TValue} value
     * @return {this}
     */
    add(key: TKey, value: TValue): this;
    /**
     * Removes an entry and returns its value if found.
     * @param key
     */
    remove(key: TKey): TValue | undefined;
    /**
     * Removes the first node and returns its value.
     */
    takeFirst(): KeyValuePair<TKey, TValue> | undefined;
    /**
     * Removes the last node and returns its value.
     */
    takeLast(): KeyValuePair<TKey, TValue> | undefined;
    /**
     * Finds the entry and returns its Id.
     * @param value
     */
    getFirstKeyOf(value: TValue): TKey | undefined;
    /**
     * Adds an entry to the registry if it doesn't exist.
     * Returns true if the key did not exist and the entry was added.
     * Returns false if the key already exists.
     * @param {TKey} key
     * @param {TValue} value
     * @return {boolean}
     */
    register(key: TKey, value: TValue): boolean;
    protected _getIterator(): Iterator<KeyValuePair<TKey, TValue>>;
}
export declare class OrderedAutoRegistry<T> extends OrderedRegistry<number, T> {
    private _lastId;
    /**
     * Not supported.  Use `.addValue(value: T): number` instead.
     * @throws
     * @param {TKey} id
     * @param {TValue} value
     * @return {this}
     */
    add(id: number, value: T): never;
    /**
     * Adds an entry and returns the ID generated for it.
     * @param {T} value
     * @return {number}
     */
    addValue(value: T): number;
    /**
     * Generates an Id before passing it to the handler.
     * The value returned from the handler is used to add to the registry and returned as the result.
     * @param factory
     */
    addEntry(factory: (id: number) => T): T;
}
export {};
