/**
 * 🔧 CONFIGURAÇÃO CENTRALIZADA - M&P Performance
 * 
 * Use este arquivo para configurar a URL da API e outras opções
 * Não precisa mexer em admin.js, tudo é controlado daqui!
 */

// ====================================
// CONFIGURAÇÃO DA API
// ====================================

const CONFIG = {
  // 🌐 URL BASE DA API (ALTERE CONFORME NECESSÁRIO)
  API_BASE_URL: 'https://api-catraca-mu.vercel.app',
  // 'http://localhost:3000'          // Desenvolvimento local
  // 'http://192.168.x.x:3000'        // IP da máquina do backend
  // 'https://api.mpperformance.com'  // Produção

  // 🔐 CREDENCIAIS PADRÃO (PARA TESTES)
  CREDENCIAIS_PADRAO: {
    usuario: 'admin',
    senha: '1234'
  },

  // ⏱️ TIMEOUTS (em milissegundos)
  TIMEOUT_REQUISICAO: 10000, // 10 segundos
  TIMEOUT_SESSAO: 3600000,   // 1 hora

  // 🐛 DEBUG MODE
  DEBUG: true, // true = mostra logs no console | false = modo silencioso

  // 💾 ARMAZENAMENTO LOCAL
  USAR_LOCAL_STORAGE: true, // true = persiste dados | false = apenas sessão

  // 📱 CONFIGURAÇÕES DE UI
  UI: {
    TEMPO_TOAST: 3000,        // Tempo de notificação em ms
    TEMA: 'red',              // Cores: 'red', 'blue', 'green'
    AUTO_REFRESH: false,      // Atualizar automaticamente a cada X segundos
    AUTO_REFRESH_INTERVALO: 30000 // 30 segundos
  }
};

// ====================================
// FUNÇÃO DE VERIFICAÇÃO
// ====================================

function verificarConfiguracao() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🔧 M&P PERFORMANCE - CONFIGURAÇÃO   ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  console.log('📍 API URL:', CONFIG.API_BASE_URL);
  console.log('🔐 Usuário teste:', CONFIG.CREDENCIAIS_PADRAO.usuario);
  console.log('🐛 Debug:', CONFIG.DEBUG ? '✅ ATIVADO' : '❌ DESATIVADO');
  console.log('💾 Local Storage:', CONFIG.USAR_LOCAL_STORAGE ? '✅ SIM' : '❌ NÃO');
  
  // Teste de conectividade básico
  testarConectividadeAPI();
}

// ====================================
// TESTE DE CONECTIVIDADE COM API
// ====================================

async function testarConectividadeAPI() {
  console.log('\n🧪 Testando conectividade com API...\n');
  
  try {
    const resposta = await fetch(`${CONFIG.API_BASE_URL}/api/autenticacao/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CONFIG.CREDENCIAIS_PADRAO),
      timeout: CONFIG.TIMEOUT_REQUISICAO
    });

    if (resposta.ok) {
      console.log('✅ SUCESSO! API está respondendo corretamente.');
      console.log('📊 Status:', resposta.status);
      const dados = await resposta.json();
      console.log('📦 Token recebido:', dados.token ? '✅ SIM' : '❌ NÃO');
    } else {
      console.warn('⚠️ API respondeu com erro:', resposta.status);
    }
  } catch (erro) {
    console.error('❌ ERRO ao conectar à API');
    console.error('   Mensagem:', erro.message);
    console.error('\n💡 Dicas de troubleshooting:');
    console.error('   1. Verifique se a API está rodando em:', CONFIG.API_BASE_URL);
    console.error('   2. Verifique se há CORS habilitado na API');
    console.error('   3. Teste com Postman: POST', `${CONFIG.API_BASE_URL}/api/autenticacao/login`);
  }
}

// ====================================
// EXPORTAR CONFIGURAÇÃO
// ====================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Executar verificação ao carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', verificarConfiguracao);
} else {
  verificarConfiguracao();
}
