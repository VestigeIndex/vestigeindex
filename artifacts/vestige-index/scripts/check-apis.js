// scripts/check-apis.js - Diagnostic script for Vestige Index APIs
const APIs = [
  { 
    name: 'CoinGecko', 
    url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10', 
    fallback: 'Binance',
    critical: true
  },
  { 
    name: 'Binance', 
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', 
    fallback: 'CoinGecko',
    critical: true
  },
  { 
    name: 'OpenOcean', 
    url: 'https://open-api.openocean.finance/v4/1/quote?inTokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&outTokenAddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&amount=1000000000000000000', 
    fallback: 'LI.FI',
    critical: true
  },
  { 
    name: 'CryptoCompare', 
    url: 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN', 
    fallback: 'null',
    critical: false
  },
];

async function checkAPI(api) {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(api.url, { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    
    const time = Date.now() - start;
    
    if (response.ok) {
      const data = await response.json().catch(() => null);
      const hasData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
      
      if (hasData) {
        return { ...api, status: '✅ OK', time: `${time}ms`, data: 'OK' };
      }
      return { ...api, status: '⚠️ EMPTY', time: `${time}ms`, error: 'Response empty or invalid' };
    }
    return { ...api, status: '❌ FAILED', error: `HTTP ${response.status}`, time: `${time}ms` };
  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'Timeout (5s)' : error.message;
    return { ...api, status: '❌ FAILED', error: errorMsg, time: 'N/A' };
  }
}

async function runDiagnostic() {
  console.log('🔍 DIAGNÓSTICO DE APIs - VESTIGE INDEX\n');
  console.log('═'.repeat(60));
  
  const results = await Promise.all(APIs.map(checkAPI));
  
  results.forEach(r => {
    const statusIcon = r.status.includes('OK') ? '✅' : r.status.includes('EMPTY') ? '⚠️' : '❌';
    console.log(`\n${statusIcon} ${r.name}`);
    console.log(`   URL: ${r.url.substring(0, 60)}...`);
    if (r.time !== 'N/A') console.log(`   Tiempo: ${r.time}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    if (r.fallback && r.fallback !== 'null') console.log(`   Fallback: ${r.fallback}`);
    if (r.critical) console.log(`   ⚠️ CRÍTICA: Necesita fallback activo`);
  });
  
  console.log('\n' + '═'.repeat(60));
  
  const failed = results.filter(r => r.status === '❌ FAILED');
  const warnings = results.filter(r => r.status === '⚠️ EMPTY');
  
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ OK: ${results.filter(r => r.status === '✅ OK').length}`);
  console.log(`   ⚠️ Advertencias: ${warnings.length}`);
  console.log(`   ❌ Fallidas: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\n⚠️ APIs CRÍTICAS QUE FALLAN:');
    failed.forEach(f => console.log(`   - ${f.name} → Usar ${f.fallback}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ APIs CON DATOS VACÍOS:');
    warnings.forEach(w => console.log(`   - ${w.name}`));
  }
  
  console.log('\n📝 RECOMENDACIONES:');
  if (failed.find(f => f.name === 'CoinGecko')) {
    console.log('   • CoinGecko: Implementar fallback a Binance para precios');
  }
  if (failed.find(f => f.name === 'OpenOcean')) {
    console.log('   • OpenOcean: Implementar fallback a LI.FI o eliminar swap');
  }
  if (failed.find(f => f.name === 'CryptoCompare')) {
    console.log('   • CryptoCompare: Eliminar, usar noticias alternativas o cache');
  }
}

runDiagnostic().catch(console.error);