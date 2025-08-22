import * as cheerio from 'cheerio';

export interface Headline {
  title: string;
  url: string;
  content?: string;
}

export const fetchHeadlines = async (): Promise<Headline[]> => {
  try {
    const response = await fetch('https://www.indiatoday.in/');
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const headlines: { title: string, url: string }[] = [];
    const addedUrls = new Set<string>();

    // Strategy 1: Find a container with "LATEST STORIES" and get links from there.
    const latestStoriesContainer = $('h4:contains("LATEST STORIES"), h2:contains("LATEST STORIES")').first().parent();

    if (latestStoriesContainer.length > 0) {
        latestStoriesContainer.find('a').each((i, el) => {
            const title = $(el).text().trim();
            const url = $(el).attr('href');

            if (title && url && url.includes('/story/')) {
                const absoluteUrl = url.startsWith('http') ? url : `https://www.indiatoday.in${url}`;
                if (!addedUrls.has(absoluteUrl)) {
                    headlines.push({ title, url: absoluteUrl });
                    addedUrls.add(absoluteUrl);
                }
            }
        });
    }

    // Strategy 2: Fallback to generic headline tags if the first strategy is not enough.
    if (headlines.length < 10) {
        $('h2 > a, h3 > a').each((i, el) => {
            if (addedUrls.size >= 10) return false; // Stop when we have 10

            const title = $(el).text().trim();
            const url = $(el).attr('href');

            if (title && url && url.includes('/story/')) {
                 const absoluteUrl = url.startsWith('http') ? url : `https://www.indiatoday.in${url}`;
                 if (!addedUrls.has(absoluteUrl)) {
                    headlines.push({ title, url: absoluteUrl });
                    addedUrls.add(absoluteUrl);
                }
            }
        });
    }

    const headlinesWithContent = await Promise.all(
      headlines.slice(0, 10).map(async (headline) => {
        try {
          const articleResponse = await fetch(headline.url);
          if (!articleResponse.ok) {
            return { ...headline, content: '' };
          }
          const articleHtml = await articleResponse.text();
          const $article = cheerio.load(articleHtml);
          // A common selector for article bodies. This might need adjustment.
          const content = $article('.description').text().trim();
          return { ...headline, content };
        } catch (error) {
          console.error(`Failed to fetch content for ${headline.url}:`, error);
          return { ...headline, content: '' };
        }
      })
    );

    return headlinesWithContent;
  } catch (error) {
    console.error('Error scraping headlines:', error);
    return [];
  }
};
