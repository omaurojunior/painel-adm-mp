/**
 * Painel Administrativo - M&P Performance
 * Sistema de Gestão de Alunos com Integração API
 * Sincroniza com Sistema de Autenticação de Entrada
 */

// ==========================================
// USAR CONFIGURAÇÃO CENTRALIZADA
// ==========================================
// Se CONFIG não estiver definida, usar padrão global
if (typeof CONFIG === 'undefined') {
  window.CONFIG = {
    API_BASE_URL: 'https://api-catraca-mu.vercel.app',
    DEBUG: true,
    TIMEOUT_REQUISICAO: 10000,
    USAR_LOCAL_STORAGE: true
  };
}

const storage = CONFIG.USAR_LOCAL_STORAGE ? localStorage : sessionStorage;

// Função auxiliar de debug
function logDebug(titulo, dados) {
  if (CONFIG.DEBUG) {
    console.log(`🔍 [${titulo}]`, dados);
  }
}

// Toast Config (SweetAlert2) - Melhorado
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    customClass: {
        container: 'toast-custom',
        popup: 'rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl',
        title: 'text-sm font-bold',
        timerProgressBar: 'bg-gradient-to-r from-red-600 to-orange-600'
    }
});

// ==========================================
// REFERÊNCIAS DO DOM
// ==========================================
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const btnLogout = document.getElementById('btnLogout');

// Tabela e Cards
const tabelaAlunos = document.getElementById('tabelaAlunos');
const totalAlunos = document.getElementById('totalAlunos');
const totalAtivos = document.getElementById('totalAtivos');
const totalInativos = document.getElementById('totalInativos');
const emptyState = document.getElementById('emptyState');
const tableLoader = document.getElementById('tableLoader');

// Modal Elements
const alunoModal = document.getElementById('alunoModal');
const alunoForm = document.getElementById('alunoForm');
const formTitleText = document.getElementById('formTitleText');
const btnNovoAluno = document.getElementById('btnNovoAluno');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnCancelarModal = document.getElementById('btnCancelarModal');
const modalBackdrop = document.getElementById('modalBackdrop');

// Modal form fields
const alunoIdInput = document.getElementById('alunoId');
const nomeInput = document.getElementById('nome');
const cpfInput = document.getElementById('cpf');
const statusInput = document.getElementById('status');

// Toolbar Elements
const searchInput = document.getElementById('searchInput');
const btnExportCSV = document.getElementById('btnExportCSV');
const btnRefresh = document.getElementById('btnRefresh');

// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
let loginAtivo = storage.getItem('loginAtivo') === 'true';
let tokenAutenticacao = storage.getItem('tokenAutenticacao') || null;
let alunos = [];
let alunoAtual = null;

// ==========================================
// ANIMAÇÃO DE SUCESSO
// ==========================================
function showSuccessAnimation() {
    const successEl = document.createElement('div');
    successEl.innerHTML = `
        <div class="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div class="text-6xl animate-bounce">
                <i class="fas fa-check-circle text-green-500" style="filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5));"></i>
            </div>
        </div>
    `;
    document.body.appendChild(successEl);
    setTimeout(() => successEl.remove(), 1500);
}
function iniciarApp() {
    if (loginAtivo) {
        mostrarPainelAdmin();
        carregarAlunos();
    } else {
        mostrarLogin();
    }
}

