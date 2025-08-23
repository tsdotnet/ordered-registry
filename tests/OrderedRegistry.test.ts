/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import { describe, it, expect, beforeEach } from 'vitest';
import OrderedRegistry, { OrderedAutoRegistry } from '../src/OrderedRegistry';

describe('OrderedRegistry', () => {
	function addEntries (reg: OrderedRegistry<number, object>, count: number): number[]
	{
		const ids: number[] = [];
		for(let i = 0; i<count; i++)
		{
			reg.add(i, {});
			ids.push(i);
			expect(reg.toArray().length).equal(ids.length);
		}
		return ids;
	}

	it('adds and removes entries', () => {
		const reg = new OrderedRegistry<number, object>();
		for(let max = 1; max<=5; max++)
		{
			const ids = addEntries(reg, max);
			while(ids.length)
			{
				expect(reg.remove(ids.pop()!)).to.not.be.undefined;
				expect(reg.toArray().length).equal(ids.length);
			}
		}
	});

	it('clears entries', () => {
		const reg = new OrderedRegistry<number, object>();
		addEntries(reg, 10);
		reg.clear();
		expect(reg.toArray().length).equal(0);
		expect(reg.has(1)).toBe(false);
	});

	describe('Core functionality', () => {
		let reg: OrderedRegistry<string, number>;

		beforeEach(() => {
			reg = new OrderedRegistry<string, number>();
		});

		it('should initialize empty', () => {
			expect(reg.isEmpty).toBe(true);
			expect(reg.getCount()).toBe(0);
			expect(reg.toArray().length).toBe(0);
		});

		it('should add entries correctly', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			
			expect(reg.isEmpty).toBe(false);
			expect(reg.getCount()).toBe(2);
			expect(reg.has('a')).toBe(true);
			expect(reg.has('b')).toBe(true);
			expect(reg.get('a')).toBe(1);
			expect(reg.get('b')).toBe(2);
		});

		it('should throw on null key add', () => {
			expect(() => reg.add(null as any, 1)).toThrow('key');
		});

		it('should throw on duplicate key add', () => {
			reg.add('a', 1);
			expect(() => reg.add('a', 2)).toThrow('An element with the same key already exists');
		});

		it('should handle get for non-existent key', () => {
			expect(reg.get('nonexistent')).toBeUndefined();
		});

		it('should handle has for non-existent key', () => {
			expect(reg.has('nonexistent')).toBe(false);
		});

		it('should set entries correctly', () => {
			// Add new entry
			expect(reg.set('a', 1)).toBe(true);
			expect(reg.get('a')).toBe(1);
			
			// Update existing entry
			expect(reg.set('a', 2)).toBe(true);
			expect(reg.get('a')).toBe(2);
			
			// Set same value (no change)
			expect(reg.set('a', 2)).toBe(false);
		});

		it('should register entries correctly', () => {
			// Register new entry
			expect(reg.register('a', 1)).toBe(true);
			expect(reg.get('a')).toBe(1);
			
			// Register existing key
			expect(reg.register('a', 2)).toBe(false);
			expect(reg.get('a')).toBe(1); // Value unchanged
		});

		it('should remove entries correctly', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			
			expect(reg.remove('a')).toBe(1);
			expect(reg.has('a')).toBe(false);
			expect(reg.getCount()).toBe(1);
			
			expect(reg.remove('nonexistent')).toBeUndefined();
			expect(reg.remove(null as any)).toBeUndefined();
		});

		it('should maintain order', () => {
			reg.add('c', 3);
			reg.add('a', 1);
			reg.add('b', 2);
			
			const entries = reg.toArray();
			expect(entries).toHaveLength(3);
			expect(entries[0]?.key).toBe('c');
			expect(entries[1]?.key).toBe('a');
			expect(entries[2]?.key).toBe('b');
		});

		it('should handle keys iterator', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			reg.add('c', 3);
			
			const keys = Array.from(reg.keys);
			expect(keys).toEqual(['a', 'b', 'c']);
		});

		it('should handle values iterator', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			reg.add('c', 3);
			
			const values = Array.from(reg.values);
			expect(values).toEqual([1, 2, 3]);
		});

		it('should handle contains correctly', () => {
			reg.add('a', 1);
			
			expect(reg.contains({key: 'a', value: 1})).toBe(true);
			expect(reg.contains({key: 'a', value: 2})).toBe(false);
			expect(reg.contains({key: 'b', value: 1})).toBe(false);
			expect(reg.contains(null as any)).toBe(false);
		});

		it('should handle takeFirst correctly', () => {
			expect(reg.takeFirst()).toBeUndefined();
			
			reg.add('a', 1);
			reg.add('b', 2);
			reg.add('c', 3);
			
			const first = reg.takeFirst();
			expect(first).toEqual({key: 'a', value: 1});
			expect(reg.getCount()).toBe(2);
			expect(reg.has('a')).toBe(false);
		});

		it('should handle takeLast correctly', () => {
			expect(reg.takeLast()).toBeUndefined();
			
			reg.add('a', 1);
			reg.add('b', 2);
			reg.add('c', 3);
			
			const last = reg.takeLast();
			expect(last).toEqual({key: 'c', value: 3});
			expect(reg.getCount()).toBe(2);
			expect(reg.has('c')).toBe(false);
		});

		it('should find first key of value', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			reg.add('c', 1); // Duplicate value
			
			expect(reg.getFirstKeyOf(1)).toBe('a'); // Should return first occurrence
			expect(reg.getFirstKeyOf(2)).toBe('b');
			expect(reg.getFirstKeyOf(999)).toBeUndefined();
		});

		it('should handle version tracking', () => {
			const initialVersion = reg.version;
			
			reg.add('a', 1);
			expect(reg.version).toBeGreaterThan(initialVersion);
			
			const currentVersion = reg.version;
			reg.incrementVersion();
			expect(reg.version).toBeGreaterThan(currentVersion);
		});

		it('should handle version assertion', () => {
			const version = reg.version;
			expect(reg.assertVersion(version)).toBe(true);
			
			reg.add('a', 1);
			expect(() => reg.assertVersion(version)).toThrow();
		});

		it('should handle disposal', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			
			reg.dispose();
			expect(reg.isEmpty).toBe(true);
			expect(reg.getCount()).toBe(0);
		});

		it('should handle clearing', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			
			const cleared = reg.clear();
			expect(cleared).toBe(2);
			expect(reg.isEmpty).toBe(true);
			expect(reg.getCount()).toBe(0);
		});

		it('should handle iteration', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			
			const entries = [];
			for(const entry of reg) {
				entries.push(entry);
			}
			
			expect(entries).toHaveLength(2);
			expect(entries[0]).toEqual({key: 'a', value: 1});
			expect(entries[1]).toEqual({key: 'b', value: 2});
		});

		it('should handle reverse iteration', () => {
			reg.add('a', 1);
			reg.add('b', 2);
			reg.add('c', 3);
			
			const entries = [];
			for(const entry of reg.reversed) {
				entries.push(entry);
			}
			
			expect(entries).toHaveLength(3);
			expect(entries[0]).toEqual({key: 'c', value: 3});
			expect(entries[1]).toEqual({key: 'b', value: 2});
			expect(entries[2]).toEqual({key: 'a', value: 1});
		});
	});

	describe('OrderedAutoRegistry', () => {
		let autoReg: OrderedAutoRegistry<string>;

		beforeEach(() => {
			autoReg = new OrderedAutoRegistry<string>();
		});

		it('should initialize empty', () => {
			expect(autoReg.isEmpty).toBe(true);
			expect(autoReg.getCount()).toBe(0);
		});

		it('should auto-generate IDs when adding', () => {
			const id1 = autoReg.add('first');
			const id2 = autoReg.add('second');
			
			expect(id1).toBe(1);
			expect(id2).toBe(2);
			expect(autoReg.get(id1)).toBe('first');
			expect(autoReg.get(id2)).toBe('second');
		});

		it('should register values with auto-generated or existing IDs', () => {
			const id1 = autoReg.register('value1');
			const id2 = autoReg.register('value2');
			const id1Again = autoReg.register('value1'); // Should return existing ID
			
			expect(id1).toBe(1);
			expect(id2).toBe(2);
			expect(id1Again).toBe(id1); // Same ID for same value
			expect(autoReg.getCount()).toBe(2);
		});

		it('should handle addEntry with factory function', () => {
			const result = autoReg.addEntry((id) => `item-${id}`);
			
			expect(result).toBe('item-1');
			expect(autoReg.get(1)).toBe('item-1');
		});

		it('should maintain order with auto-generated IDs', () => {
			autoReg.add('first');
			autoReg.add('second');
			autoReg.add('third');
			
			const values = Array.from(autoReg.values);
			expect(values).toEqual(['first', 'second', 'third']);
		});

		it('should handle all inherited methods', () => {
			const id = autoReg.add('test');
			
			expect(autoReg.has(id)).toBe(true);
			expect(autoReg.contains({key: id, value: 'test'})).toBe(true);
			expect(autoReg.remove(id)).toBe('test');
			expect(autoReg.isEmpty).toBe(true);
		});
	});

	describe('Edge cases', () => {
		it('should handle complex objects as values', () => {
			const reg = new OrderedRegistry<string, {id: number, name: string}>();
			const obj1 = {id: 1, name: 'first'};
			const obj2 = {id: 2, name: 'second'};
			
			reg.add('a', obj1);
			reg.add('b', obj2);
			
			expect(reg.get('a')).toBe(obj1);
			expect(reg.contains({key: 'a', value: obj1})).toBe(true);
			expect(reg.getFirstKeyOf(obj1)).toBe('a');
		});

		it('should handle various key types', () => {
			const symbolReg = new OrderedRegistry<symbol, string>();
			const sym1 = Symbol('key1');
			const sym2 = Symbol('key2');
			
			symbolReg.add(sym1, 'value1');
			symbolReg.add(sym2, 'value2');
			
			expect(symbolReg.get(sym1)).toBe('value1');
			expect(symbolReg.has(sym2)).toBe(true);
		});

		it('should handle undefined and null values correctly', () => {
			const reg = new OrderedRegistry<string, any>();
			
			reg.add('undefined', undefined);
			reg.add('null', null);
			reg.add('zero', 0);
			reg.add('empty', '');
			
			expect(reg.get('undefined')).toBeUndefined();
			expect(reg.get('null')).toBeNull();
			expect(reg.get('zero')).toBe(0);
			expect(reg.get('empty')).toBe('');
			
			expect(reg.has('undefined')).toBe(true);
			expect(reg.has('null')).toBe(true);
		});

		it('should handle large datasets efficiently', () => {
			const reg = new OrderedRegistry<number, string>();
			
			// Add 1000 entries
			for(let i = 0; i < 1000; i++) {
				reg.add(i, `value-${i}`);
			}
			
			expect(reg.getCount()).toBe(1000);
			expect(reg.get(500)).toBe('value-500');
			expect(reg.has(999)).toBe(true);
			
			// Remove every other entry
			for(let i = 0; i < 1000; i += 2) {
				reg.remove(i);
			}
			
			expect(reg.getCount()).toBe(500);
			expect(reg.has(500)).toBe(false); // Even number, should be removed
			expect(reg.has(501)).toBe(true); // Odd number, should remain
		});
	});
});
