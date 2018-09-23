/* istanbul ignore if */
if (!Error.prepareStackTrace) {
	require('source-map-support/register');
}

import snooplogg from 'snooplogg';

const { log } = snooplogg('hook-emitter');

/**
 * Emits events and hooks to synchronous and asynchronous listeners.
 */
class HookEmitter {
	/**
	 * Constructs an HookEmitter object.
	 *
	 * @access public
	 */
	constructor() {
		this._events = new Map();
		this._links = [];
	}

	/**
	 * An iterator for returning all events.
	 * @type {Iterator}
	 */
	get events() {
		return this._events;
	}

	/**
	 * Adds an event listener.
	 *
	 * @param {String} event - One or more space-separated event names to add
	 * the listener to.
	 * @param {Number} [priority=0] - The priority of listener. The higher the
	 * priority, the sooner it will be executed.
	 * @param {Function} listener - A function to call when the event is emitted.
	 * @returns {HookEmitter}
	 * @access public
	 */
	on(event, priority = 0, listener) {
		if (!event || typeof event !== 'string') {
			throw new TypeError('Expected event name to be a valid string.');
		}

		if (typeof priority === 'function') {
			listener = priority;
			priority = 0;
		}

		if (typeof priority !== 'number') {
			throw new TypeError('Expected priority to be a number.');
		}

		if (typeof listener !== 'function') {
			throw new TypeError('Expected listener to be a function.');
		}

		let events = event.split(/\s/);
		let evt;

		while (evt = events.shift()) {
			if (evt) {
				let listeners = this._events.get(evt);
				if (!listeners) {
					this._events.set(evt, listeners = []);
				}
				listeners.push({ listener, priority });
			}
		}

		return this;
	}

	/**
	 * Adds an event listener that will only be called once.
	 *
	 * @param {String} event - One or more space-separated event names to add
	 * the listener to.
	 * @param {Number} [priority=0] - The priority of listener. The higher the
	 * priority, the sooner it will be executed.
	 * @param {Function} listener - A function to call when the event is emitted.
	 * @returns {HookEmitter}
	 * @access public
	 */
	once(event, priority = 0, listener) {
		if (!event || typeof event !== 'string') {
			throw new TypeError('Expected event name to be a valid string.');
		}

		if (typeof priority === 'function') {
			listener = priority;
			priority = 0;
		} else if (typeof priority !== 'number') {
			throw new TypeError('Expected priority to be a number.');
		}

		if (typeof listener !== 'function') {
			throw new TypeError('Expected listener to be a function.');
		}

		let events = event.split(/\s/);

		for (let evt of events) {
			if (evt) {
				let listeners = this._events.get(evt);
				if (!listeners) {
					this._events.set(evt, listeners = []);
				}
				let wrapper = function () {
					this.off(evt, wrapper);
					listener.apply(this, arguments);
				}.bind(this);
				listeners.push({ listener: wrapper, priority });
			}
		}

		return this;
	}

	/**
	 * Removes an event listener.
	 *
	 * @param {String} event - One or more space-separated event names to remove
	 * the listener from.
	 * @param {Function} [listener] - The listener function. If not specified,
	 * then all listeners for the specified event are removed.
	 * @returns {HookEmitter}
	 * @access public
	 */
	off(event, listener) {
		if (!event || typeof event !== 'string') {
			throw new TypeError('Expected event name to be a valid string.');
		}

		if (listener && typeof listener !== 'function') {
			throw new TypeError('Expected listener to be a function.');
		}

		let events = event.split(/\s/);
		let evt;

		while (evt = events.shift()) {
			if (!listener) {
				// remove them all
				this._events.delete(evt);
				continue;
			}

			let listeners = this._events.get(evt);
			if (!listeners) {
				continue;
			}

			const len = listeners.length;

			if (len === 1 && listeners[0].listener === listener) {
				// there was only one event and this was it, so
				// nuke the entire event from the map
				this._events.delete(evt);
				continue;
			}

			for (let i = 0; i < len; i++) {
				if (listeners[i].listener === listener) {
					listeners.splice(i, 1);
					break;
				}
			}
		}

		return this;
	}