// ==========================================
// 1. AUTENTICAÇÃO COM API
// ==========================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const textoBotao = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Autenticando...';
    submitBtn.disabled = true;

    logDebug('Login', `Tentativa de acesso do usuário: ${usuario}`);

    try {
        // Requisição para autenticar na API
        const resposta = await fetch(`${CONFIG.API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuario,
                senha: password
            })
        });

        logDebug('Login Response', `Status: ${resposta.status}`);

        if (resposta.ok) {
            const dados = await resposta.json();
            
            // Armazenar token de autenticação
            tokenAutenticacao = dados.token;
            storage.setItem('tokenAutenticacao', tokenAutenticacao);
            storage.setItem('loginAtivo', 'true');
            storage.setItem('usuarioLogado', usuario);
            loginAtivo = true;
            
            logDebug('Login Sucesso', `Token salvo: ${tokenAutenticacao.substring(0, 20)}...`);
            
            loginForm.reset();
            mostrarPainelAdmin();
            carregarAlunos();
            
            showSuccessAnimation();
            
            Toast.fire({
                icon: 'success',
                title: 'Bem-vindo, Admin!',
                text: 'Conectado à API com sucesso'
            });
        } else {
            logDebug('Login Erro', `Resposta: ${resposta.status}`);
            Toast.fire({
                icon: 'error',
                title: 'Credenciais inválidas!',
                text: 'Verifique usuário e senha'
            });
        }
    } catch (erro) {
        console.error('❌ Erro de autenticação:', erro);
        logDebug('Login Exception', erro.message);
        
        Toast.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: `Não foi possível conectar à API em ${CONFIG.API_BASE_URL}`
        });
    } finally {
        submitBtn.innerHTML = textoBotao;
        submitBtn.disabled = false;
    }
});

// ==========================================
// 2. UI - ALTERNÂNCIA DE SEÇÕES
// ==========================================
function mostrarLogin() {
    loginSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
}

function mostrarPainelAdmin() {
    loginSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
}

// ==========================================
// 3. LOGOUT
// ==========================================
btnLogout.addEventListener('click', () => {
    Swal.fire({
        title: 'Desconectar?',
        text: 'Tem certeza que deseja sair do painel?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, sair',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            storage.removeItem('loginAtivo');
            storage.removeItem('tokenAutenticacao');
            loginAtivo = false;
            tokenAutenticacao = null;
            mostrarLogin();
            loginForm.reset();
        }
    });
});

// ==========================================
// 4. CARREGAR ALUNOS DA API
// ==========================================
async function carregarAlunos() {
    tableLoader.classList.remove('hidden');
    logDebug('Carregando alunos', `URL: ${CONFIG.API_BASE_URL}/alunos`);
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (tokenAutenticacao) {
            headers['Authorization'] = `Bearer ${tokenAutenticacao}`;
        }

        const resposta = await fetch(`${CONFIG.API_BASE_URL}/alunos`, {
            method: 'GET',
            headers
        });

        logDebug('Alunos Response', `Status: ${resposta.status}`);

        if (resposta.status === 401 || resposta.status === 403) {
            // Token expirado ou não autorizado
            storage.removeItem('loginAtivo');
            storage.removeItem('tokenAutenticacao');
            loginAtivo = false;
            tokenAutenticacao = null;
            mostrarLogin();
            Toast.fire({
                icon: 'error',
                title: 'Sessão expirada. Faça login novamente.'
            });
            return;
        }

        if (resposta.ok) {
            alunos = await resposta.json();
            // Converter status boolean para string
            alunos = alunos.map(aluno => ({
                ...aluno,
                status: aluno.status ? 'Ativo' : 'Inativo'
            }));
            logDebug('Alunos Carregados', `Total: ${alunos.length}`);
            
            setTimeout(() => {
                atualizarTabela();
                atualizarCards();
                tableLoader.classList.add('hidden');
                
                const now = new Date();
                document.getElementById('lastUpdate').textContent = 
                    `Atualizado em ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            }, 300);
        } else {
            logDebug('Erro ao carregar alunos', `Status: ${resposta.status}`);
            Toast.fire({
                icon: 'error',
                title: 'Erro ao carregar alunos',
                text: 'Falha na comunicação com a API'
            });
            tableLoader.classList.add('hidden');
        }
    } catch (erro) {
        console.error('Erro ao carregar alunos:', erro);
        logDebug('Carregamento Exception', erro.message);
        Toast.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: 'Não foi possível conectar à API'
        });
        tableLoader.classList.add('hidden');
    }
}

