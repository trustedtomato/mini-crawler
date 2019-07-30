const Crawler = require('.');

test('crawls Wikipedia', (done) => {
  const articles = [];
  const crawler = new Crawler({
    absoluteUrl: 'https://hu.wikipedia.org/',
  }, (err, { body }) => {
    const titleRegex = /<title>(.*?) – Wikipédia<\/title>/;
    const articleUrlRegex = /href="(\/wiki\/.*?)"/g;
    articles.push(body.match(titleRegex)[1].trim());
    if (articles.length === 3) {
      done();
    }
    let articleUrlMatch;
    while ((articleUrlMatch = articleUrlRegex.exec(body)) !== null) {
      crawler.queue(articleUrlMatch[1]);
    }
  });
  crawler.queue('/wiki/Csaknekedkisl%C3%A1ny');
});
