import * as cheerio from 'cheerio';

export interface Headline {
  title: string;
  url: string;
  summary?: string;
  keyPoints?: string[];
}

export const fetchHeadlines = async (): Promise<Headline[]> => {
  try {
    const response = await fetch('https://www.indiatoday.in/');
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const headlines: Headline[] = [];
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

    return Array.from(headlines).slice(0, 10);
  } catch (error) {
    console.error('Error scraping headlines:', error);
    return [];
  }
};
