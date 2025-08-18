/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */
import { ExtendedIterable, ReadOnlyCollectionBase } from '@tsdotnet/collection-base';
export type KeyValuePair<TKey, TValue> = {
    readonly key: TKey;
    value: TValue;
};
export declare abstract class OrderedRegistryBase<TKey, TValue> extends ReadOnlyCollectionBase<KeyValuePair<TKey, TValue>> {
    private readonly _entries;
    private readonly _listInternal;
    protected constructor();
    private _keys?;
    private _values?;
    get keys(): ExtendedIterable<TKey>;
    get values(): ExtendedIterable<TValue>;
    private _reversed?;
    get reversed(): ExtendedIterable<KeyValuePair<TKey, TValue>>;
    get version(): number;
    assertVersion(version: number): true | never;
    incrementVersion(): number;
    clear(): number;
    dispose(): void;
    getCount(): number;
    get isEmpty(): boolean;
    contains(entry: KeyValuePair<TKey, TValue>): boolean;
    has(key: TKey): boolean;
    get(key: TKey): TValue | undefined;
    protected _addInternal(key: TKey, value: TValue): this;
    protected _setInternal(key: TKey, value: TValue): boolean;
    remove(key: TKey): TValue | undefined;
    takeFirst(): KeyValuePair<TKey, TValue> | undefined;
    takeLast(): KeyValuePair<TKey, TValue> | undefined;
    getFirstKeyOf(value: TValue): TKey | undefined;
    protected _getIterator(): Iterator<KeyValuePair<TKey, TValue>>;
}
export default class OrderedRegistry<TKey, TValue> extends OrderedRegistryBase<TKey, TValue> {
    constructor();
    add(key: TKey, value: TValue): this;
    set(key: TKey, value: TValue): boolean;
    register(key: TKey, value: TValue): boolean;
}
export declare class OrderedAutoRegistry<T> extends OrderedRegistryBase<number, T> {
    private _lastId;
    constructor();
    add(value: T): number;
    register(value: T): number;
    addEntry(factory: (id: number) => T): T;
}
