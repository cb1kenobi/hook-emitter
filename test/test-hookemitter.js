import HookEmitter from '../dist/index';

describe('on', () => {
	it('should not have any listeners', () => {
		let emitter = new HookEmitter();

		expect(emitter.events).be.an.instanceof(Map);
		expect(emitter.events.size).to.equal(0);
		expect(emitter.events.has('foo')).to.be.false;
	});

	it('should add an event listener', () => {
		let emitter = new HookEmitter();

		function foo() {}

		let e = emitter.on('foo', foo);
		expect(e).to.equal(emitter);

		expect(emitter.events.size).to.equal(1);
		expect(emitter.events.has('foo')).to.be.true;

		let listeners = emitter.events.get('foo');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);
	});

	it('should add multiple event listeners', () => {
		const emitter = new HookEmitter();

		function foo() {}
		function bar() {}

		emitter.on('foo', foo);
		emitter.on('foo', foo);
		emitter.on('foo', foo);
		emitter.on('foo', foo);

		emitter.on('bar', bar);
		emitter.on('bar', bar);
		emitter.on('bar', bar);
		emitter.on('bar', bar);

		expect(emitter.events.size).to.equal(2);
		expect(emitter.events.has('foo')).to.be.true;
		expect(emitter.events.has('bar')).to.be.true;

		let listeners = emitter.events.get('foo');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(4);
		expect(listeners.map(p => p.listener)).to.eql([ foo, foo, foo, foo ]);

		listeners = emitter.events.get('bar');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(4);
		expect(listeners.map(p => p.listener)).to.eql([ bar, bar, bar, bar ]);
	});

	it('should add multiple events with single listener', () => {
		const emitter = new HookEmitter();

		function foo() {}

		emitter.on('foo bar baz', foo);

		expect(emitter.events.size).to.equal(3);
		expect(emitter.events.has('foo')).to.be.true;
		expect(emitter.events.has('bar')).to.be.true;
		expect(emitter.events.has('baz')).to.be.true;

		let listeners = emitter.events.get('foo');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);

		listeners = emitter.events.get('bar');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);

		listeners = emitter.events.get('baz');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);
	});

	it('should throw exception if event is invalid', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.on();
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.on(123);
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.on('');
		}).to.throw('Expected event name to be a valid string.');
	});

	it('should throw exception if priority is invalid', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.on('foo', null);
		}).to.throw('Expected priority to be a number.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.on('foo', 'bar');
		}).to.throw('Expected priority to be a number.');
	});

	it('should throw exception if listener not a function', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.on('foo');
		}).to.throw('Expected listener to be a function.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.on('foo', 123);
		}).to.throw('Expected listener to be a function.');
	});
});

