import { useState, useEffect, useCallback } from "react";
import { CRYPTOCOMPARE_API_KEY } from "../lib/constants";

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  imageurl: string;
  url: string;
  source: string;
  published_on: number;
  categories: string;
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      const resp = await fetch(
        `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${CRYPTOCOMPARE_API_KEY}`
      );
      if (!resp.ok) throw new Error("News fetch failed");
      const data = await resp.json();
      setNews(data.Data || []);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, 300000);
    return () => clearInterval(id);
  }, [fetchNews]);

  return { news, loading, refetch: fetchNews };
}
