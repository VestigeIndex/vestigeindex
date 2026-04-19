import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { ThumbsUp, ThumbsDown, Send, AlertCircle } from "lucide-react";
import { EVM_FEE_ADDRESS, COMMENT_FEE_USDT } from "../lib/constants";

interface Comment {
  id: string;
  author: string;
  address: string;
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  userVote: "like" | "dislike" | null;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: "1", author: "CryptoWatcher", address: "0xA3b4...9cDe", content: "Vestige Index es exactamente lo que necesitaba: un solo lugar para ver indices DeFi, commodities y top 100. Sin KYC, sin custodiar mis activos.", timestamp: new Date(Date.now() - 3600000 * 2), likes: 42, dislikes: 2, userVote: null },
  { id: "2", author: "BlockchainBob", address: "0xF1e2...3bAa", content: "Llevo meses buscando algo asi. Transparencia total en las comisiones y acceso a indices tokenizados sin intermediarios.", timestamp: new Date(Date.now() - 3600000 * 5), likes: 31, dislikes: 5, userVote: null },
  { id: "3", author: "SolanaKing", address: "BpazU...oNLt", content: "El soporte de Phantom es impecable. Swaps en Solana funcionan perfectamente. La interfaz es muy limpia y profesional.", timestamp: new Date(Date.now() - 3600000 * 8), likes: 28, dislikes: 1, userVote: null },
  { id: "4", author: "DeFi_Maxima", address: "0x5cAb...77Ff", content: "Tengo mucho dinero en DPI y MVI. El feed de precios en tiempo real es fundamental para tomar decisiones.", timestamp: new Date(Date.now() - 86400000), likes: 19, dislikes: 3, userVote: null },
  { id: "5", author: "GoldBug2025", address: "0xD9e1...2bCc", content: "Finalmente puedo comprar PAXG y XAUt sin registrarme en ningun exchange centralizado. La filosofia sin KYC es el futuro.", timestamp: new Date(Date.now() - 86400000 * 2), likes: 55, dislikes: 4, userVote: null },
  { id: "6", author: "Whale_Alert", address: "0xB7f3...1aDd", content: "La calculadora de interes compuesto me ayudo a planificar mi estrategia de largo plazo. Muy util el conversor de divisas tambien.", timestamp: new Date(Date.now() - 86400000 * 2 - 3600000), likes: 14, dislikes: 0, userVote: null },
  { id: "7", author: "MetaMaskPro", address: "0xC2d4...8eEe", content: "La conexion con MetaMask es instantanea. El flujo de aprobacion antes del swap da seguridad total.", timestamp: new Date(Date.now() - 86400000 * 3), likes: 22, dislikes: 2, userVote: null },
  { id: "8", author: "IndexInvestor", address: "0xE5b6...4fFf", content: "El ticker de precios en tiempo real es muy util. Ver BTC, ETH, S&P y DAX en una sola barra es excelente.", timestamp: new Date(Date.now() - 86400000 * 3 - 7200000), likes: 17, dislikes: 1, userVote: null },
  { id: "9", author: "ChainlinkFan", address: "0x1aB2...6gGg", content: "Gran que hayan incluido LINK en los indices. Es infraestructura critica para todo el ecosistema cripto.", timestamp: new Date(Date.now() - 86400000 * 4), likes: 33, dislikes: 6, userVote: null },
  { id: "10", author: "CryptoNews247", address: "0x3cD4...8hHh", content: "El feed de noticias de CryptoCompare es muy completo. Actualiza cada 5 minutos y cubre todas las fuentes principales.", timestamp: new Date(Date.now() - 86400000 * 4 - 3600000), likes: 11, dislikes: 0, userVote: null },
  { id: "11", author: "OneInchFan", address: "0x5eE6...0iIi", content: "El soporte de 1INCH como token de indice es brillante. Es el mayor agregador DEX y merece su lugar aqui.", timestamp: new Date(Date.now() - 86400000 * 5), likes: 26, dislikes: 3, userVote: null },
  { id: "12", author: "Web3Builder", address: "0x7gG8...2jJj", content: "La hoja de ruta del Manifiesto es muy ambiciosa. Me convence la vision de activos con historial probado.", timestamp: new Date(Date.now() - 86400000 * 5 - 7200000), likes: 39, dislikes: 7, userVote: null },
  { id: "13", author: "CryptoTrader_ES", address: "0x9iI0...4kKk", content: "Interface en espanol es un gran plus. Muchos exchanges no tienen soporte en castellano. Aqui se nota el detalle.", timestamp: new Date(Date.now() - 86400000 * 6), likes: 48, dislikes: 1, userVote: null },
  { id: "14", author: "BitcoinMaxi", address: "0xBkK2...6lLl", content: "Aunque soy BTC maxi, reconozco que la plataforma tiene mucho valor para el ecosistema cripto en general.", timestamp: new Date(Date.now() - 86400000 * 6 - 3600000), likes: 15, dislikes: 12, userVote: null },
  { id: "15", author: "DeFi_Analyst", address: "0xDmM4...8nNn", content: "Las comisiones del 0.3% para top 100 y 0.5% para indices son muy competitivas. Totalmente transparentes.", timestamp: new Date(Date.now() - 86400000 * 7), likes: 62, dislikes: 2, userVote: null },
  { id: "16", author: "MultichainUser", address: "0xFnN6...0oOo", content: "Soporte EVM + Solana en una sola plataforma sin KYC es revolucionario. Esperando Tron y BTC tambien.", timestamp: new Date(Date.now() - 86400000 * 7 - 7200000), likes: 29, dislikes: 3, userVote: null },
  { id: "17", author: "ChineseWhale", address: "0x2pP8...2qQq", content: "很好的平台。支持中文界面太棒了！希望能继续开发更多功能。", timestamp: new Date(Date.now() - 86400000 * 8), likes: 44, dislikes: 1, userVote: null },
  { id: "18", author: "SecurityFirst", address: "0x4rR0...4sSs", content: "Sin custodia es la clave. Mis fondos siempre en mi wallet. Ninguna plataforma CeFi me da esa seguridad.", timestamp: new Date(Date.now() - 86400000 * 8 - 3600000), likes: 71, dislikes: 0, userVote: null },
  { id: "19", author: "IndexFundFan", address: "0x6tT2...6uUu", content: "Me recuerda a los fondos indexados de Vanguard pero en cripto. Simple, eficiente y sin burocracia.", timestamp: new Date(Date.now() - 86400000 * 9), likes: 35, dislikes: 4, userVote: null },
  { id: "20", author: "FutureMoney", address: "0x8vV4...8wWw", content: "Esta plataforma es el futuro de las finanzas descentralizadas. Sin bancos, sin KYC, sin fronteras.", timestamp: new Date(Date.now() - 86400000 * 10), likes: 88, dislikes: 5, userVote: null },
];

