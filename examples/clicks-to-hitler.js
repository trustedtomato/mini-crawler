const Crawler = require('..');

const startingWikiPage = process.argv[2] || 'Elmo';

// setup crawler
const crawler = new Crawler({
  pQueueOptions: {
    concurrency: 5,
    interval: 500,
    intervalCap: 2,
  },
});

// utility functions
const getWikiPageApiUrl = (wikiPage) => `https://en.wikipedia.org/w/api.php?action=parse&page=${wikiPage}&prop=text&formatversion=2&format=json`;
const clickHistoryToText = (clickHistory) => {
  if (clickHistory.length === 0) {
    return 'You are on the Adolf Hitler page duh.';
  }
  if (clickHistory.length === 1) {
    return `Just click ${clickHistory[0]}!`;
  }
  return `Click ${clickHistory.slice(0, -1).join(', ')} then ${clickHistory[clickHistory.length - 1]}!`;
};

// start crawling
crawler.crawl({
  url: getWikiPageApiUrl(startingWikiPage),
  data: {
    // store the titles of the articles
    titleHistory: [],
    // store the link which the algorithm "clicked on"
    clickHistory: [],
  },
  callback: ({
    body,
    options: {
      url,
      data: {
        titleHistory,
        clickHistory,
      },
    },
  }) => {
    const page = JSON.parse(body);
    if (!page.parse) {
      console.error(`No parse property at ${url}`);
      return null;
    }

    const { title } = page.parse;
    const text = page.parse.text
    // Remove text after References (inclusive) since that is not really a part of the article.
      .replace(/<span [^<>]*?id="?References"?[^<>]*?>\s*References\s*<\/span>[\s\S]*/, '');

    const newTitleHistory = titleHistory.concat([title]);
    console.log(`\x1b[32m${newTitleHistory.join(' → ')}\x1b[0m ${url}`);

    const wikiPageRegex = /href="\/wiki\/(.*?)(?:#.*?)?".*?>(.*?)</g;
    const wikiPageMatches = [...text.matchAll(wikiPageRegex)];
    const wikiPages = wikiPageMatches
      .map(([, id, referrer]) => ({
        id,
        referrer,
      }))
      // Remove wikiPages which are not regular articles.
      .filter((wikiPage) => !wikiPage.id.startsWith('Help:')
        && !wikiPage.id.startsWith('File:')
        && !wikiPage.id.startsWith('Wikipedia:'));

    const hitlerPage = wikiPages.find(({ id }) => id === 'Adolf_Hitler');
    if (hitlerPage) {
      console.log(`\x1b[32m${newTitleHistory.concat(['Adolf Hitler']).join(' → ')}\x1b[0m https://en.wikipedia.org/wiki/Adolf_Hitler`);
      console.log('We have successfully found our way to Hitler!');
      console.log(clickHistoryToText(clickHistory.concat([hitlerPage.referrer])));
      crawler.reset();
      return null;
    }

    return wikiPages.map((wikiPage) => ({
      url: getWikiPageApiUrl(wikiPage.id),
      data: {
        titleHistory: newTitleHistory,
        clickHistory: clickHistory.concat([wikiPage.referrer]),
      },
    }));
  },
});
