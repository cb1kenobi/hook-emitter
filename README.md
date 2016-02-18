# hook-emitter

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Travis CI Build][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![Deps][david-image]][david-url]
[![Dev Deps][david-dev-image]][david-dev-url]

Event emitter with support for asynchronous handlers and a sweet "hook"
mechanism.

> Note: hook-emitter requires Node.js 4 or newer.

## Installation

	npm install hook-emitter

## Examples

Async listener example:

```javascript
import { HookEmitter } from 'hook-emitter';
// the CommonJS way:
// const HookEmitter = require('hook-emitter').HookEmitter;

const emitter = new HookEmitter();

emitter.on('sum', (x, y) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('the sum of ' + x + ' + ' + y + ' = ' + (x + y));
			resolve();
		}, 100);
	});
});

emitter.emit('sum', 3, 7);
```

Hook example:

```javascript
const emitter = new HookEmitter();

const hookedSum = emitter.hook('sum', (x, y) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// x = 6, y = 14
			resolve(x + y);
		}, 100);
	});
});

emitter.on('sum', evt => {
	console.log('doubling x and y');
	evt.args[0] *= 2;
	evt.args[1] *= 2;
});

hookedSum(3, 7)
	.then(result => {
		console.log('The sum of 6 + 14 = ' + result);
	})
	.catch(err => console.error);
```

Chaining multiple hooked functions example:

```javascript
const emitter = new HookEmitter();

Promise.resolve()
	.then(emitter.hook('step1', () => {
		console.log('step 1');
	}))
	.then(emitter.hook('step2', () => {
		console.log('step 2');
	}))
	.then(emitter.hook('step3', () => {
		console.log('step 3');
	}))
	.catch(err => console.error);
```

## API

### Constructor

The `HookEmitter` constructor takes no arguments.

### Properties

#### `events`

A `Map` object of event names to arrays of listener functions. This can be iterated
over using a for-of loop.

### Methods

#### `on(event, listener)`

Adds an event listener. Returns `this`.

 * `event` String - One or more space-separated event names to add the listener to.
 * `listener` Function - A function to call when the event is emitted.

#### `once(event, listener)`

Adds an event listener that will only be called once. Returns `this`.

 * `event` String - One or more space-separated event names to add the listener to.
 * `listener` Function - A function to call when the event is emitted.

#### `off(event, listener)`

Removes an event listener. Returns `this`.

 * `event` String - One or more space-separated event names to remove the listener from.
 * `listener` Function (optional) - The listener function. If not specified,
   then all listeners for the specified event are removed.

#### `emit(event, ...args)`

Emits one or more events. Returns a `Promise`.

 * `event` String - The name of the event to emit.
 * `args` * (optional) - One or more additional arguments to be emitted with the event.

#### `hook(event, ctx, fn)`

Creates a function hook. Returns a `Function` which when called returns a `Promise`.

 * `event` String - The name of the hook's event.
 * `ctx` Object (optional) - The context to run the function in. Useful if `fn` is
   going to be overwritten.
 * `fn` Function - The function being hooked up.

## License

(The MIT License)

Copyright (c) 2015-2016 Chris Barber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[npm-image]: https://img.shields.io/npm/v/hook-emitter.svg
[npm-url]: https://npmjs.org/package/hook-emitter
[downloads-image]: https://img.shields.io/npm/dm/hook-emitter.svg
[downloads-url]: https://npmjs.org/package/hook-emitter
[travis-image]: https://img.shields.io/travis/cb1kenobi/hook-emitter.svg
[travis-url]: https://travis-ci.org/cb1kenobi/hook-emitter
[coveralls-image]: https://img.shields.io/coveralls/cb1kenobi/hook-emitter/master.svg
[coveralls-url]: https://coveralls.io/r/cb1kenobi/hook-emitter
[codeclimate-image]: https://img.shields.io/codeclimate/github/cb1kenobi/hook-emitter.svg
[codeclimate-url]: https://codeclimate.com/github/cb1kenobi/hook-emitter
[david-image]: https://img.shields.io/david/cb1kenobi/hook-emitter.svg
[david-url]: https://david-dm.org/cb1kenobi/hook-emitter
[david-dev-image]: https://img.shields.io/david/dev/cb1kenobi/hook-emitter.svg
[david-dev-url]: https://david-dm.org/cb1kenobi/hook-emitter#info=devDependencies