export default function Community() {
  const { lang, wallet } = useApp();
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  function timeAgo(date: Date): string {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  async function handlePost() {
    if (!wallet.connected || !newComment.trim()) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 1500));
    const comment: Comment = {
      id: Date.now().toString(),
      author: `User_${wallet.address.slice(2, 7)}`,
      address: wallet.address,
      content: newComment.trim(),
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      userVote: null,
    };
    setComments([comment, ...comments]);
    setNewComment("");
    setPosting(false);
  }

  function vote(id: string, type: "like" | "dislike") {
    setComments(
      comments.map((c) => {
        if (c.id !== id) return c;
        if (c.userVote === type) {
          return { ...c, [type === "like" ? "likes" : "dislikes"]: c[type === "like" ? "likes" : "dislikes"] - 1, userVote: null };
        }
        if (c.userVote) {
          const prev = c.userVote;
          return {
            ...c,
            [prev === "like" ? "likes" : "dislikes"]: c[prev === "like" ? "likes" : "dislikes"] - 1,
            [type === "like" ? "likes" : "dislikes"]: c[type === "like" ? "likes" : "dislikes"] + 1,
            userVote: type,
          };
        }
        return { ...c, [type === "like" ? "likes" : "dislikes"]: c[type === "like" ? "likes" : "dislikes"] + 1, userVote: type };
      })
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">{t(lang, "comment_wall")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t(lang, "publish_cost")}</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Post form */}
        <div className="bg-card border border-card-border rounded-lg p-4 mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={wallet.connected ? t(lang, "comment_placeholder") : t(lang, "connect_wallet_first")}
            disabled={!wallet.connected}
            rows={3}
            className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertCircle size={12} />
              {t(lang, "post_fee")} — {EVM_FEE_ADDRESS.slice(0, 12)}...
            </div>
            <button
              onClick={handlePost}
              disabled={!wallet.connected || !newComment.trim() || posting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={12} />
              {posting ? "Publicando..." : t(lang, "post_comment")}
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-card-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold">{comment.author[0]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{comment.author}</p>
                    <p className="text-xs text-muted-foreground font-mono">{comment.address}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{timeAgo(comment.timestamp)}</span>
              </div>
              <p className="mt-2.5 text-sm text-foreground leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                <button
                  onClick={() => vote(comment.id, "like")}
                  className={`flex items-center gap-1.5 text-xs transition-colors hover:text-emerald-500 ${comment.userVote === "like" ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}
                >
                  <ThumbsUp size={13} className={comment.userVote === "like" ? "fill-emerald-500" : ""} />
                  {comment.likes}
                </button>
                <button
                  onClick={() => vote(comment.id, "dislike")}
                  className={`flex items-center gap-1.5 text-xs transition-colors hover:text-red-500 ${comment.userVote === "dislike" ? "text-red-500 font-semibold" : "text-muted-foreground"}`}
                >
                  <ThumbsDown size={13} className={comment.userVote === "dislike" ? "fill-red-500" : ""} />
                  {comment.dislikes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
