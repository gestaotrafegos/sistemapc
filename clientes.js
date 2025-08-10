// =============================================
// ARMAZENAMENTO DE DADOS (JSON + localStorage)
// =============================================
let dados = JSON.parse(localStorage.getItem('dadosImobiliaria')) || {
  corretores: {
    corretor1: {
      id: "corretor1",
      nome: "João Silva",
      email: "joao@imobiliaria.com",
      telefone: "(11) 98765-4321"
    },
    corretor2: {
      id: "corretor2",
      nome: "Maria Souza",
      email: "maria@imobiliaria.com",
      telefone: "(11) 91234-5678"
    }
  },
  leads: {
    lead1: {
      id: "lead1",
      nome: "Cliente A",
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
      email: "cliente@email.com",
      qualidade: "quente",
      corretor_id: "corretor1",
      interesse: "Apartamento",
      ultimo_contato: new Date().toISOString().split('T')[0],
      observacoes: [
        {
          data: new Date().toISOString().split('T')[0],
          texto: "Cliente interessado no apartamento XYZ"
        }
      ]
    }
  }
};

function salvarDados() {
  localStorage.setItem('dadosImobiliaria', JSON.stringify(dados));
}

function calcularDiasSemContato(data) {
  if (!data) return "Nunca";
  
  const hoje = new Date();
  const ultimoContato = new Date(data);
  const diffTime = Math.abs(hoje - ultimoContato);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 0 ? "Hoje" : `${diffDays} dias`;
}

// =============================================
// FUNÇÕES PRINCIPAIS (PÁGINA CLIENTES)
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('clientes.html')) return;

  // Elementos DOM
  const toggleBtn = document.getElementById('toggle-cadastro');
  const formCadastro = document.getElementById('form-cadastro');
  const formEdicao = document.getElementById('form-edicao');
  const tabelaClientes = document.getElementById('tabela-clientes').querySelector('tbody');
  const formCadastroCliente = document.getElementById('cadastro-cliente');
  const formEdicaoCliente = document.getElementById('edicao-cliente');
  const pesquisaInput = document.getElementById('pesquisa-cliente');
  const btnPesquisar = document.getElementById('btn-pesquisar');
  const btnLimpar = document.getElementById('btn-limpar');
  
  function preencherCorretores(selectElement) {
    selectElement.innerHTML = '<option value="">Corretor Responsável</option>';
    Object.values(dados.corretores).forEach(corretor => {
      selectElement.innerHTML += `<option value="${corretor.id}">${corretor.nome}</option>`;
    });
  }
  
  preencherCorretores(document.getElementById('corretor-cadastro'));
  preencherCorretores(document.getElementById('corretor-edicao'));

  // Controle do Formulário de Cadastro
  toggleBtn.addEventListener('click', () => {
    formCadastro.classList.toggle('hidden');
    toggleBtn.textContent = formCadastro.classList.contains('hidden') ? 
      '+ Novo Cliente' : 'Cancelar';
  });

  document.getElementById('cancelar-cadastro').addEventListener('click', () => {
    formCadastro.classList.add('hidden');
    toggleBtn.textContent = '+ Novo Cliente';
  });

  // Carregar Leads na Tabela
  function carregarLeads(filtro = '') {
    tabelaClientes.innerHTML = '';
    
    const leadsFiltrados = Object.values(dados.leads).filter(lead => {
      if (!filtro) return true;
      const termo = filtro.toLowerCase();
      return (
        lead.nome.toLowerCase().includes(termo) ||
        lead.telefone.toLowerCase().includes(termo) ||
        lead.email.toLowerCase().includes(termo) ||
        lead.interesse.toLowerCase().includes(termo) ||
        (dados.corretores[lead.corretor_id]?.nome.toLowerCase().includes(termo) || '')
      );
    });
    
    leadsFiltrados.forEach(lead => {
      const corretor = dados.corretores[lead.corretor_id] || { nome: 'Não atribuído' };
      const row = tabelaClientes.insertRow();
      row.innerHTML = `
        <td>${lead.nome}</td>
        <td>${lead.telefone}</td>
        <td>${lead.interesse}</td>
        <td>${corretor.nome}</td>
        <td>${calcularDiasSemContato(lead.ultimo_contato)}</td>
        <td>
          <button onclick="editarLead('${lead.id}')" class="btn-editar">✏️ Editar</button>
          <button onclick="registrarAtendimento('${lead.id}')" class="btn-atendimento">📞 Atendimento</button>
          <button onclick="criarTimeline('${lead.id}')" class="btn-timeline">⏳ Timeline</button>
        </td>
      `;
    });
  }

  // Cadastrar Novo Lead
  formCadastroCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome-cadastro').value;
    const email = document.getElementById('email-cadastro').value;
    
    if (!nome || !email) {
      alert('Nome e e-mail são obrigatórios!');
      return;
    }
    
    const novoLeadId = 'lead' + (Object.keys(dados.leads).length + 1);
    const hoje = new Date().toISOString().split('T')[0];
    
    dados.leads[novoLeadId] = {
      id: novoLeadId,
      nome: nome,
      email: email,
      cpf: document.getElementById('cpf-cadastro').value,
      telefone: document.getElementById('telefone-cadastro').value,
      interesse: document.getElementById('interesse-cadastro').value,
      qualidade: "quente",
      corretor_id: document.getElementById('corretor-cadastro').value,
      ultimo_contato: hoje,
      observacoes: []
    };
    
    salvarDados();
    formCadastroCliente.reset();
    formCadastro.classList.add('hidden');
    toggleBtn.textContent = '+ Novo Cliente';
    carregarLeads();
    alert('Cliente cadastrado com sucesso!');
  });

  // Inicialização
  carregarLeads();
});