describe('off', () => {
	it('should remove an event listener', () => {
		let emitter = new HookEmitter();

		function foo() {}

		emitter.on('foo', foo);

		expect(emitter.events.size).to.equal(1);
		expect(emitter.events.has('foo')).to.be.true;

		let listeners = emitter.events.get('foo');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);

		emitter.off('foo', foo);

		expect(emitter.events.size).to.equal(0);
		expect(emitter.events.has('foo')).to.be.false;
	});

	it('should remove multiple event listeners', () => {
		let emitter = new HookEmitter();

		function foo() {}

		emitter.on('foo', foo);
		emitter.on('foo', foo);

		expect(emitter.events.size).to.equal(1);
		expect(emitter.events.has('foo')).to.be.true;

		let listeners = emitter.events.get('foo');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(2);
		expect(listeners.map(p => p.listener)).to.eql([ foo, foo ]);

		emitter.off('foo', foo);

		expect(emitter.events.size).to.equal(1);
		expect(emitter.events.has('foo')).to.be.true;
		listeners = emitter.events.get('foo');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);

		emitter.off('foo', foo);

		expect(emitter.events.size).to.equal(0);
		expect(emitter.events.has('foo')).to.be.false;
	});

	it('should remove multiple events with a single listener', () => {
		let emitter = new HookEmitter();

		function foo() {}

		emitter.on('foo bar baz', foo);

		expect(emitter.events.size).to.equal(3);
		expect(emitter.events.has('foo')).to.be.true;
		expect(emitter.events.has('bar')).to.be.true;
		expect(emitter.events.has('baz')).to.be.true;

		let listeners = emitter.events.get('foo');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);

		listeners = emitter.events.get('bar');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);

		listeners = emitter.events.get('baz');
		expect(listeners).to.be.an('array');
		expect(listeners.length).to.equal(1);
		expect(listeners.map(p => p.listener)).to.eql([ foo ]);

		emitter.off('foo bar', foo);

		expect(emitter.events.size).to.equal(1);
		expect(emitter.events.has('foo')).to.be.false;
		expect(emitter.events.has('bar')).to.be.false;
		expect(emitter.events.has('baz')).to.be.true;

		emitter.off('baz', foo);

		expect(emitter.events.size).to.equal(0);
		expect(emitter.events.has('baz')).to.be.false;
	});

	it('should continue if removing non-existent event', () => {
		let emitter = new HookEmitter();

		function foo() {}
		function bar() {}

		expect(emitter.events.size).to.equal(0);
		emitter.off('foo');
		expect(emitter.events.size).to.equal(0);
		emitter.on('foo', foo);
		expect(emitter.events.size).to.equal(1);
		emitter.off('foo', bar);
		expect(emitter.events.size).to.equal(1);
		emitter.off('foo', foo);
		expect(emitter.events.size).to.equal(0);
		emitter.off('bar', function () {});
	});

	it('should remove all listeners for a given event', () => {
		let emitter = new HookEmitter();

		function foo() {}
		function bar() {}
		function baz() {}

		emitter.on('foo', foo);
		emitter.on('foo', bar);
		emitter.on('foo', baz);
		expect(emitter.events.size).to.equal(1);

		emitter.off('foo');
		expect(emitter.events.size).to.equal(0);
	});

	it('should remove only remove first duplicate listener', () => {
		let emitter = new HookEmitter();

		function foo() {}

		emitter.on('foo', foo);
		emitter.on('foo', foo);
		expect(emitter.events.size).to.equal(1);

		emitter.off('foo', foo);
		expect(emitter.events.size).to.equal(1);

		emitter.off('foo', foo);
		expect(emitter.events.size).to.equal(0);
	});

	it('should throw exception if event is invalid', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.off();
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.off(123);
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.off('');
		}).to.throw('Expected event name to be a valid string.');
	});

	it('should throw exception if listener not a function', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.off('foo', 123);
		}).to.throw('Expected listener to be a function.');
	});
});

describe('compose', () => {
	it('should throw exception if callback not a function', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.compose({ callback: 'foo' });
		}).to.throw('Expected callback to be a function.');
	});

	it('should throw exception if listeners not an array', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.events.set('foo', 'bar');
			emitter.compose({ type: 'foo' })();
		}).to.throw('Expected listeners to be an array.');
	});

	it('should throw exception if listeners not an array of functions', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.events.set('foo', [ 'bar' ]);
			emitter.compose({ type: 'foo' })();
		}).to.throw('Expected listener to be a function.');
	});
});

