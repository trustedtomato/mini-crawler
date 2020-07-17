const { URL } = require('url');
const { EventEmitter } = require('events');

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

module.exports = class Crawler extends EventEmitter {
  constructor({
    gap = 0,
    maxConnections = 1,
    baseUrl = undefined,
    handler,
    request = require('got'),
  } = {}) {
    super();
    if (typeof handler === 'undefined') throw new Error('Handler is undefined!');
    this.baseUrl = baseUrl;
    this.gap = gap;
    this.maxConnections = maxConnections;
    this.handler = handler;
    this.urlQueue = [];
    this.running = 0;
    this.request = request
  }

  queue({
    url,
    params,
    callback,
  }) {
    if (typeof url === 'undefined') throw new Error('Queued URL is undefined!');
    if (typeof callback !== 'undefined' && typeof callback !== 'function') throw new Error('Callback must be a function!');
    this.urlQueue.push({
      url,
      params,
      callback,
    });
    this.tryQueueShift();
  }

  tryQueueShift() {
    if (this.running < this.maxConnections && this.urlQueue.length > 0) {
      this.running += 1;
      const { url, params, callback } = this.urlQueue.shift();
      request(
        new URL(url, this.absoluteUrl).href,
        (err, response, body) => {
          Promise.resolve(
            this.handler(err, {
              ...response,
              params,
              body,
            }),
          ).then(async (result) => {
            if (callback) {
              await callback(result);
            }
            if (this.gap > 0) {
              await wait(this.gap);
            }
            this.running -= 1;
            if (this.urlQueue.length === 0 && this.running === 0) {
              this.emit('drain');
            } else {
              this.tryQueueShift();
            }
          });
        },
      );
    }
  }
};
