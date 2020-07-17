const { default: PQueue } = require('p-queue');
const got = require('got');
const urlLib = require('url');

class Crawler {
  constructor({ pQueueOptions, gotDefaultOptions }) {
    this.queue = new PQueue(pQueueOptions);
    this.gotDefaultOptions = gotDefaultOptions;
    this.visited = [];
  }

  async crawlNext(x, { url, gotOptions, callback }) {
    if (typeof x === 'string') {
      await this.crawl({ url: urlLib.resolve(url, x), gotOptions, callback });
    } else if (typeof x[Symbol.iterator] === 'function') {
      await Promise.all(
        [...x].map((xMember) => this.crawlNext(xMember, { url, gotOptions, callback })),
      );
    } else if (typeof x === 'object') {
      await this.crawl({
        gotOptions,
        callback,
        ...x,
        url: urlLib.resolve(url, x.url),
      });
    }
  }

  async crawl({ url, gotOptions, callback }) {
    // eslint-disable-next-line no-param-reassign
    url = urlLib.resolve(url, '');
    if (this.visited.includes(url)) {
      return;
    }
    this.visited.push(url);

    this.queue.add(async () => {
      const body = await got(
        url,
        {
          ...this.gotDefaultOptions,
          ...gotOptions,
          isStream: false,
          resolveBodyOnly: true,
        },
      );

      this.crawlNext(callback(body, url), { url, gotOptions, callback });
    });
  }
}

const crawler = new Crawler({
  pQueueOptions: {
    concurrency: 2,
    intervalCap: 1,
    interval: 1000,
  },
});

crawler.crawl({
  url: 'https://en.wikipedia.org/wiki/Elmo',
  callback(body, url) {
    const titleRegex = /<title>(.*?) – Wikipédia<\/title>/;

    const title = body.match(titleRegex)?.[1].trim();
    console.log(`\x1b[32m${url}\x1b[0m ${title}`);

    const articleUrlRegex = /href="(\/wiki\/.*?)"/g;
    const articleUrlMatches = [...body.matchAll(articleUrlRegex)];
    const newUrls = articleUrlMatches.map(([, newUrl]) => newUrl);
    return newUrls;
  },
});
