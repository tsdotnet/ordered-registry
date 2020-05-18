/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import {expect} from 'chai';
import OrderedRegistry from '../src/OrderedRegistry';

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
		expect(reg.has(1)).to.be.false;
	});
});
