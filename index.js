const request = require('request');
const { URL } = require('url');

module.exports = class Crawler {
  constructor({
    gap = 0,
    maxConnections = 1,
    absoluteUrl,
  }, handler) {
    this.absoluteUrl = absoluteUrl;
    this.gap = gap;
    this.maxConnections = maxConnections;
    this.handler = handler;
    this.urlQueue = [];
    this.running = 0;
  }

  queue(url, options) {
    this.urlQueue.push({
      url,
      options,
    });
    this.tryQueueShift();
  }

  tryQueueShift() {
    if (this.running < this.maxConnections) {
      this.running += 1;
      const { url, options } = this.urlQueue.shift();
      request(
        new URL(url, this.absoluteUrl).href,
        (err, response, body) => {
          Promise.resolve(
            this.handler(err, {
              ...response,
              options,
              body,
            }),
          ).then(() => {
            setTimeout(() => {
              this.running -= 1;
              this.tryQueueShift();
            }, this.gap);
          });
        },
      );
    }
  }
};