describe('emit', () => {
	it('should emit without any listeners', async () => {
		let emitter = new HookEmitter();
		return emitter.emit('foo');
	});

	it('should emit with a single sync listener without promise', () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		emitter.on('foo', foo);
		emitter.emit('foo');
		expect(count).to.equal(1);
	});

	it('should emit with a single sync listener', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		emitter.on('foo', foo);

		await emitter.emit('foo');

		expect(count).to.equal(1);
	});

	it('should emit with a single sync listener with values', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			count++;
			expect(num).to.equal(123);
			expect(abc).to.equal('abc');
		}

		emitter.on('foo', foo);

		await emitter.emit('foo', 123, 'abc');

		expect(count).to.equal(1);
	});

	it('should emit with a single async listener', async function () {
		this.slow(5000);
		this.timeout(5000);

		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					count++;
					resolve();
				}, 250);
			});
		}

		emitter.on('foo', foo);

		await emitter.emit('foo');

		expect(count).to.equal(1);
	});

	it('should emit with a single async listener with values', async function () {
		this.slow(5000);
		this.timeout(5000);

		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(123);
			expect(abc).to.equal('abc');
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					count++;
					resolve();
				}, 250);
			});
		}

		emitter.on('foo', foo);

		await emitter.emit('foo', 123, 'abc');

		expect(count).to.equal(1);
	});

	it('should emit with a multiple sync listeners without promise', () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		emitter.on('foo', foo);
		emitter.on('foo', foo);
		emitter.emit('foo');
		expect(count).to.equal(2);
	});

	it('should emit with a multiple async listeners', async function () {
		this.slow(5000);
		this.timeout(5000);

		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					count++;
					resolve();
				}, 250);
			});
		}

		emitter.on('foo', foo);
		emitter.on('foo', foo);

		await emitter.emit('foo');

		expect(count).to.equal(2);
	});

	it('should emit with a multiple async listeners with values', async function () {
		this.slow(5000);
		this.timeout(5000);

		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(123);
			expect(abc).to.equal('abc');
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					count++;
					resolve();
				}, 250);
			});
		}

		emitter.on('foo', foo);
		emitter.on('foo', foo);

		await emitter.emit('foo', 123, 'abc');

		expect(count).to.equal(2);
	});

	it('should emit with a multiple sync and async listeners', async function () {
		this.slow(5000);
		this.timeout(5000);

		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		function bar() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					count++;
					resolve();
				}, 250);
			});
		}

		emitter.on('foo', foo);
		emitter.on('foo', bar);

		await emitter.emit('foo');

		expect(count).to.equal(2);
	});

	it('should not emit event added from listener', function () {
		this.slow(5000);
		this.timeout(5000);

		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
			emitter.on('foo', foo);
		}

		emitter.on('foo', foo);

		emitter.emit('foo');
		expect(count).to.equal(1);

		emitter.emit('foo');
		expect(count).to.equal(3);
	});

	it('should emit with regular function and async function', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		emitter.on('foo', (abc, num) => {
			expect(count).to.equal(0);
			expect(abc).to.equal('abc');
			expect(num).to.equal(123);
			count++;
		});

		emitter.on('foo', async (abc, num) => {
			expect(count).to.equal(1);
			expect(abc).to.equal('abc');
			expect(num).to.equal(123);
			count++;
		});

		await emitter.emit('foo', 'abc', 123);

		expect(count).to.equal(2);
	});

	it('should emit with multiple async functions', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		emitter.on('foo', async (abc, num) => {
			expect(count).to.equal(0);
			expect(abc).to.equal('abc');
			expect(num).to.equal(123);
			count++;
		});

		emitter.on('foo', async (abc, num) => {
			expect(count).to.equal(1);
			expect(abc).to.equal('abc');
			expect(num).to.equal(123);
			count++;
		});

		await emitter.emit('foo', 'abc', 123);

		expect(count).to.equal(2);
	});

	it('should emit with multiple async functions with next', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		emitter.on('foo', async (abc, num, next) => {
			expect(count).to.equal(0);
			expect(abc).to.equal('abc');
			expect(num).to.equal(123);
			count++;
			await next();
			expect(count).to.equal(2);
			count++;
		});

		emitter.on('foo', async (abc, num) => {
			expect(count).to.equal(1);
			expect(abc).to.equal('abc');
			expect(num).to.equal(123);
			count++;
		});

		await emitter.emit('foo', 'abc', 123);

		expect(count).to.equal(3);
	});

	it('should throw exception if event is invalid', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.emit();
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.emit(123);
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.emit('');
		}).to.throw('Expected event name to be a valid string.');
	});

	it('should be ok if next is called multiple times', async () => {
		let emitter = new HookEmitter();

		emitter.on('foo', next => {
			next();
			next();
		});

		await emitter.emit('foo');
	});

	it('should call listeners in correct order', async () => {
		const emitter = new HookEmitter();
		const actual = [];
		const expected = [ 'e', 'a', 'b', 'd', 'c', 'f' ];

		emitter.on('foo',  100, () => actual.push('a'));
		emitter.on('foo',   50, () => actual.push('b'));
		emitter.on('foo',   -1, () => actual.push('c'));
		emitter.on('foo',       () => actual.push('d'));
		emitter.on('foo',  150, () => actual.push('e'));
		emitter.on('foo', -200, () => actual.push('f'));

		await emitter.emit('foo');

		expect(actual).to.deep.equal(expected);
	});
});

