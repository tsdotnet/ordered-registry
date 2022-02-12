/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import {ExtendedIterable} from '@tsdotnet/collection-base';
import ReadOnlyCollectionBase from '@tsdotnet/collection-base/dist/ReadOnlyCollectionBase';
import areEqual from '@tsdotnet/compare/dist/areEqual';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import {LinkedNode, LinkedNodeList} from '@tsdotnet/linked-node-list';
import {ProtectedLinkedNode} from '@tsdotnet/linked-node-list/dist/LinkedListNode';

export type KeyValuePair<TKey, TValue> = {
	readonly key: TKey;
	value: TValue;
};

type Node<TKey, TValue> =
	KeyValuePair<TKey, TValue>
	& LinkedNode<Node<TKey, TValue>>;

type ProtectedNode<TKey, TValue> =
	KeyValuePair<TKey, TValue>
	& ProtectedLinkedNode<Node<TKey, TValue>>;

/**
 * A collection for registering values by key.
 * This base class is intended to facilitate specialized control.
 * Sub-classes control how items are added.
 */
export abstract class OrderedRegistryBase<TKey, TValue>
	extends ReadOnlyCollectionBase<KeyValuePair<TKey, TValue>>
{
	private readonly _entries: Map<TKey, ProtectedNode<TKey, TValue>>;
	private readonly _listInternal: LinkedNodeList<Node<TKey, TValue>>;

	protected constructor ()
	{
		super();
		this._entries = new Map<TKey, Node<TKey, TValue>>();
		this._listInternal = new LinkedNodeList<Node<TKey, TValue>>();
	}

	private _keys?: Readonly<ExtendedIterable<TKey>>;
	private _values?: Readonly<ExtendedIterable<TValue>>;

	/**
	 * Returns an in-order iterable of all keys.
	 */
	get keys (): ExtendedIterable<TKey>
	{
		const _ = this;
		return (_._keys || (_._keys = Object.freeze(ExtendedIterable.create({
			* [Symbol.iterator] (): Iterator<TKey>
			{
				for(const n of _._listInternal) yield n.key;
			}
		})))) as ExtendedIterable<TKey>;
	}

	/**
	 * Returns an in-order iterable of all values.
	 */
	get values (): ExtendedIterable<TValue>
	{
		const _ = this;
		return (_._values || (_._values = Object.freeze(ExtendedIterable.create({
			* [Symbol.iterator] (): Iterator<TValue>
			{
				for(const n of _._listInternal) yield n.value;
			}
		})))) as ExtendedIterable<TValue>;
	}

	private _reversed?: Readonly<ExtendedIterable<KeyValuePair<TKey, TValue>>>;

	/**
	 * Iterable for iterating this collection in reverse order.
	 * @return {Iterable}
	 */
	get reversed (): ExtendedIterable<KeyValuePair<TKey, TValue>>
	{
		const _ = this;
		return (_._reversed || (_._reversed = Object.freeze(ExtendedIterable.create({
			* [Symbol.iterator] (): Iterator<KeyValuePair<TKey, TValue>>
			{
				for(const n of _._listInternal.reversed) yield copy(n);
			}
		})))) as ExtendedIterable<KeyValuePair<TKey, TValue>>;
	}

	/**
	 * The version number used to track changes.
	 * @returns {number}
	 */
	get version (): number
	{
		return this._listInternal.version;
	}

	/**
	 * Throws if the provided version does not match the current one.
	 * @param {number} version
	 * @returns {boolean}
	 */
	assertVersion (version: number): true | never
	{
		return this._listInternal.assertVersion(version);
	}

	/**
	 * Increments the collection version.
	 * Useful for tracking changes.
	 * @return {number} The new version.
	 */
	incrementVersion (): number
	{
		return this._listInternal.incrementVersion();
	}

	/**
	 * Clears all entries.
	 * @return {number} The number entries cleared.
	 */
	clear (): number
	{
		this._entries.clear();
		return this._listInternal.clear();
	}

	/**
	 * Clears the collection.
	 * Provided for compatibility with disposal routines.
	 */
	dispose (): void
	{
		this.clear();
	}

	/**
	 * Gets the number of entries.
	 * @return {number}
	 */
	getCount (): number
	{
		return this._listInternal.unsafeCount;
	}

	/**
	 * Returns true if there are no entries.
	 * @return {boolean}
	 */
	get isEmpty (): boolean
	{
		return !this._listInternal.unsafeCount;
	}

	/**
	 * Returns true if the key exists and the value matches exactly.
	 * @param entry
	 * @returns {boolean}
	 */
	contains (entry: KeyValuePair<TKey, TValue>): boolean
	{
		if(!entry) return false;
		const e = this._entries, key = entry.key;
		if(!e.has(key)) return false;
		return e.get(key)?.value===entry.value;
	}

	/**
	 * Returns true
	 * @param {TKey} key
	 * @return {boolean}
	 */
	has (key: TKey): boolean
	{
		return this._entries.has(key);
	}

	/**
	 * Returns the value if it exists.  Otherwise undefined.
	 * @param {TKey} key
	 * @return {TValue | undefined}
	 */
	get (key: TKey): TValue | undefined
	{
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
	protected _addInternal (key: TKey, value: TValue): this
	{
		if(key==null) throw new ArgumentNullException('key');
		if(this._entries.has(key)) throw new ArgumentException('key', 'An element with the same key already exists ');
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
	protected _setInternal (key: TKey, value: TValue): boolean
	{
		const node = this._entries.get(key);
		if(node)
		{
			const old = node.value;
			if(areEqual(old, value)) return false;
			node.value = value;
		}
		else
		{
			this._addInternal(key, value);
		}
		return true;
	}

	/**
	 * Removes an entry and returns its value if found.
	 * @param key
	 */
	remove (key: TKey): TValue | undefined
	{
		const e = this._entries;
		if(key==null || !e.has(key)) return undefined;
		const node = e.get(key);
		e.delete(key);
		if(!node) return undefined;
		this._listInternal.removeNode(node);
		return node.value;
	}

	/**
	 * Removes the first node and returns its value.
	 */
	takeFirst (): KeyValuePair<TKey, TValue> | undefined
	{
		const key = this._listInternal.first?.key;
		if(key===undefined) return undefined;
		const value = this.remove(key)!;
		return {key, value};
	}

	/**
	 * Removes the last node and returns its value.
	 */
	takeLast (): KeyValuePair<TKey, TValue> | undefined
	{
		const key = this._listInternal.last?.key;
		if(key===undefined) return undefined;
		const value = this.remove(key)!;
		return {key, value};
	}

	/**
	 * Finds the entry and returns its Id.
	 * @param value
	 */
	getFirstKeyOf (value: TValue): TKey | undefined
	{
		for(const n of this._listInternal)
		{
			if(areEqual(value, n.value)) return n.key;
		}
		return undefined;
	}

	protected* _getIterator (): Iterator<KeyValuePair<TKey, TValue>>
	{
		for(const n of this._listInternal) yield copy(n);
	}
}

export default class OrderedRegistry<TKey, TValue>
	extends OrderedRegistryBase<TKey, TValue>
{

	constructor ()
	{
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
	add (key: TKey, value: TValue): this
	{
		return this._addInternal(key, value);
	}

	/**
	 * Updates or adds a value.
	 * @param {TKey} key
	 * @param {TValue} value
	 * @return {boolean} True if the value was added or changed.  False if no change.
	 */
	set (key: TKey, value: TValue): boolean
	{
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
	register (key: TKey, value: TValue): boolean
	{
		if(this.has(key)) return false;
		this._addInternal(key, value);
		return true;
	}
}

export class OrderedAutoRegistry<T>
	extends OrderedRegistryBase<number, T>
{
	private _lastId: number = 0 | 0;

	constructor ()
	{
		super();
	}

	/**
	 * Adds an entry and returns the ID generated for it.
	 * @param {T} value
	 * @return {number}
	 */
	add (value: T): number
	{
		const newId = ++this._lastId;
		this._addInternal(newId, value);
		return newId;
	}

	/**
	 * Adds an entry to the registry if it doesn't exist.
	 * @param {T} value
	 * @return {boolean} The id of the entry.
	 */
	register (value: T): number
	{
		for(const id of this.keys) if(this.get(id)===value) return id;
		return this.add(value);
	}

	/**
	 * Generates an Id before passing it to the handler.
	 * The value returned from the handler is used to add to the registry and returned as the result.
	 * @param factory
	 */
	addEntry (factory: (id: number) => T): T
	{
		const newId = ++this._lastId;
		const value = factory(newId);
		this._addInternal(newId, value);
		return value;
	}

}

function copy<TKey, TValue> (kvp: KeyValuePair<TKey, TValue>): KeyValuePair<TKey, TValue>
{
	return {key: kvp.key, value: kvp.value};
}
