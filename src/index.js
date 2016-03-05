import 'source-map-support/register';

/**
 * Emits events and hooks to synchronous and asynchronous listeners.
 */
export class HookEmitter {
	/**
	 * Constructs an HookEmitter object.
	 */
	constructor() {
		this._events = new Map();
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
	 * @param {String} event - One or more space-separated event names to add the listener to.
	 * @param {Function} listener - A function to call when the event is emitted.
	 * @returns {HookEmitter}
	 * @access public
	 */
	on(event, listener) {
		if (!event || typeof event !== 'string') {
			throw new TypeError('Expected event name to be a valid string.');
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
				listeners.push(listener);
			}
		}

		return this;
	}

	/**
	 * Adds an event listener that will only be called once.
	 *
	 * @param {String} event - One or more space-separated event names to add the listener to.
	 * @param {Function} listener - A function to call when the event is emitted.
	 * @returns {HookEmitter}
	 * @access public
	 */
	once(event, listener) {
		if (!event || typeof event !== 'string') {
			throw new TypeError('Expected event name to be a valid string.');
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
				listeners.push(wrapper);
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

			if (len === 1 && listeners[0] === listener) {
				// there was only one event and this was it, so
				// nuke the entire event from the map
				this._events.delete(evt);
				continue;
			}

			for (let i = 0; i < len; i++) {
				if (listeners[i] === listener) {
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
	 * @param {Object} type - The event type.
	 * @param {Function} [callback] - An optional function to call after all listeners have been fired.
	 * @param {Function} [transform] - An function that transforms a result with the original payload.
	 * @returns {Function}
	 * @access private
	 */
	compose({ type, callback, transform }) {
		if (callback && typeof callback !== 'function') {
			throw new TypeError('Expected callback to be a function.');
		}

		// create the function that fetches the events since the list of
		// listeners may change before the hook is called
		const getListeners = () => this._events.get(type);

		// return the wrapped function
		return (...args) => {
			const listeners = getListeners() || [];

			if (!Array.isArray(listeners)) {
				throw new TypeError('Expected listeners to be an array.');
			}

			for (const listener of listeners) {
				if (typeof listener !== 'function') {
					throw new TypeError('Expected listener to be a function.');
				}
			}

			// clone the listeners
			const _listeners = callback ? listeners.concat(callback) : listeners.slice();
			let index = -1;

			// start the chain and return its promise
			return dispatch({
				type: type,
				args: args
			}, 0);

			function dispatch(payload, i) {
				if (i <= index) {
					// next() was called multiple times, but there's nothing we can do about
					// it except break the chain... no error will ever be propagated
					return Promise.reject(new Error('next() was called multiple times'));
				}
				index = i;

				let listener = _listeners[i];
				if (!listener) {
					return Promise.resolve(payload);
				}

				return new Promise((resolve, reject) => {
					let fired = null;
					let pending = false;

					const args = [...payload.args, function next(err, result) {
						fired = { err, result };

						if (err) {
							return Promise.reject(err);
						}

						if (typeof transform === 'function') {
							result = transform(result, payload);
						}

						return dispatch(result || payload, i + 1)
							.then(result => {
								if (pending) {
									resolve(result || payload);
								} else {
									return result;
								}
							})
							.catch(reject);
					}];

					let result = listener.apply(null, args);

					if (result instanceof Promise) {
						if (fired) {
							return result.then(resolve, reject);
						}

						return result
							.then(result => {
								if (typeof transform === 'function') {
									result = transform(result, payload);
								}
								return dispatch(result || payload, i + 1);
							})
							.then(result => resolve(result || payload))
							.catch(reject);
					}

					if (fired) {
						return fired.err ? reject(fired.err) : resolve(fired.result || payload);
					}

					// if the listener has more args than the number of args in
					// the payload, then assume that it expects a callback and
					// we must wait
					if (result === undefined && listener.length > payload.args.length) {
						pending = true;
						return;
					}

					if (typeof transform === 'function') {
						result = transform(result, payload);
					}

					dispatch(result || payload, i + 1)
						.then(resolve, reject);
				});
			}
		};
	}

	/**
	 * Emits one or more events.
	 *
	 * @param {String} event - The name of the event to emit.
	 * @param {...*} [args] - One or more additional arguments to be emitted with the event.
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
	 * @param {Object} [ctx] - The context to run the function in. Useful if `fn` is going to be overwritten.
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
				fn: fn,
				args: args,
				ctx: ctx,
				result: undefined
			};

			const chain = this.compose({
				type: event,
				callback: async (evt) => {
					const it = evt || data;
					it.result = await it.fn.apply(it.ctx, it.args);
					return it;
				},
				transform: (result, data) => {
					if (result !== undefined) {
						data.args[0] = result;
					}
					return data;
				}
			});

			return chain(data).then(data => data.args[0].result);
		};
	}
}
