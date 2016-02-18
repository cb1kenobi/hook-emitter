import { HookEmitter } from '../src/index';
import { expect } from 'chai';

describe('on', () => {
	it('should not have any listeners', () => {
		let emitter = new HookEmitter();

		expect(emitter.events).be.an.instanceof.Map;
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
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);
	});

	it('should add multiple event listeners', () => {
		let emitter = new HookEmitter();

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
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(4);
		expect(listeners).to.eql([foo, foo, foo, foo]);

		listeners = emitter.events.get('bar');
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(4);
		expect(listeners).to.eql([bar, bar, bar, bar]);
	});

	it('should add multiple events with single listener', () => {
		let emitter = new HookEmitter();

		function foo() {}

		emitter.on('foo bar baz', foo);

		expect(emitter.events.size).to.equal(3);
		expect(emitter.events.has('foo')).to.be.true;
		expect(emitter.events.has('bar')).to.be.true;
		expect(emitter.events.has('baz')).to.be.true;

		let listeners = emitter.events.get('foo');
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);

		listeners = emitter.events.get('bar');
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);

		listeners = emitter.events.get('baz');
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);
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
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);

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
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(2);
		expect(listeners).to.eql([foo, foo]);

		emitter.off('foo', foo);

		expect(emitter.events.size).to.equal(1);
		expect(emitter.events.has('foo')).to.be.true;
		listeners = emitter.events.get('foo');
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);

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
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);

		listeners = emitter.events.get('bar');
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);

		listeners = emitter.events.get('baz');
		expect(listeners).to.be.an.array;
		expect(listeners.length).to.equal(1);
		expect(listeners).to.eql([foo]);

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
			emitter.events.set('foo', ['bar']);
			emitter.compose({ type: 'foo' })();
		}).to.throw('Expected listener to be a function.');
	});
});

