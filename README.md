<a name="banner"><img src="https://cdn.jsdelivr.net/gh/tsdotnet/ordered-registry@master/assets/banner.svg" alt="@tsdotnet/ordered-registry: A map that keeps order. Keyed entries, first in stays first."></a>

[![npm version](https://img.shields.io/npm/v/@tsdotnet/ordered-registry.svg?style=flat-square)](https://www.npmjs.com/package/@tsdotnet/ordered-registry)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/tsdotnet/ordered-registry/blob/master/LICENSE)

`OrderedRegistry` is a keyed collection that remembers insertion order, with keys, values and reverse iteration.

## Install

```sh
npm install @tsdotnet/ordered-registry
```

## Usage

```ts
import OrderedRegistry from '@tsdotnet/ordered-registry';

const reg = new OrderedRegistry<string, number>();
reg.add('first', 1).add('second', 2).add('third', 3);

[...reg.keys];    // ['first', 'second', 'third']
reg.get('second'); // 2
reg.remove('first');
reg.takeFirst();  // { key: 'second', value: 2 }
```

`add` throws on a duplicate key; `register` returns `false` instead. `OrderedAutoRegistry` generates the keys for you.

## Use it from

ESM (`import OrderedRegistry from '@tsdotnet/ordered-registry';`) or CommonJS (`const OrderedRegistry = require('@tsdotnet/ordered-registry').default;`).

<details><summary>In a browser, without a bundler</summary>

```html
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/type@1/dist/umd/type.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/compare@1/dist/umd/compare.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/exceptions@1/dist/umd/exceptions.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/collection-base@2/dist/umd/collection-base.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/linked-node-list@1/dist/umd/linked-node-list.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tsdotnet/ordered-registry@1/dist/umd/ordered-registry.min.js"></script>
<script>
  const OrderedRegistry = tsdotnet.orderedRegistry.default;
</script>
```

</details>

## Docs

[tsdotnet.github.io/ordered-registry](https://tsdotnet.github.io/ordered-registry/)