// =============================================
// FUNÇÕES GLOBAIS
// =============================================

// Editar Lead
window.editarLead = function(id) {
  const lead = dados.leads[id];
  const formEdicao = document.getElementById('form-edicao');
  formEdicao.classList.remove('hidden');
  
  document.getElementById('id-edicao').value = id;
  document.getElementById('nome-edicao').value = lead.nome;
  document.getElementById('email-edicao').value = lead.email;
  document.getElementById('telefone-edicao').value = lead.telefone;
  document.getElementById('cpf-edicao').value = lead.cpf || '';
  document.getElementById('interesse-edicao').value = lead.interesse;
  document.getElementById('corretor-edicao').value = lead.corretor_id;
  document.getElementById('ultimo-contato-edicao').value = lead.ultimo_contato;
  document.getElementById('status-edicao').value = lead.qualidade;
  
  if (typeof window.carregarObservacoes === 'function') {
    window.carregarObservacoes(id);
  }
  
  formEdicao.scrollIntoView({ behavior: 'smooth' });
};

// Registrar Atendimento
window.registrarAtendimento = function(id) {
  const texto = prompt("Registre o atendimento:");
  if (texto) {
    const hoje = new Date().toISOString().split('T')[0];
    if (!dados.leads[id].observacoes) {
      dados.leads[id].observacoes = [];
    }
    dados.leads[id].observacoes.push({
      data: hoje,
      texto: texto
    });
    dados.leads[id].ultimo_contato = hoje;
    salvarDados();
    alert('Atendimento registrado!');
  }
};

