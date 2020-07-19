// @ts-nocheck
import Crawler from './index'

test('crawls Wikipedia (baseUrl + maxConnections + callback)', (done) => {
  /*
  const crawler = new Crawler({
    baseUrl: 'https://hu.wikipedia.org/',
    maxConnections: 2,
    handler: (err, { body }) => {
      const titleRegex = /<title>(.*?) – Wikipédia<\/title>/;
      const articleUrlRegex = /href="(\/wiki\/.*?)"/g;
      const references = [];
      while ((articleUrlMatch = articleUrlRegex.exec(body)) !== null) {
        references.push(articleUrlMatch[1]);
      }
      return {
        title: body.match(titleRegex)[1].trim(),
        references,
      };
    },
  });
  crawler.queue({
    url: '/wiki/Csaknekedkisl%C3%A1ny',
    callback: ({ title, references }) => {
      expect(title).toBe('Csaknekedkislány');
      references.slice(0, 4).forEach((reference) => {
        crawler.queue({ url: reference });
      });
      expect(crawler.urlQueue.length).toBe(3);
      expect(crawler.running).toBe(2);
      done();
    },
  });
  */
  done()
})

test('sends no handler (error)', () => {
  expect(new Crawler({}).crawl()).rejects.toThrow(/No options object present/i)

  expect(new Crawler().crawl({})).rejects.toThrow(/callback property/i)
});
