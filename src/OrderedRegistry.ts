/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import IterableCollectionBase from '@tsdotnet/collection-base';
import areEqual from '@tsdotnet/compare/dist/areEqual';
import ArgumentException from '@tsdotnet/exceptions/dist/ArgumentException';
import ArgumentNullException from '@tsdotnet/exceptions/dist/ArgumentNullException';
import {LinkedNode, LinkedNodeList} from '@tsdotnet/linked-node-list';

type KeyValuePair<TKey, TValue> = {
	key: TKey;
	value: TValue;
}

type Node<TKey, TValue> = KeyValuePair<TKey, TValue> & LinkedNode<Node<TKey, TValue>>;

export default class OrderedRegistry<TKey, TValue>
	extends IterableCollectionBase<KeyValuePair<TKey, TValue>>
{
	private readonly _entries: Map<TKey, Readonly<Node<TKey, TValue>>>;
	private readonly _list: LinkedNodeList<Node<TKey, TValue>>;
	private readonly _keys: Iterable<TKey>;

	constructor ()
	{
		super();
		this._entries = new Map<TKey, Node<TKey, TValue>>();
		const list = new LinkedNodeList<Node<TKey, TValue>>();
		this._list = list;
		this._keys = {
			* [Symbol.iterator] (): Iterator<TKey>
			{
				for(const n of list)
				{
					yield n.key;
				}
			}
		};
	}

	protected* _getIterator (): Iterator<KeyValuePair<TKey, TValue>>
	{
		for(const n of this._list) yield copy(n);
	}

	/**
	 * Increments the collection version.
	 * Useful for tracking changes.
	 * @return {number} The new version.
	 */
	incrementVersion (): number
	{
		return this._list.incrementVersion();
	}

	/**
	 * Clears all entries.
	 * @return {number} The number entries cleared.
	 */
	clear (): number
	{
		this._entries.clear();
		return this._list.clear();
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
		if(key==null) throw new ArgumentNullException('key');
		if(this._entries.has(key)) throw new ArgumentException('key', 'An element with the same key already exists ');
		const node = {
			key: key,
			value: value
		};
		this._list.addNode(node);
		this._entries.set(key, node);
		return this;
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
		this._list.removeNode(node);
		return node.value;
	}

	/**
	 * Removes the first node and returns its value.
	 */
	takeFirst (): TValue | undefined
	{
		return this.remove(this._list.first?.key!);
	}

	/**
	 * Removes the last node and returns its value.
	 */
	takeLast (): TValue | undefined
	{
		return this.remove(this._list.last?.key!);
	}

	/**
	 * Iterable for iterating this collection in reverse order.
	 * @return {Iterable}
	 */
	get reversed (): Iterable<KeyValuePair<TKey, TValue>>
	{
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const _ = this;
		return {
			* [Symbol.iterator] (): Iterator<KeyValuePair<TKey, TValue>>
			{
				for(const n of _._list.reversed) yield copy(n);
			}
		};
	}

	/**
	 * Returns true if the key is registered.
	 * @param {TKey} key
	 * @return {boolean}
	 */
	contains (key: TKey): boolean
	{
		return this._entries.has(key);
	}

	/**
	 * Returns an in-order iterable of all keys.
	 */
	get keys (): Iterable<TKey>
	{
		return this._keys;
	}

	/**
	 * Finds the entry and returns its Id.
	 * @param value
	 */
	getFirstKeyOf (value: TValue): TKey | undefined
	{
		for(const n of this._list)
		{
			if(areEqual(value, n.value)) return n.key;
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
	register (key: TKey, value: TValue): boolean
	{
		if(this._entries.has(key)) return false;
		this.add(key, value);
		return true;
	}
}

function copy<TKey, TValue> (kvp: KeyValuePair<TKey, TValue>): KeyValuePair<TKey, TValue>
{
	return {key: kvp.key, value: kvp.value};
}