// Criar Timeline
window.criarTimeline = function(leadId) {
  const lead = dados.leads[leadId];
  if (!lead) {
    alert('Cliente não encontrado!');
    return;
  }

  // Configurar modal
  const modal = document.getElementById('modal-timeline');
  document.getElementById('modal-cliente-nome').textContent = lead.nome;
  
  // Preencher dados existentes
  if (lead.cpf) document.getElementById('timeline-cpf').value = lead.cpf;
  
  // Mostrar modal
  modal.classList.remove('hidden');

  // Fechar modal
  document.querySelector('.close-modal').onclick = function() {
    modal.classList.add('hidden');
  };

  // Configurar envio do formulário
  document.getElementById('form-criar-timeline').onsubmit = function(e) {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const camposObrigatorios = [
      'timeline-cpf', 'timeline-rg', 
      'timeline-nascimento', 'timeline-cep',
      'timeline-renda', 'timeline-fgts'
    ];
    
    let isValid = true;
    camposObrigatorios.forEach(id => {
      const campo = document.getElementById(id);
      if (!campo.value) {
        campo.style.border = '1px solid red';
        isValid = false;
      } else {
        campo.style.border = '';
      }
    });
    
    if (!isValid) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    // Criar/atualizar timeline
    lead.timeline = {
      etapaAtual: 'documentacao',
      criadoEm: new Date().toISOString(),
      dadosCliente: {
        cpf: document.getElementById('timeline-cpf').value,
        rg: document.getElementById('timeline-rg').value,
        nascimento: document.getElementById('timeline-nascimento').value,
        cep: document.getElementById('timeline-cep').value
      },
      renda: {
        valor: document.getElementById('timeline-renda').value,
        fgts: document.getElementById('timeline-fgts').value
      },
      documentos: []
    };

    // Atualizar dados principais do lead
    lead.cpf = document.getElementById('timeline-cpf').value;
    
    salvarDados();
    modal.classList.add('hidden');
    alert('Timeline criada com sucesso!');
    
    // Redirecionar para a página da timeline
    sessionStorage.setItem('leadTimelineAtual', leadId);
    window.location.href = 'timeline.html';
  };
};

// =============================================
// FUNCIONALIDADES EXTRAS
// =============================================
function exportarDados() {
  const dataStr = JSON.stringify(dados, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dados_clientes.json';
  a.click();
}
// Adicione estas funções globais:

// Função para abrir o modal de timeline
window.criarTimeline = function(leadId) {
  const lead = dados.leads[leadId];
  if (!lead) {
    alert('Cliente não encontrado!');
    return;
  }

  // Preenche os dados iniciais
  document.getElementById('modal-cliente-nome').textContent = lead.nome;
  if (lead.cpf) document.getElementById('timeline-cpf').value = lead.cpf;
  
  // Armazena o ID do lead no formulário
  document.getElementById('form-criar-timeline').dataset.leadId = leadId;
  
  // Mostra o modal
  document.getElementById('modal-timeline').classList.remove('hidden');
};

// Função para fechar o modal
window.fecharModalTimeline = function() {
  document.getElementById('modal-timeline').classList.add('hidden');
};

// Configura o submit do formulário
document.getElementById('form-criar-timeline').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const leadId = this.dataset.leadId;
  const lead = dados.leads[leadId];
  
  // Validação dos campos obrigatórios
  const camposObrigatorios = [
    'timeline-cpf', 'timeline-rg', 
    'timeline-nascimento', 'timeline-cep',
    'timeline-renda', 'timeline-fgts'
  ];
  
  let isValid = true;
  camposObrigatorios.forEach(id => {
    const campo = document.getElementById(id);
    if (!campo.value) {
      campo.style.border = '1px solid red';
      isValid = false;
    } else {
      campo.style.border = '';
    }
  });
  
  if (!isValid) {
    alert('Por favor, preencha todos os campos obrigatórios!');
    return;
  }

  // Cria/atualiza a timeline
  lead.timeline = {
    etapaAtual: 'documentacao',
    criadoEm: new Date().toISOString(),
    dadosCliente: {
      cpf: document.getElementById('timeline-cpf').value,
      rg: document.getElementById('timeline-rg').value,
      nascimento: document.getElementById('timeline-nascimento').value,
      cep: document.getElementById('timeline-cep').value
    },
    renda: {
      valor: document.getElementById('timeline-renda').value,
      fgts: document.getElementById('timeline-fgts').value
    },
    documentos: []
  };

  // Atualiza dados principais do lead
  lead.cpf = document.getElementById('timeline-cpf').value;
  
  salvarDados();
  fecharModalTimeline();
  
  // Redireciona para a página da timeline
  sessionStorage.setItem('leadTimelineAtual', leadId);
  window.location.href = 'timelines.html';
});