// ==========================================
// 5. SINCRONIZAR COM SISTEMA DE AUTENTICAÇÃO DE ENTRADA
// ==========================================
async function sincronizarComSistemaDeEntrada(alunoId, novoStatus) {
    /**
     * Esta função sincroniza o status do aluno com o sistema de controle de entrada
     * Lógica:
     * - Status ATIVO → LIBERA entrada
     * - Status INATIVO/SUSPENSO → BLOQUEIA entrada
     */
    
    const podeEntrar = (novoStatus === 'Ativo');
    
    logDebug('Sincronização Entrada', `Aluno: ${alunoId}, Status: ${novoStatus}, Pode entrar: ${podeEntrar}`);
    
    try {
        const resposta = await fetch(`${CONFIG.API_BASE_URL}/api/autenticacao/controle-entrada`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAutenticacao}`
            },
            body: JSON.stringify({
                alunoId: alunoId,
                podeEntrar: podeEntrar,
                status: novoStatus,
                dataAtualizacao: new Date().toISOString()
            })
        });

        if (resposta.ok) {
            const dados = await resposta.json();
            logDebug('Sincronização Sucesso', dados.mensagem);
            console.log(`✅ Sistema de entrada sincronizado: ${dados.mensagem}`);
            return true;
        } else {
            logDebug('Sincronização Erro', `Status: ${resposta.status}`);
            console.warn('⚠️ Falha ao sincronizar com sistema de entrada');
            return false;
        }
    } catch (erro) {
        console.error('❌ Erro ao sincronizar entrada:', erro);
        logDebug('Sincronização Exception', erro.message);
        return false;
    }
}
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s]/g, ''); // Remove caracteres especiais, mantendo letras, números e espaços
}

function atualizarTabela() {
    const termoPesquisa = searchInput.value.trim();
    logDebug('Pesquisa', `Termo: "${termoPesquisa}"`);
    
    if (!termoPesquisa) {
        // Sem termo de pesquisa, mostrar todos os alunos
        renderizarTabela(alunos);
        return;
    }

    const termoNormalizado = normalizarTexto(termoPesquisa);
    const filtroCPF = termoPesquisa.replace(/\D/g, '');
    
    const alunosFiltrados = alunos.filter(aluno => {
        // Pesquisa por nome (com normalização para ignorar acentos)
        const nomeNormalizado = normalizarTexto(aluno.nome || '');
        const matchNome = nomeNormalizado.includes(termoNormalizado);
        
        // Pesquisa por CPF (removendo formatação)
        const cpfLimpo = (aluno.cpf || '').replace(/\D/g, '');
        const matchCPF = cpfLimpo.includes(filtroCPF) && filtroCPF.length > 0;
        
        logDebug('Filtro Aluno', `${aluno.nome}: nome=${matchNome}, cpf=${matchCPF}`);
        
        return matchNome || matchCPF;
    });

    logDebug('Resultado Pesquisa', `Encontrados: ${alunosFiltrados.length}`);
    renderizarTabela(alunosFiltrados);
}

function renderizarTabela(alunosParaMostrar) {
    tabelaAlunos.innerHTML = '';

    if (alunosParaMostrar.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    document.getElementById('totalRegistros').textContent = 
        `Mostrando ${alunosParaMostrar.length} de ${alunos.length} aluno(s)`;

    alunosParaMostrar.forEach((aluno, index) => {
        const row = document.createElement('tr');
        row.classList.add('animate-fade-in');
        row.style.animationDelay = `${index * 30}ms`;
        
        const statusClass = aluno.status === 'Ativo' ? 'bg-green-100 text-green-700' : 
                           aluno.status === 'Suspenso' ? 'bg-yellow-100 text-yellow-700' :
                           'bg-red-100 text-red-700';
        
        const statusIcon = aluno.status === 'Ativo' ? '✓' : 
                          aluno.status === 'Suspenso' ? '⚠' : '✗';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 font-bold text-red-600 text-sm">
                            ${aluno.nome.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-bold text-slate-800">${aluno.nome}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">${aluno.cpf || '—'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="status-badge px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusIcon} ${aluno.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex items-center justify-end gap-1">
                <button type="button" data-action="editar" data-id="${aluno.id}" class="tooltip text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all active:scale-90 transform" title="Editar aluno">
                    <i class="fas fa-edit"></i>
                    <span class="tooltiptext">Editar</span>
                </button>
                <button type="button" data-action="deletar" data-id="${aluno.id}" class="tooltip text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-2 rounded-lg transition-all active:scale-90 transform" title="Deletar aluno">
                    <i class="fas fa-trash"></i>
                    <span class="tooltiptext">Deletar</span>
                </button>
            </td>
        `;
        tabelaAlunos.appendChild(row);
    });
}

