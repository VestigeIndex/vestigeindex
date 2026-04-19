import React from "react";
import { useApp } from "../context/AppContext";
import { Shield, Flame, TrendingUp, Eye, Percent, Clock, Map } from "lucide-react";

export default function Manifesto() {
  const { lang } = useApp();

  const sections = [
    {
      icon: Shield,
      title: "Sin KYC. Sin Custodia.",
      en: "No KYC. No Custody.",
      body: "Vestige Index opera bajo el principio inquebrantable de soberania financiera. No recopilamos datos personales, no custodiamos activos y no pedimos permiso a ningun gobierno. Tu identidad permanece tuya. Tus fondos permanecen en tu cartera.",
      bodyEn: "Vestige Index operates under the unbreakable principle of financial sovereignty. We do not collect personal data, we do not hold assets, and we do not ask any government for permission. Your identity remains yours. Your funds remain in your wallet.",
      bodyZh: "Vestige Index在财务主权的不可动摇原则下运营。我们不收集个人数据，不托管资产，也不向任何政府申请许可。您的身份保持您的。您的资金保留在您的钱包中。",
    },
    {
      icon: Flame,
      title: "Mint y Burn Transparente",
      en: "Transparent Mint & Burn",
      body: "Todos los indices tokenizados siguen un mecanismo de mint y burn completamente verificable en blockchain. Cada token emitido corresponde a activos subyacentes reales. La escasez y la emision son auditables por cualquier persona en cualquier momento.",
      bodyEn: "All tokenized indices follow a fully verifiable mint and burn mechanism on the blockchain. Each issued token corresponds to real underlying assets. Scarcity and emission are auditable by anyone at any time.",
      bodyZh: "所有代币化指数都遵循区块链上完全可验证的铸造和销毁机制。每个发行的代币对应真实的基础资产。任何人随时都可以审计稀缺性和发行量。",
    },
    {
      icon: Eye,
      title: "Activos con Historial Probado",
      en: "Assets with Proven History",
      body: "No invertimos en proyectos especulativos o sin liquidez. Cada activo en nuestra plataforma —sea BTC, ETH, LINK, o cualquier indice— tiene un historial verificable de adopcion, liquidez y resistencia al tiempo. La calidad sobre la cantidad.",
      bodyEn: "We do not invest in speculative or illiquid projects. Every asset on our platform — whether BTC, ETH, LINK, or any index — has a verifiable history of adoption, liquidity, and time resistance. Quality over quantity.",
      bodyZh: "我们不投资于投机性或非流动性项目。我们平台上的每项资产——无论是BTC、ETH、LINK还是任何指数——都有可验证的采用历史、流动性和时间抵抗力。质量胜于数量。",
    },
    {
      icon: Percent,
      title: "Comisiones Transparentes",
      en: "Transparent Fees",
      body: "Sin costos ocultos. Sin spreads artificiales. El 0.3% sobre activos del top 100 y el 0.5% sobre indices son las unicas comisiones que cobramos. Cada transaccion es publica, cada comision es visible, cada centavo es rastreable en la cadena.",
      bodyEn: "No hidden costs. No artificial spreads. The 0.3% on top 100 assets and 0.5% on indices are the only fees we charge. Every transaction is public, every fee is visible, every cent is traceable on-chain.",
      bodyZh: "没有隐藏费用。没有人为差价。我们收取的费用只有前100资产的0.3%和指数的0.5%。每笔交易都是公开的，每笔费用都是可见的，每一分钱都可以在链上追溯。",
    },
    {
      icon: TrendingUp,
      title: "El Poder del Interes Compuesto",
      en: "The Power of Compound Interest",
      body: "Vestige Index es una plataforma diseñada para el inversor a largo plazo. Creemos que el interes compuesto es la octava maravilla del mundo. Por eso incluimos herramientas para visualizar el crecimiento exponencial de tu capital a lo largo del tiempo.",
      bodyEn: "Vestige Index is a platform designed for the long-term investor. We believe compound interest is the eighth wonder of the world. That is why we include tools to visualize the exponential growth of your capital over time.",
      bodyZh: "Vestige Index是为长期投资者设计的平台。我们相信复利是世界第八大奇迹。这就是为什么我们包含工具来可视化您的资本随时间的指数增长。",
    },
    {
      icon: Clock,
      title: "Resistencia al Tiempo",
      en: "Time Resistance",
      body: "Solo listamos activos que han demostrado capacidad de supervivencia y relevancia durante multiples ciclos de mercado. La volatilidad es temporal. La utilidad real es permanente. Vestige Index filtra el ruido y se enfoca en lo que perdura.",
      bodyEn: "We only list assets that have demonstrated survival capacity and relevance across multiple market cycles. Volatility is temporary. Real utility is permanent. Vestige Index filters the noise and focuses on what endures.",
      bodyZh: "我们只列出在多个市场周期中证明了生存能力和相关性的资产。波动性是暂时的。真实效用是永久的。Vestige Index过滤噪音，专注于持久的事物。",
    },
    {
      icon: Map,
      title: "Hoja de Ruta",
      en: "Roadmap",
      body: "Q2 2025: Lanzamiento del Marketplace top 100 e indices tokenizados. Q3 2025: Integracion de Jupiter (Solana) para swaps nativos. Q4 2025: Soporte TRON y BTC Lightning. Q1 2026: Indices sinteticos de materias primas. Q2 2026: Gobernanza descentralizada. Q3 2026: App movil nativa.",
      bodyEn: "Q2 2025: Launch of Marketplace top 100 and tokenized indices. Q3 2025: Jupiter (Solana) integration for native swaps. Q4 2025: TRON and BTC Lightning support. Q1 2026: Synthetic commodity indices. Q2 2026: Decentralized governance. Q3 2026: Native mobile app.",
      bodyZh: "2025年Q2：启动市场前100名和代币化指数。2025年Q3：Jupiter (Solana) 集成用于原生交换。2025年Q4：TRON和BTC Lightning支持。2026年Q1：合成大宗商品指数。2026年Q2：去中心化治理。2026年Q3：原生移动应用。",
    },
  ];

  function getBody(s: typeof sections[0]) {
    if (lang === "en") return s.bodyEn;
    if (lang === "zh") return s.bodyZh;
    return s.body;
  }

  function getTitle(s: typeof sections[0]) {
    if (lang === "en") return s.en;
    return s.title;
  }

  const headerTitle = lang === "en" ? "Manifesto" : lang === "zh" ? "宣言" : "Manifiesto";
  const headerSubtitle = lang === "en"
    ? "The philosophy behind Vestige Index"
    : lang === "zh"
    ? "Vestige Index 背后的哲学"
    : "La filosofia detras de Vestige Index";

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">{headerTitle}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{headerSubtitle}</p>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Hero */}
        <div className="border-b border-border bg-card px-6 py-10 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center mx-auto mb-5">
              <span className="text-background text-2xl font-black">V</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-3">VESTIGE INDEX</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto">
              {lang === "en"
                ? "A decentralized financial institution built on transparency, sovereignty, and the compound power of time."
                : lang === "zh"
                ? "一个建立在透明度、主权和时间复利力量上的去中心化金融机构。"
                : "Una institucion financiera descentralizada construida sobre la transparencia, la soberania y el poder compuesto del tiempo."}
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <div key={i} className="bg-card border border-card-border rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-muted rounded-lg shrink-0">
                      <Icon size={16} className="text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-2">{getTitle(section)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{getBody(section)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer of manifesto */}
        <div className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
          <p>
            {lang === "en"
              ? "Vestige Index — Decentralized. Transparent. Sovereign."
              : lang === "zh"
              ? "Vestige Index — 去中心化。透明。主权。"
              : "Vestige Index — Descentralizado. Transparente. Soberano."}
          </p>
        </div>
      </div>
    </div>
  );
}
