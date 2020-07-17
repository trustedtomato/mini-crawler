const Crawler = require('.');

test('crawls Wikipedia (absoluteUrl + maxConnections + callback)', (done) => {
  const crawler = new Crawler({
    absoluteUrl: 'https://hu.wikipedia.org/',
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
});

test('sends nothing (error)', () => {
  expect(() => {
    new Crawler().queue('nah');
  }).toThrow(/destruct/i);
});

test('sends no handler (error)', () => {
  expect(() => {
    new Crawler({}).queue('nah');
  }).toThrow(/Handler/i);
});
