import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { useNews } from "../hooks/useNews";
import { Loader2, ExternalLink, RefreshCw } from "lucide-react";

export default function News() {
  const { lang } = useApp();
  const { news, loading, refetch } = useNews();
  const [expanded, setExpanded] = useState<string | null>(null);

  function timeAgo(ts: number): string {
    const diff = Date.now() / 1000 - ts;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{t(lang, "news_title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Actualiza cada 5 minutos — CryptoCompare</p>
        </div>
        <button
          onClick={refetch}
          className="p-2 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && news.length === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground">No hay noticias disponibles</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {news.slice(0, 30).map((item) => (
            <article
              key={item.id}
              className="bg-card border border-card-border rounded-lg overflow-hidden hover:border-border transition-colors flex flex-col"
            >
              {item.imageurl && (
                <div className="h-36 overflow-hidden bg-muted">
                  <img
                    src={item.imageurl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                    {item.source}
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo(item.published_on)} ago</span>
                </div>
                <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2">{item.title}</h3>
                <p className={`text-xs text-muted-foreground leading-relaxed ${expanded === item.id ? "" : "line-clamp-3"}`}>
                  {item.body}
                </p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    className="text-xs text-primary hover:underline"
                  >
                    {expanded === item.id ? "Ver menos" : t(lang, "read_more")}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                  >
                    <ExternalLink size={11} />
                    Fuente
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
