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

test('crawls Ultimate-guitar (drain + callback)', (done) => {
  const artistUrls = [];
  const artistCrawler = new Crawler({
    gap: 1000,
    handler: async (err, { body }) => {
      if (err) {
        throw err;
      }
      const ugappStorePage = body.match(/UGAPP\.store\.page\s*=\s*(\{.*\});\n\s+/);
      const page = JSON.parse(ugappStorePage[1]);
      const urls = page.data.artists.map(({ artist_url: url }) => url);
      artistUrls.push(...urls);
      return urls;
    },
  });

  artistCrawler.on('drain', () => {
    expect(artistUrls.length > 0).toBe(true);
    done();
  });

  artistCrawler.queue({
    url: 'https://www.ultimate-guitar.com/bands/a.htm',
    callback: (result1) => {
      expect(result1.length).toBeGreaterThan(0);
      expect(result1).toContain('/artist/a_b_the_sea_28115');
      artistCrawler.queue({
        url: 'https://www.ultimate-guitar.com/bands/a10000.htm',
        callback: (result2) => {
          expect(result2.length).toBe(0);
        },
      });
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
