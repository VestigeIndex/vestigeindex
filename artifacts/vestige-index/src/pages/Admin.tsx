import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { ADMIN_USER, ADMIN_PASS, EVM_FEE_ADDRESS, SOL_FEE_ADDRESS } from "../lib/constants";
import { X, Trash2, Lock } from "lucide-react";

interface AdminProps {
  onClose: () => void;
}

const MOCK_COMMENTS_ADMIN = [
  { id: "1", author: "CryptoWatcher", content: "Vestige Index es exactamente lo que necesitaba...", flagged: false },
  { id: "2", author: "BlockchainBob", content: "Llevo meses buscando algo asi...", flagged: false },
  { id: "3", author: "SolanaKing", content: "El soporte de Phantom es impecable...", flagged: false },
  { id: "17", author: "ChineseWhale", content: "很好的平台。支持中文界面...", flagged: true },
];

const MOCK_FEES = [
  { date: "2025-04-01", tx: "0xabc123...", amount: "0.42 USDT", network: "EVM" },
  { date: "2025-04-03", tx: "0xdef456...", amount: "1.20 USDT", network: "EVM" },
  { date: "2025-04-05", tx: "BpazU34a...", amount: "0.75 SOL", network: "Solana" },
  { date: "2025-04-08", tx: "0xghi789...", amount: "2.10 USDT", network: "EVM" },
  { date: "2025-04-10", tx: "0xjkl012...", amount: "0.88 USDT", network: "EVM" },
];

const MOCK_TOKENS = [
  { symbol: "DPI", listed: true, price: 115.4, volume24: "2.1M" },
  { symbol: "MVI", listed: true, price: 83.2, volume24: "980K" },
  { symbol: "DATA", listed: true, price: 4.12, volume24: "450K" },
  { symbol: "PAXG", listed: true, price: 2380, volume24: "5.4M" },
  { symbol: "XAUt", listed: true, price: 2375, volume24: "3.2M" },
  { symbol: "LINK", listed: true, price: 13.5, volume24: "180M" },
  { symbol: "1INCH", listed: true, price: 0.31, volume24: "42M" },
  { symbol: "OIL", listed: false, price: 82.45, volume24: "—" },
];

export default function Admin({ onClose }: AdminProps) {
  const { lang } = useApp();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"fees" | "tokens" | "comments">("fees");
  const [tokens, setTokens] = useState(MOCK_TOKENS);
  const [comments, setComments] = useState(MOCK_COMMENTS_ADMIN);

  function handleLogin() {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Credenciales incorrectas");
    }
  }

  function toggleToken(symbol: string) {
    setTokens(tokens.map((t) => (t.symbol === symbol ? { ...t, listed: !t.listed } : t)));
  }

  function deleteComment(id: string) {
    setComments(comments.filter((c) => c.id !== id));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">{t(lang, "admin_login")}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        {!loggedIn ? (
          <div className="p-6 flex flex-col gap-4 max-w-sm mx-auto w-full">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t(lang, "username")}</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t(lang, "password")}</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {loginError && <p className="text-xs text-destructive">{loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full py-2 bg-primary text-primary-foreground rounded text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t(lang, "login")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex border-b border-border shrink-0">
              {(["fees", "tokens", "comments"] as const).map((tb) => (
                <button
                  key={tb}
                  onClick={() => setTab(tb)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${tab === tb ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {tb === "fees" ? t(lang, "total_fees") : tb === "tokens" ? t(lang, "manage_tokens") : t(lang, "manage_comments")}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-5">
              {tab === "fees" && (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted rounded p-3">
                      <p className="text-xs text-muted-foreground">EVM Address</p>
                      <p className="text-xs font-mono mt-1 break-all">{EVM_FEE_ADDRESS}</p>
                      <p className="text-lg font-bold mt-2">$5.42 USDT</p>
                    </div>
                    <div className="bg-muted rounded p-3">
                      <p className="text-xs text-muted-foreground">Solana Address</p>
                      <p className="text-xs font-mono mt-1 break-all">{SOL_FEE_ADDRESS.slice(0, 20)}...</p>
                      <p className="text-lg font-bold mt-2">0.75 SOL</p>
                    </div>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Fecha</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">Tx</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Monto</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Red</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_FEES.map((f, i) => (
                        <tr key={i} className="border-b border-border/40">
                          <td className="py-2">{f.date}</td>
                          <td className="py-2 font-mono text-muted-foreground">{f.tx}</td>
                          <td className="py-2 text-right font-medium">{f.amount}</td>
                          <td className="py-2 text-right text-muted-foreground">{f.network}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === "tokens" && (
                <div className="space-y-2">
                  {tokens.map((tk) => (
                    <div key={tk.symbol} className="flex items-center justify-between py-2 px-3 rounded border border-border hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm w-12">{tk.symbol}</span>
                        <span className="text-xs text-muted-foreground">${tk.price}</span>
                        <span className="text-xs text-muted-foreground">Vol: {tk.volume24}</span>
                      </div>
                      <button
                        onClick={() => toggleToken(tk.symbol)}
                        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${tk.listed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
                      >
                        {tk.listed ? "Listado" : "Deslistado"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {tab === "comments" && (
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className={`flex items-start gap-3 p-3 rounded border transition-colors ${c.flagged ? "border-amber-500/50 bg-amber-50/5" : "border-border"}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{c.author}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.content}</p>
                        {c.flagged && <span className="text-xs text-amber-500 font-medium">Marcado</span>}
                      </div>
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="p-1.5 hover:bg-destructive/20 rounded transition-colors text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">Sin comentarios</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
