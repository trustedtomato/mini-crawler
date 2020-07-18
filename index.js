const { default: PQueue } = require('p-queue');
const got = require('got');
const urlLib = require('url');

module.exports = class Crawler {
  constructor({ pQueueOptions, gotDefaultOptions } = {}) {
    this.queue = new PQueue(pQueueOptions);
    this.gotDefaultOptions = gotDefaultOptions;
    this.visited = [];
    this.ongoingRequests = [];
  }

  async crawlNext(next, previousOptions) {
    if (next === undefined || next === null) {
      return;
    }
    if (typeof next === 'string') {
      // next is: an URL string
      await this.crawl({
        ...previousOptions,
        url: urlLib.resolve(previousOptions.url, next),
      });
    } else if (typeof next[Symbol.iterator] === 'function') {
      // next is: an array of nexts (or something like that)
      await Promise.all(
        [...next].map((nextMember) => this.crawlNext(nextMember, previousOptions)),
      );
    } else if (typeof next === 'object') {
      // next is: an options object
      await this.crawl({
        ...previousOptions,
        ...next,
        url: urlLib.resolve(previousOptions.url, next.url),
      });
    }
  }

  async crawl(options) {
    if (!options) {
      throw new Error('No options object present!');
    }
    if (typeof options.callback !== 'function') {
      throw new Error('The options object should have a callback property (function)!');
    }
    if (typeof options.url !== 'string') {
      throw new Error('The options object should have an url property (string)!');
    }

    const { gotOptions, callback } = options;
    const url = urlLib.resolve(options.url, '');

    if (this.visited.includes(url)) {
      return;
    }
    this.visited.push(url);

    this.queue.add(async () => {
      let request;
      let body;
      let err;
      try {
        request = got(
          url,
          {
            ...this.gotDefaultOptions,
            ...gotOptions,
            isStream: false,
            resolveBodyOnly: true,
          },
        );
        this.ongoingRequests.push(request);
        body = await request;
      } catch (error) {
        err = error;
      }

      if (this.ongoingRequests.includes(request)) {
        this.ongoingRequests.splice(this.ongoingRequests.indexOf(request), 1);
      }

      if (request.isCanceled) {
        return;
      }

      const next = await callback({ err, body, options });
      this.crawlNext(next, options);
    });
  }

  reset() {
    this.queue.clear();
    this.ongoingRequests.forEach((ongoingRequest) => {
      ongoingRequest.cancel();
    });
  }
};