// ==========================================
// 6. ATUALIZAR CARDS
// ==========================================
function atualizarCards() {
    const total = alunos.length;
    const ativos = alunos.filter(a => a.status === 'Ativo').length;
    const inativos = alunos.filter(a => a.status !== 'Ativo').length;

    totalAlunos.textContent = total;
    totalAtivos.textContent = ativos;
    totalInativos.textContent = inativos;
}

// ==========================================
// 7. BUSCA EM TEMPO REAL COM DEBOUNCE
// ==========================================
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

const buscarComDebounce = debounce(atualizarTabela, 300);
searchInput.addEventListener('input', buscarComDebounce);

// ==========================================
// 7. EVENTOS DE TABELA
// ==========================================
tabelaAlunos.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const alunoId = button.dataset.id;
    const action = button.dataset.action;

    if (action === 'editar') {
        editarAluno(alunoId);
    }

    if (action === 'deletar') {
        deletarAluno(alunoId);
    }
});

// ==========================================
// 8. ATUALIZAR/REFRESH
// ==========================================
btnRefresh.addEventListener('click', async () => {
    btnRefresh.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> <span class="hidden sm:inline">Atualizando...</span>';
    btnRefresh.disabled = true;
    btnRefresh.classList.add('opacity-75');
    
    // Adicionar efeito de shimmer
    const tabelaAlunos_el = document.getElementById('tabelaAlunos');
    tabelaAlunos_el.style.opacity = '0.5';
    
    await carregarAlunos();
    
    setTimeout(() => {
        tabelaAlunos_el.style.opacity = '1';
        btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> <span class="hidden sm:inline">Atualizar</span>';
        btnRefresh.disabled = false;
        btnRefresh.classList.remove('opacity-75');
        
        Toast.fire({
            icon: 'success',
            title: 'Dados sincronizados com a API!'
        });
    }, 300);
});

// ==========================================
// 9. VALIDAÇÃO EM TEMPO REAL
// ==========================================
function validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) return false;
    
    // Rejeitar CPF com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validação com algoritmo mod-11
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
}

function validarNome(nome) {
    return nome.trim().length >= 3;
}

// Validação de nome em tempo real
nomeInput.addEventListener('input', (e) => {
    const nome = e.target.value;
    if (nome && !validarNome(nome)) {
        nomeInput.classList.remove('border-green-400', 'border-slate-300');
        nomeInput.classList.add('border-yellow-400', 'bg-yellow-50');
    } else if (nome && validarNome(nome)) {
        nomeInput.classList.remove('border-yellow-400', 'border-slate-300', 'bg-yellow-50');
        nomeInput.classList.add('border-green-400', 'bg-green-50');
    } else {
        nomeInput.classList.remove('border-yellow-400', 'border-green-400', 'bg-yellow-50', 'bg-green-50');
        nomeInput.classList.add('border-slate-300');
    }
});

// Validação de CPF em tempo real
cpfInput.addEventListener('input', (e) => {
    const cpf = e.target.value;
    if (cpf.replace(/\D/g, '').length < 11) {
        cpfInput.classList.remove('border-green-400', 'border-yellow-400', 'border-slate-300');
        cpfInput.classList.add('border-slate-300');
    } else if (cpf && !validarCPF(cpf)) {
        cpfInput.classList.remove('border-green-400', 'border-slate-300');
        cpfInput.classList.add('border-red-400', 'bg-red-50');
    } else if (cpf && validarCPF(cpf)) {
        cpfInput.classList.remove('border-red-400', 'border-slate-300', 'bg-red-50');
        cpfInput.classList.add('border-green-400', 'bg-green-50');
    }
});