describe('emit', () => {
	it('should emit without any listeners', (done) => {
		let emitter = new HookEmitter();
		emitter.emit('foo')
			.then(() => {
				done();
			})
			.catch(done);
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

	it('should emit with a single sync listener', done => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		emitter.on('foo', foo);

		emitter.emit('foo')
			.then(() => {
				expect(count).to.equal(1);
				done();
			})
			.catch(done);
	});

	it('should emit with a single sync listener with values', done => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			count++;
			expect(num).to.equal(123);
			expect(abc).to.equal('abc');
		}

		emitter.on('foo', foo);

		emitter.emit('foo', 123, 'abc')
			.then(() => {
				expect(count).to.equal(1);
				done();
			})
			.catch(done);
	});

	it('should emit with a single async listener', function (done) {
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

		emitter.emit('foo')
			.then(() => {
				expect(count).to.equal(1);
				done();
			})
			.catch(done);
	});

	it('should emit with a single async listener with values', function (done) {
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

		emitter.emit('foo', 123, 'abc')
			.then(() => {
				expect(count).to.equal(1);
				done();
			})
			.catch(done);
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

	it('should emit with a multiple async listeners', function (done) {
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

		emitter.emit('foo')
			.then(() => {
				expect(count).to.equal(2);
				done();
			})
			.catch(done);
	});

	it('should emit with a multiple async listeners with values', function (done) {
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

		emitter.emit('foo', 123, 'abc')
			.then(() => {
				expect(count).to.equal(2);
				done();
			})
			.catch(done);
	});

	it('should emit with a multiple sync and async listeners', function (done) {
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

		emitter.emit('foo')
			.then(() => {
				expect(count).to.equal(2);
				done();
			})
			.catch(done);

		// since foo() was sync, it should have already run
		expect(count).to.equal(1);
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

	it('should emit with regular function and async function', done => {
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

		emitter.emit('foo', 'abc', 123)
			.then(() => {
				expect(count).to.equal(2);
				done();
			})
			.catch(done);
	});

	it('should emit with multiple async functions', done => {
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

		emitter.emit('foo', 'abc', 123)
			.then(() => {
				expect(count).to.equal(2);
				done();
			})
			.catch(done);
	});

	it('should emit with multiple async functions with next', done => {
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

		emitter.emit('foo', 'abc', 123)
			.then(() => {
				expect(count).to.equal(3);
				done();
			})
			.catch(done);
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

	it('should be ok if next is called multiple times', done => {
		let emitter = new HookEmitter();

		emitter.on('foo', next => {
			next();
			next();
		});

		emitter
			.emit('foo')
			.then(() => done())
			.catch(done);
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
		expect(hookFn).to.be.a.function;
	});

	it('should run hooked function', done => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo() {
			count++;
		}

		let hookFn = emitter.hook('foo', foo);
		expect(hookFn).to.be.a.function;

		hookFn()
			.then(() => {
				expect(count).to.equal(1);
				done();
			})
			.catch(done);
	});

	it('should run hooked function with values', done => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(123);
			expect(abc).to.equal('abc');
			count++;
		}

		let hookFn = emitter.hook('foo', foo);
		expect(hookFn).to.be.a.function;

		hookFn(123, 'abc')
			.then(() => {
				expect(count).to.equal(1);
				done();
			})
			.catch(done);
	});

	it('should run hooked function with values and a single event', done => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(123);
			expect(abc).to.equal('cba');
			count++;
		}

		emitter.on('foo', evt => {
			expect(evt).to.be.an.object;
			expect(evt.type).to.equal('foo');
			expect(evt.fn).to.equal(foo);
			expect(evt.args).to.eql([123, 'abc']);
			evt.args[1] = evt.args[1].split('').reverse().join('');
		});

		let hookFn = emitter.hook('foo', foo);

		hookFn(123, 'abc')
			.then(() => {
				expect(count).to.equal(1);
				done();
			})
			.catch(done);
	});

	it('should run hooked function with values and multiple events', done => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(246);
			expect(abc).to.equal('cba');
			count++;
		}

		emitter.on('foo', evt => {
			expect(evt).to.be.an.object;
			expect(evt.type).to.equal('foo');
			expect(evt.fn).to.equal(foo);
			expect(evt.args).to.eql([123, 'abc']);
			evt.args[1] = evt.args[1].split('').reverse().join('');
		});

		emitter.on('foo', evt => {
			expect(evt).to.be.an.object;
			expect(evt.type).to.equal('foo');
			expect(evt.fn).to.equal(foo);
			expect(evt.args).to.eql([123, 'cba']);
			evt.args[0] = evt.args[0] * 2;
		});

		let hookFn = emitter.hook('foo', foo);

		hookFn(123, 'abc')
			.then(() => {
				expect(count).to.equal(1);
				done();
			})
			.catch(done);
	});

	it('should run hooked function with multiple hooks', function (done) {
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

		emitter.on('foo', evt => {
			expect(evt.args[0]).to.equal('a');
			expect(evt.args[1]).to.equal(1);
			let obj = Object.assign({}, evt);
			obj.args[0] += 'b';
			obj.args[1]++;
			obj.bob = true;
			return obj;
		});

		emitter.on('foo', (evt, next) => {
			expect(evt.args[0]).to.equal('ab');
			expect(evt.args[1]).to.equal(2);
			setTimeout(() => {
				const obj = Object.assign({}, evt);
				obj.args[0] += 'c';
				obj.args[1]++;
				obj.sally = true;
				next(null, obj);
			}, 250);
		});

		emitter.on('foo', evt => {
			expect(evt.args[0]).to.equal('abc');
			expect(evt.args[1]).to.equal(3);
			return new Promise((resolve, reject) => {
				const obj = Object.assign({}, evt);
				obj.args[0] += 'd';
				obj.args[1]++;
				obj.suzie = true;
				setTimeout(() => {
					resolve(obj);
				}, 250);
			});
		});

		function bar(evt) {
			expect(evt.args[0]).to.equal('abcd');
			expect(evt.args[1]).to.equal(4);
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					let obj = Object.assign({}, evt);
					obj.args[0] += 'e';
					obj.args[1]++;
					obj.billy = true;
					resolve(obj);
				}, 250);
			});
		}

		emitter.on('foo', async (evt) => {
			return await bar(evt);
		});

		emitter.on('foo', async (evt, next) => {
			expect(evt.args[0]).to.equal('abcde');
			expect(evt.args[1]).to.equal(5);
			const obj = Object.assign({}, evt);
			obj.args[0] += 'f';
			obj.args[1]++;
			obj.joey = true;
			const evt2 = await next(null, obj);
			expect(evt2.args[0].result).to.equal(12);
			return evt2;
		});

		hookFn('a', 1)
			.then(result => {
				expect(count).to.equal(1);
				expect(result).to.equal(12);
				done();
			})
			.catch(done);
	});

	it('should propagate errors when running hooked function with async event', done => {
		let emitter = new HookEmitter();
		let count = 0;

		function foo(num, abc) {
			expect(num).to.equal(246);
			expect(abc).to.equal('cba');
			count++;
		}

		emitter.on('foo', (evt, next) => {
			expect(evt).to.be.an.object;
			expect(evt.type).to.equal('foo');
			expect(evt.fn).to.equal(foo);
			expect(evt.args).to.eql([123, 'abc']);
			evt.args[1] = evt.args[1].split('').reverse().join('');
			next(new Error('bar'));
		});

		let hookFn = emitter.hook('foo', foo);

		hookFn(123, 'abc')
			.then(() => {
				done(new Error('Expected error async hook to propagate'));
			})
			.catch(err => {
				try {
					expect(count).to.equal(0);
					expect(err.message).to.equal('bar');
					done();
				} catch (e) {
					done(e);
				}
			});
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