	/**
	 * Converts an array of listeners into a promise chain
	 *
	 * @param {Object} [opts] - Various options.
	 * @param {Function} [opts.callback] - An optional function to call after
	 * all listeners have been fired.
	 * @param {Function} [opts.transform] - An function that transforms a result
	 * with the original payload.
	 * @param {String} [opts.type] - The event type.
	 * @returns {Function}
	 * @access private
	 */
	compose({ type, callback, transform }) {
		if (callback && typeof callback !== 'function') {
			throw new TypeError('Expected callback to be a function.');
		}

		if (typeof transform !== 'function') {
			// define the default transform for passing results to the next
			// listener in the chain
			transform = (result, payload) => ({
				type: payload.type,
				args: result || payload.args
			});
		}

		// create the function that fetches the events since the list of
		// listeners may change before the hook is called
		const getListeners = () => {
			const listeners = this._events.get(type) || [];
			if (!Array.isArray(listeners)) {
				throw new TypeError('Expected listeners to be an array.');
			}

			const linkedListeners = this._links.map(link => {
				return link.emitter.events.get((link.prefix || '') + type) || [];
			});

			return listeners
				.concat.apply(listeners, linkedListeners)
				.sort((a, b) => b.priority - a.priority)
				.map(p => {
					if (typeof p.listener !== 'function') {
						throw new TypeError('Expected listener to be a function.');
					}
					return p.listener;
				});
		};

		// return the wrapped function
		return function (...args) {
			const listeners = getListeners();
			const ctx = this;

			if (callback) {
				listeners.push(callback);
			}

			log(`running chain with ${listeners.length} listeners`);

			// start the chain and return its promise
			return dispatch({
				type: type,
				args: args
			}, 0);

			function dispatch(payload, i) {
				let listener = listeners[i];
				if (!listener) {
					log('end of the line');
					return Promise.resolve(payload);
				}

				return new Promise((resolve, reject) => {
					let fired = false;

					// construct the args
					const args = [ ...(Array.isArray(payload.args) ? payload.args : [ payload.args ]), function next(result) {
						if (fired) {
							log('next() already fired');
							return;
						}

						fired = true;

						// if somebody mixes paradigms and calls next().then(),
						// at least their function will wait for the next listener
						return dispatch(result || payload, i + 1)
							.then(result => result || payload)
							.catch(reject);
					} ];

					log(`calling listener ${i}`);

					// call the listener
					let result = listener.apply(ctx, args);

					log('listener returned:', result);

					if (result === undefined && fired) {
						result = Promise.resolve();
					}

					// if we got back a promise, we have to wait
					if (result instanceof Promise) {
						return result
							.then(result => {
								result = transform(result, payload);
								return fired ? result : dispatch(result, i + 1);
							})
							.then(resolve)
							.catch(reject);
					}

					return dispatch(transform(result, payload), i + 1)
						.then(resolve, reject);
				});
			}
		};
	}

	/**
	 * Emits one or more events.
	 *
	 * @param {String} event - The name of the event to emit.
	 * @param {...*} [args] - One or more additional arguments to be emitted
	 * with the event.
	 * @returns {Promise}
	 * @access public
	 */
	emit(event, ...args) {
		if (!event || typeof event !== 'string') {
			throw new TypeError('Expected event name to be a valid string.');
		}

		return this.compose({
			type: event
		}).apply(this, args);
	}

	/**
	 * Creates a function hook.
	 *
	 * @param {String} event - The name of the hook's event.
	 * @param {Object} [ctx] - The context to run the function in. Useful if
	 * `fn` is going to be overwritten.
	 * @param {Function} fn - The function being hooked up.
	 * @returns {Function}
	 * @access public
	 */
	hook(event, ctx, fn) {
		if (!event || typeof event !== 'string') {
			throw new TypeError('Expected event name to be a valid string.');
		}

		// shift arguments if necessary
		if (typeof ctx === 'function' && !fn) {
			fn = ctx;
			ctx = null;
		}

		if (ctx && typeof ctx !== 'object') {
			throw new TypeError('Expected context to be an object.');
		}

		if (typeof fn !== 'function') {
			throw new TypeError('Expected hooked function to be a function.');
		}

		return (...args) => {
			const data = {
				type: event,
				fn,
				args,
				ctx
			};

			log(`creating chain: ${event}`);

			const chain = this.compose({
				type: event,
				callback: async function (...args) {
					log('firing callback...');
					this.result = await this.fn.apply(this.ctx, this.args);
					log('callback result =', this.result);
					return this;
				},
				transform: (result, data) => result || data
			});

			return chain.apply(data, data.args).then(data => data.result);
		};
	}

	/**
	 * Links all listeners from another hook emitter into this instance. When an
	 * event is emitted, it will notify all of this instance's listeners, then
	 * notify all linked hook emitter's listeners. Same applies to hooked
	 * functions.
	 *
	 * @param {HookEmitter} emitter - A hook emitter to link to.
	 * @param {String} [prefix] - A string to prefix to all emitted event names.
	 * @returns {HookEmitter}
	 * @access public
	 */
	link(emitter, prefix) {
		if (!(emitter instanceof HookEmitter)) {
			throw new TypeError('Expected argument to be a HookEmitter.');
		}

		this._links.push({ emitter, prefix });

		return this;
	}

	/**
	 * Unlinks all listeners from another hook emitter from this instance.
	 *
	 * @param {HookEmitter} emitter - A hook emitter to unlink.
	 * @returns {HookEmitter}
	 * @access public
	 */
	unlink(emitter) {
		if (!(emitter instanceof HookEmitter)) {
			throw new TypeError('Expected argument to be a HookEmitter.');
		}

		for (let i = 0; i < this._links.length; i++) {
			if (this._links[i].emitter === emitter) {
				this._links.splice(i--, 1);
			}
		}

		return this;
	}
}

export { HookEmitter };
export default HookEmitter;