describe('once', () => {
	it('should add an event listener and fire only once', () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		emitter.once('foo', foo);
		emitter.emit('foo');
		emitter.emit('foo');
		expect(count).to.equal(1);
	});

	it('should add multiple event listeners', () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		emitter.once('foo bar', foo);

		emitter.emit('foo');
		emitter.emit('bar');
		expect(count).to.equal(2);

		emitter.emit('foo');
		emitter.emit('bar');
		expect(count).to.equal(2);
	});

	it('should throw exception if event is invalid', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.once();
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.once(123);
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.once('');
		}).to.throw('Expected event name to be a valid string.');
	});

	it('should throw exception if priority is invalid', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.once('foo', null);
		}).to.throw('Expected priority to be a number.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.once('foo', 'bar');
		}).to.throw('Expected priority to be a number.');
	});

	it('should throw exception if listener not a function', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.once('foo');
		}).to.throw('Expected listener to be a function.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.once('foo', 123);
		}).to.throw('Expected listener to be a function.');
	});
});

describe('hook', () => {
	it('should create a hooked function', () => {
		let emitter = new HookEmitter();
		function foo() {}
		let hookFn = emitter.hook('foo', foo);
		expect(hookFn).to.be.a('function');
	});

	it('should run hooked function', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		let hookFn = emitter.hook('foo', foo);
		expect(hookFn).to.be.a('function');

		await hookFn();

		expect(count).to.equal(1);
	});

	it('should run hooked function with values', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(123);
			expect(abc).to.equal('abc');
			count++;
		}

		let hookFn = emitter.hook('foo', foo);
		expect(hookFn).to.be.a('function');

		await hookFn(123, 'abc');

		expect(count).to.equal(1);
	});

	it('should run hooked function with values and a single event', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(123);
			expect(abc).to.equal('cba');
			count++;
		}

		emitter.on('foo', function (num, abc) {
			expect(num).to.equal(123);
			expect(abc).to.equal('abc');

			expect(this.type).to.equal('foo');
			expect(this.fn).to.equal(foo);
			expect(this.args).to.eql([ 123, 'abc' ]);

			this.args = [ num, abc.split('').reverse().join('') ];
		});

		let hookFn = emitter.hook('foo', foo);

		await hookFn(123, 'abc');

		expect(count).to.equal(1);
	});

	it('should run hooked function with values and multiple events', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(246);
			expect(abc).to.equal('cba');
			count++;
		}

		emitter.on('foo', function (num, abc) {
			expect(this.type).to.equal('foo');
			expect(this.fn).to.equal(foo);
			expect(this.args).to.eql([ 123, 'abc' ]);
			this.args[1] = this.args[1].split('').reverse().join('');
		});

		emitter.on('foo', function (num, abc) {
			expect(this.type).to.equal('foo');
			expect(this.fn).to.equal(foo);
			expect(this.args).to.eql([ 123, 'cba' ]);
			this.args[0] = this.args[0] * 2;
		});

		let hookFn = emitter.hook('foo', foo);

		await hookFn(123, 'abc');

		expect(count).to.equal(1);
	});

	it('should run hooked function with multiple hooks', async function () {
		this.timeout(2000000);
		this.slow(2000000);

		let emitter = new HookEmitter();
		let count = 0;

		function foo(abc, num) {
			expect(abc).to.equal('abcdef');
			expect(num).to.equal(6);
			count++;
			return num * 2;
		}

		let hookFn = emitter.hook('foo', foo);

		emitter.on('foo', function (abc, num) {
			expect(abc).to.equal('a');
			expect(num).to.equal(1);
			let obj = Object.assign({}, this);
			obj.args[0] += 'b';
			obj.args[1]++;
			obj.bob = true;
			return obj;
		});

		emitter.on('foo', function (abc, num, next) {
			expect(abc).to.equal('ab');
			expect(num).to.equal(2);
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					const obj = Object.assign({}, this);
					obj.args[0] += 'c';
					obj.args[1]++;
					obj.sally = true;
					next(obj).then(resolve).catch(reject);
				}, 250);
			});
		});

		emitter.on('foo', function (abc, num) {
			expect(abc).to.equal('abc');
			expect(num).to.equal(3);
			return new Promise((resolve, reject) => {
				const obj = Object.assign({}, this);
				obj.args[0] += 'd';
				obj.args[1]++;
				obj.suzie = true;
				setTimeout(() => resolve(obj), 250);
			});
		});

		function bar(abc, num) {
			expect(abc).to.equal('abcd');
			expect(num).to.equal(4);
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					let obj = Object.assign({}, this);
					obj.args[0] += 'e';
					obj.args[1]++;
					obj.billy = true;
					resolve(obj);
				}, 250);
			});
		}

		emitter.on('foo', async function (abc, num) {
			return await bar.call(this, abc, num);
		});

		emitter.on('foo', async function (abc, num, next) {
			expect(abc).to.equal('abcde');
			expect(num).to.equal(5);
			const obj = Object.assign({}, this);
			obj.args[0] += 'f';
			obj.args[1]++;
			obj.joey = true;
			const it = await next();
			expect(it.result).to.equal(12);
			return it;
		});

		const result = await hookFn('a', 1);

		expect(count).to.equal(1);
		expect(result).to.equal(12);
	});

	it('should propagate errors when running hooked function with async event', async () => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(246);
			expect(abc).to.equal('cba');
			count++;
		}

		emitter.on('foo', function (num, abc, next) {
			expect(this.type).to.equal('foo');
			expect(this.fn).to.equal(foo);
			expect(this.args).to.eql([ 123, 'abc' ]);
			this.args[1] = this.args[1].split('').reverse().join('');
			throw new Error('bar');
		});

		let hookFn = emitter.hook('foo', foo);

		try {
			await hookFn(123, 'abc');
		} catch (err) {
			expect(count).to.equal(0);
			expect(err.message).to.equal('bar');
			return;
		}

		throw new Error('Expected error async hook to propagate');
	});

	it('should throw exception if event is invalid', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.hook();
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.hook(123);
		}).to.throw('Expected event name to be a valid string.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.hook('');
		}).to.throw('Expected event name to be a valid string.');
	});

	it('should throw exception if hook function not a function', () => {
		expect(() => {
			let emitter = new HookEmitter();
			emitter.hook('foo');
		}).to.throw('Expected hooked function to be a function.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.hook('foo', 123);
		}).to.throw('Expected context to be an object.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.hook('foo', 123, 456);
		}).to.throw('Expected context to be an object.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.hook('foo', null, 456);
		}).to.throw('Expected hooked function to be a function.');

		expect(() => {
			let emitter = new HookEmitter();
			emitter.hook('foo', {}, {});
		}).to.throw('Expected hooked function to be a function.');
	});
});

