import { resultToCrawlOptionsArray } from './result-to-crawloptions-array';
import { CrawlOptions } from '.';

const callback = () => {};

const previousOptions1: CrawlOptions = {
  callback,
  url: 'https://example.com/previous',
  data: {
    potato: 'agata'
  }
}

test('undefined to empty array', () => {
  expect(resultToCrawlOptionsArray(undefined, previousOptions1)).toEqual([])
})

test('string to merged singleton', () => {
  expect(resultToCrawlOptionsArray('https://example.com/next', previousOptions1)).toEqual([{
    callback,
    url: 'https://example.com/next',
    data: {
      potato: 'agata'
    }
  }])
})

test('resolving relative URL', () => {
  expect(resultToCrawlOptionsArray('/relative', previousOptions1)).toEqual([{
    callback,
    url: 'https://example.com/relative',
    data: {
      potato: 'agata'
    }
  }])
})

test('object to merged singleton', () => {
  expect(resultToCrawlOptionsArray({
    url: 'https://example.org/',
    gotOptions: {
      responseType: 'json'
    }
  }, previousOptions1)).toEqual([{
    callback,
    url: 'https://example.org/',
    gotOptions: {
      responseType: 'json'
    },
    data: {
      potato: 'agata'
    }
  }])
})

test('array', () => {
  expect(resultToCrawlOptionsArray([
    {
      url: '/next-1',
      data: {
        apple: 'admiral'
      }
    },
    '/next-2'
  ], previousOptions1)).toEqual([{
    callback,
    url: 'https://example.com/next-1',
    data: {
      apple: 'admiral'
    }
  }, {
    callback,
    url: 'https://example.com/next-2',
    data: {
      potato: 'agata'
    }
  }])
})

test('array flattening', () => {
  expect(resultToCrawlOptionsArray([[
    {
      url: '/next-1',
      data: {
        apple: 'admiral'
      }
    },
    [['/next-2']]
  ], [[
    '/next-3'
  ]]], previousOptions1)).toEqual([{
    callback,
    url: 'https://example.com/next-1',
    data: {
      apple: 'admiral'
    }
  }, {
    callback,
    url: 'https://example.com/next-2',
    data: {
      potato: 'agata'
    }
  }, {
    callback,
    url: 'https://example.com/next-3',
    data: {
      potato: 'agata'
    }
  }])
})