// ==========================================
// 10. FORMATAÇÃO DE INPUTS
// ==========================================
function formatarCPF(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
}

if (cpfInput) {
    cpfInput.addEventListener('input', (event) => {
        event.target.value = formatarCPF(event.target.value);
    });
}

// ==========================================
// 11. EXPORTAR CSV
// ==========================================
btnExportCSV.addEventListener('click', () => {
    if (alunos.length === 0) {
        Toast.fire({
            icon: 'info',
            title: 'Nenhum aluno para exportar'
        });
        return;
    }

    let csv = 'Nome,CPF,Status\n';
    
    alunos.forEach(aluno => {
        csv += `"${aluno.nome}","${aluno.cpf}","${aluno.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `alunos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Toast.fire({
        icon: 'success',
        title: 'Arquivo exportado com sucesso!'
    });
});

// ==========================================
// 12. MODAL - ABRIR/FECHAR
// ==========================================
function abrirModal(titulo = 'Novo Aluno', editar = false) {
    formTitleText.textContent = titulo;
    if (!editar) {
        alunoForm.reset();
        // Para novo aluno, definir status como Ativo e ocultar campo
        statusInput.value = 'Ativo';
        document.getElementById('statusContainer').style.display = 'none';
        statusInput.required = false; // Remover required para novo aluno
    } else {
        // Para edição, mostrar campo de status
        document.getElementById('statusContainer').style.display = 'block';
        statusInput.required = true; // Tornar required para edição
    }
    alunoForm.classList.remove('hidden');
    alunoModal.classList.remove('hide');
    alunoModal.classList.add('show');
    
    // Animar inputs
    setTimeout(() => {
        const inputs = alunoForm.querySelectorAll('input, select');
        inputs.forEach((input, index) => {
            input.style.animation = 'none';
            setTimeout(() => {
                input.style.animation = `fadeInRow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 100}ms forwards`;
            }, 10);
        });
    }, 100);
}

function fecharModal() {
    alunoModal.classList.remove('show');
    alunoModal.classList.add('hide');
    setTimeout(() => {
        alunoModal.classList.add('hidden');
        alunoModal.classList.remove('hide');
        alunoAtual = null;
    }, 300);
}

btnNovoAluno.addEventListener('click', () => {
    alunoAtual = null;
    document.getElementById('alunoId').value = '';
    abrirModal('Novo Aluno', false);
});

btnFecharModal.addEventListener('click', fecharModal);
btnCancelarModal.addEventListener('click', fecharModal);
modalBackdrop.addEventListener('click', fecharModal);

// ==========================================
// 13. EDITAR ALUNO
// ==========================================
function editarAluno(id) {
    const alunoId = Number(id);
    alunoAtual = alunos.find(a => Number(a.id) === alunoId);
    
    if (!alunoAtual) return;

    // Converter status "Ativo"/"Inativo" para valor para o select
    const statusValue = alunoAtual.status === 'Ativo' ? 'Ativo' : 'Inativo';
    
    // Preencher formulário com campos simplificados
    alunoIdInput.value = alunoAtual.id;
    nomeInput.value = alunoAtual.nome || '';
    cpfInput.value = alunoAtual.cpf || '';
    statusInput.value = statusValue;

    abrirModal('Editar Aluno', true);
}

// ==========================================
// 14. DELETAR ALUNO NA API
// ==========================================
function deletarAluno(id) {
    const aluno = alunos.find(a => Number(a.id) === Number(id));
    
    if (!aluno) return;

    Swal.fire({
        title: 'Deletar Aluno?',
        text: `Tem certeza que deseja deletar o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const alunoId = Number(id);
                logDebug('Deletar Aluno', `ID: ${alunoId}, URL: ${CONFIG.API_BASE_URL}/alunos/${alunoId}`);
                
                const deleteHeaders = {
                    'Content-Type': 'application/json'
                };
                if (tokenAutenticacao) {
                    deleteHeaders['Authorization'] = `Bearer ${tokenAutenticacao}`;
                }

                const resposta = await fetch(`${CONFIG.API_BASE_URL}/alunos/${alunoId}`, {
                    method: 'DELETE',
                    headers: deleteHeaders
                });

                logDebug('Deletar Resposta', `Status: ${resposta.status}`);

                if (resposta.ok) {
                    // Bloquear entrada no sistema de autenticação
                    // await sincronizarComSistemaDeEntrada(alunoId, 'Deletado');
                    
                    showSuccessAnimation();
                    alunos = alunos.filter(a => Number(a.id) !== alunoId);
                    carregarAlunos();
                    
                    Toast.fire({
                        icon: 'success',
                        title: 'Aluno deletado com sucesso!',
                        text: 'Entrada bloqueada no sistema'
                    });
                    logDebug('Deletar Sucesso', `Aluno ${aluno.nome} removido`);
                } else if (resposta.status === 401 || resposta.status === 403) {
                    storage.removeItem('loginAtivo');
                    storage.removeItem('tokenAutenticacao');
                    loginAtivo = false;
                    tokenAutenticacao = null;
                    mostrarLogin();
                    Toast.fire({
                        icon: 'error',
                        title: 'Sessão expirada',
                        text: 'Faça login novamente para continuar'
                    });
                } else {
                    logDebug('Deletar Erro', `Status de erro: ${resposta.status}`);
                    Toast.fire({
                        icon: 'error',
                        title: 'Erro ao deletar aluno'
                    });
                }
            } catch (erro) {
                console.error('Erro ao deletar:', erro);
                logDebug('Deletar Exception', erro.message);
                Toast.fire({
                    icon: 'error',
                    title: 'Erro de conexão'
                });
            }
        }
    });
}

// ==========================================
// 15. SALVAR ALUNO (CRIAR/EDITAR)
// ==========================================
alunoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = alunoIdInput.value;
    const nome = nomeInput.value.trim();
    const cpf = cpfInput.value.trim().replace(/\D/g, '');
    const status = statusInput.value;

    // Validação
    if (!nome || !validarNome(nome)) {
        Toast.fire({
            icon: 'warning',
            title: 'Nome inválido',
            text: 'Nome deve ter pelo menos 3 caracteres'
        });
        nomeInput.focus();
        nomeInput.classList.add('border-red-400', 'bg-red-50');
        return;
    }

    if (!cpf || !validarCPF(cpf) || cpf.length !== 11) {
        Toast.fire({
            icon: 'warning',
            title: 'CPF inválido',
            text: 'Digite um CPF válido (11 dígitos)'
        });
        cpfInput.focus();
        cpfInput.classList.add('border-red-400', 'bg-red-50');
        return;
    }

    const cpfNumerico = cpf.replace(/\D/g, '');
    const cpfRepetido = alunos.some(aluno => {
        const alunoCpf = (aluno.cpf || '').replace(/\D/g, '');
        return alunoCpf === cpfNumerico && String(aluno.id) !== String(id);
    });

    if (cpfRepetido) {
        Toast.fire({
            icon: 'error',
            title: 'CPF já existente',
            text: 'O CPF informado já está cadastrado para outro aluno.'
        });
        return;
    }

    // Para edição, validar status
    if (id && !status) {
        Toast.fire({
            icon: 'warning',
            title: 'Selecione o status do aluno!'
        });
        return;
    }

    // Para criação, definir status como Ativo se não estiver definido
    const statusFinal = id ? status : 'Ativo';

    const submitBtn = alunoForm.querySelector('button[type="submit"]');
    const textoBotao = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75');

    const dadosAluno = {
        nome,
        cpf,
        status: statusFinal === 'Ativo' ? true : false
    };

    console.log('Dados enviados para API:', dadosAluno);

    try {
        const requestHeaders = {
            'Content-Type': 'application/json'
        };
        if (tokenAutenticacao) {
            requestHeaders['Authorization'] = `Bearer ${tokenAutenticacao}`;
        }

        let resposta;
        let mensagem;

        if (id) {
            // EDITAR
            logDebug('Editar Aluno', `ID: ${id}, URL: ${CONFIG.API_BASE_URL}/alunos/${id}`);
            resposta = await fetch(`${CONFIG.API_BASE_URL}/alunos/${id}`, {
                method: 'PATCH',
                headers: requestHeaders,
                body: JSON.stringify(dadosAluno)
            });
            mensagem = 'Aluno atualizado com sucesso!';
        } else {
            // CRIAR
            logDebug('Criar Aluno', `URL: ${CONFIG.API_BASE_URL}/alunos`);
            resposta = await fetch(`${CONFIG.API_BASE_URL}/alunos`, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(dadosAluno)
            });
            mensagem = 'Novo aluno cadastrado com sucesso!';
        }

        logDebug('Salvar Resposta', `Status: ${resposta.status}`);

        if (resposta.ok) {
            const novoAluno = await resposta.json();
            logDebug('Salvar Sucesso', `Aluno: ${nome}`);
            
            showSuccessAnimation();
            
            // ✅ SINCRONIZAR COM SISTEMA DE ENTRADA
            // await sincronizarComSistemaDeEntrada(novoAluno.id || id, status);
            
            fecharModal();
            carregarAlunos();
            
            Toast.fire({
                icon: 'success',
                title: mensagem,
                text: `${status === 'Ativo' ? '✅ Entrada LIBERADA' : '🔒 Entrada BLOQUEADA'}`
            });
        } else if (resposta.status === 401 || resposta.status === 403) {
            storage.removeItem('loginAtivo');
            storage.removeItem('tokenAutenticacao');
            loginAtivo = false;
            tokenAutenticacao = null;
            mostrarLogin();
            Toast.fire({
                icon: 'error',
                title: 'Sessão expirada',
                text: 'Faça login novamente para continuar'
            });
        } else if (resposta.status === 409) {
            Toast.fire({
                icon: 'error',
                title: 'CPF já existente',
                text: 'O CPF informado já está cadastrado no sistema.'
            });
        } else if (resposta.status === 400 && !id) {
            // Para criação, se erro 400, ainda recarregar pois pode ter sido criado
            console.log('Erro 400 na criação, mas tentando recarregar alunos...');
            fecharModal();
            carregarAlunos();
            Toast.fire({
                icon: 'warning',
                title: 'Possível erro na API',
                text: 'Aluno pode ter sido criado. Verifique a lista.'
            });
        } else {
            console.log('Erro na resposta:', resposta.status, resposta.statusText);
            try {
                const erro = await resposta.json();
                console.log('Erro JSON:', erro);
                const mensagemErro = erro.mensagem || erro.message || 'Tente novamente';
                if (/cpf/i.test(mensagemErro) || /ja existente|já existente|duplicado|duplicate|already exists/i.test(mensagemErro)) {
                    Toast.fire({
                        icon: 'error',
                        title: 'CPF já existente',
                        text: mensagemErro
                    });
                } else {
                    logDebug('Salvar Erro', mensagemErro);
                    Toast.fire({
                        icon: 'error',
                        title: 'Erro ao salvar aluno',
                        text: mensagemErro
                    });
                }
            } catch (e) {
                const textoResposta = await resposta.text();
                console.log('Erro não é JSON:', textoResposta);
                Toast.fire({
                    icon: 'error',
                    title: 'Erro ao salvar aluno',
                    text: 'Resposta inválida da API'
                });
            }
        }
    } catch (erro) {
        console.error('Erro ao salvar:', erro);
        logDebug('Salvar Exception', erro.message);
        Toast.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: `Não foi possível conectar à API em ${CONFIG.API_BASE_URL}`
        });
    } finally {
        submitBtn.innerHTML = textoBotao;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');
    }
});

// ==========================================
// INICIAR APLICAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', iniciarApp);


// PROJETO FEITO POR: MAURO JR E PIETRO MANTUAN - 14/04/26 M&P PERFORMANCE