describe('link', () => {
	it('should link emitted events (no-prefix) and unlink', async () => {
		const primary = new HookEmitter();
		const secondary = new HookEmitter();
		let primaryCount = 0;
		let secondaryCount = 0;

		primary.on('foo', () => {
			primaryCount++;
		});

		secondary.on('foo', () => {
			secondaryCount++;
		});

		await primary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(0);

		await secondary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(1);

		primary.link(secondary);
		await secondary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(2);

		await primary.emit('foo');
		expect(primaryCount).to.equal(2);
		expect(secondaryCount).to.equal(3);

		primary.unlink(secondary);
		await primary.emit('foo');
		expect(primaryCount).to.equal(3);
		expect(secondaryCount).to.equal(3);
	});

	it('should link emitted events (prefixed + no match) and unlink', async () => {
		const primary = new HookEmitter();
		const secondary = new HookEmitter();
		let primaryCount = 0;
		let secondaryCount = 0;

		primary.on('foo', () => {
			primaryCount++;
		});

		secondary.on('foo', () => {
			secondaryCount++;
		});

		await primary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(0);

		await secondary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(1);

		primary.link(secondary, 'baz:');
		await secondary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(2);

		await primary.emit('foo');
		expect(primaryCount).to.equal(2);
		expect(secondaryCount).to.equal(2);

		primary.unlink(secondary);
		await primary.emit('foo');
		expect(primaryCount).to.equal(3);
		expect(secondaryCount).to.equal(2);
	});

	it('should link emitted events (prefixed + match) and unlink', async () => {
		const primary = new HookEmitter();
		const secondary = new HookEmitter();
		let primaryCount = 0;
		let secondaryCount = 0;

		primary.on('foo', () => {
			primaryCount++;
		});

		secondary.on('baz:foo', () => {
			secondaryCount++;
		});

		await primary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(0);

		await secondary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(0);

		primary.link(secondary, 'baz:');
		await secondary.emit('foo');
		expect(primaryCount).to.equal(1);
		expect(secondaryCount).to.equal(0);

		await primary.emit('foo');
		expect(primaryCount).to.equal(2);
		expect(secondaryCount).to.equal(1);

		primary.unlink(secondary);
		await primary.emit('foo');
		expect(primaryCount).to.equal(3);
		expect(secondaryCount).to.equal(1);
	});

	it('should link emitted hooks (no-prefix) and unlink', async () => {
		const primary = new HookEmitter();
		const secondary = new HookEmitter();
		let primaryCount = 0;
		let primaryHookCount = 0;
		let secondaryCount = 0;
		let secondaryHookCount = 0;

		const primaryHookFn = primary.hook('foo', () => {
			primaryCount++;
		});

		const secondaryHookFn = secondary.hook('foo', () => {
			secondaryCount++;
		});

		primary.on('foo', evt => {
			primaryHookCount++;
		});

		secondary.on('foo', evt => {
			secondaryHookCount++;
		});

		await primaryHookFn();
		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(0);
		expect(secondaryHookCount).to.equal(0);

		await secondaryHookFn();
		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(1);
		expect(secondaryHookCount).to.equal(1);

		primary.link(secondary);
		await secondaryHookFn();

		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(2);

		await primaryHookFn();
		expect(primaryCount).to.equal(2);
		expect(primaryHookCount).to.equal(2);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(3);

		primary.unlink(secondary);

		await primaryHookFn();
		expect(primaryCount).to.equal(3);
		expect(primaryHookCount).to.equal(3);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(3);
	});

	it('should link emitted hooks (prefixed + no match) and unlink', async () => {
		const primary = new HookEmitter();
		const secondary = new HookEmitter();
		let primaryCount = 0;
		let primaryHookCount = 0;
		let secondaryCount = 0;
		let secondaryHookCount = 0;

		const primaryHookFn = primary.hook('foo', () => {
			primaryCount++;
		});

		const secondaryHookFn = secondary.hook('foo', () => {
			secondaryCount++;
		});

		primary.on('foo', evt => {
			primaryHookCount++;
		});

		secondary.on('foo', evt => {
			secondaryHookCount++;
		});

		await primaryHookFn();
		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(0);
		expect(secondaryHookCount).to.equal(0);

		await secondaryHookFn();
		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(1);
		expect(secondaryHookCount).to.equal(1);

		primary.link(secondary, 'baz:');
		await secondaryHookFn();
		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(2);

		await primaryHookFn();
		expect(primaryCount).to.equal(2);
		expect(primaryHookCount).to.equal(2);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(2);

		primary.unlink(secondary);
		await primaryHookFn();
		expect(primaryCount).to.equal(3);
		expect(primaryHookCount).to.equal(3);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(2);
	});

	it('should link emitted hooks (prefixed + match) and unlink', async () => {
		const primary = new HookEmitter();
		const secondary = new HookEmitter();
		let primaryCount = 0;
		let primaryHookCount = 0;
		let secondaryCount = 0;
		let secondaryHookCount = 0;

		const primaryHookFn = primary.hook('foo', () => {
			primaryCount++;
		});

		const secondaryHookFn = secondary.hook('baz:foo', () => {
			secondaryCount++;
		});

		primary.on('foo', evt => {
			primaryHookCount++;
		});

		secondary.on('baz:foo', evt => {
			secondaryHookCount++;
		});

		await primaryHookFn();
		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(0);
		expect(secondaryHookCount).to.equal(0);

		await secondaryHookFn();
		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(1);
		expect(secondaryHookCount).to.equal(1);

		primary.link(secondary, 'baz:');
		await secondaryHookFn();
		expect(primaryCount).to.equal(1);
		expect(primaryHookCount).to.equal(1);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(2);

		await primaryHookFn();
		expect(primaryCount).to.equal(2);
		expect(primaryHookCount).to.equal(2);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(3);

		primary.unlink(secondary);
		await primaryHookFn();
		expect(primaryCount).to.equal(3);
		expect(primaryHookCount).to.equal(3);
		expect(secondaryCount).to.equal(2);
		expect(secondaryHookCount).to.equal(3);
	});

	it('should throw exception if link() argument is not a HookEmitter', () => {
		expect(() => {
			const emitter = new HookEmitter();
			emitter.link('foo');
		}).to.throw('Expected argument to be a HookEmitter.');
	});

	it('should throw exception if unlink() argument is not a HookEmitter', () => {
		expect(() => {
			const emitter = new HookEmitter();
			emitter.unlink('foo');
		}).to.throw('Expected argument to be a HookEmitter.');
	});
});
