import { ResolvedCallbackResult, CrawlOptions } from './index'
import urlLib from 'url'

const resultToCrawlOptionsArray = (result: ResolvedCallbackResult, previousOptions: CrawlOptions): CrawlOptions[] => {
  if (result === undefined || result === null) {
    return []
  }
  if (typeof result === 'string') {
    // next is: an URL string
    return [{
      ...previousOptions,
      url: urlLib.resolve(previousOptions.url, result)
    }]
  } else if (Array.isArray(result)) {
    // next is: an array of nexts
    return result.flatMap((resultMember) => resultToCrawlOptionsArray(resultMember, previousOptions))
  } else if (typeof result === 'object') {
    // next is: a PartialCrawlOptions object
    return [{
      ...previousOptions,
      ...result,
      url: urlLib.resolve(previousOptions.url, result.url)
    }]
  }
  return []
}

export default resultToCrawlOptionsArray
export { resultToCrawlOptionsArray }