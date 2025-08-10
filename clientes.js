// =============================================
// ARMAZENAMENTO DE DADOS (JSON + localStorage)
// =============================================
let dados = JSON.parse(localStorage.getItem('dadosImobiliaria')) || {
  corretores: {
    corretor1: {
      id: "corretor1",
      nome: "Linconl Rangel",
      email: "linconl@imobiliaria.com",
      telefone: "(11) 98765-4321"
    },
    corretor2: {
      id: "corretor2",
      nome: "Luiz Palma",
      email: "Luiz@imobiliaria.com",
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

  // Configurar edição de leads
  formEdicaoCliente.addEventListener('submit', function(e) {
    e.preventDefault();
    const leadId = document.getElementById('id-edicao').value;
    const lead = dados.leads[leadId];
    
    lead.nome = document.getElementById('nome-edicao').value;
    lead.email = document.getElementById('email-edicao').value;
    lead.telefone = document.getElementById('telefone-edicao').value;
    lead.cpf = document.getElementById('cpf-edicao').value;
    lead.interesse = document.getElementById('interesse-edicao').value;
    lead.corretor_id = document.getElementById('corretor-edicao').value;
    lead.ultimo_contato = document.getElementById('ultimo-contato-edicao').value;
    lead.qualidade = document.getElementById('status-edicao').value;
    
    salvarDados();
    formEdicao.classList.add('hidden');
    carregarLeads();
    alert('Dados do cliente atualizados com sucesso!');
  });

  // Configurar botão cancelar edição
  document.getElementById('cancelar-edicao').addEventListener('click', function() {
    formEdicao.classList.add('hidden');
  });

  // Configurar pesquisa
  btnPesquisar.addEventListener('click', function() {
    carregarLeads(pesquisaInput.value);
  });

  // Configurar limpar pesquisa
  btnLimpar.addEventListener('click', function() {
    pesquisaInput.value = '';
    carregarLeads();
  });

  // Configurar exportação
  document.getElementById('btn-exportar').addEventListener('click', exportarDados);

  // Inicialização
  carregarLeads();
});

// =============================================
// FUNÇÕES GLOBAIS
// =============================================

// Carregar Observações
window.carregarObservacoes = function(leadId) {
  const lead = dados.leads[leadId];
  const listaObservacoes = document.getElementById('lista-observacoes');
  
  listaObservacoes.innerHTML = '';
  
  if (lead.observacoes && lead.observacoes.length > 0) {
    lead.observacoes.forEach(obs => {
      const div = document.createElement('div');
      div.className = 'observacao-item';
      div.innerHTML = `<strong>${obs.data}:</strong> ${obs.texto}`;
      listaObservacoes.appendChild(div);
    });
  } else {
    listaObservacoes.innerHTML = '<p>Nenhuma observação registrada</p>';
  }
};

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
  
  window.carregarObservacoes(id);
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
    
    // Recarregar observações se estiver na tela de edição
    if (document.getElementById('id-edicao').value === id) {
      window.carregarObservacoes(id);
    }
    
    // Recarregar lista de leads
    if (window.location.pathname.includes('clientes.html')) {
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }
  }
};

// Criar Timeline
window.criarTimeline = function(leadId) {
  const lead = dados.leads[leadId];
  if (!lead) {
    alert('Cliente não encontrado!');
    return;
  }

  const modal = document.getElementById('modal-timeline');
  const form = document.getElementById('form-criar-timeline');
  
  // Preencher dados iniciais
  document.getElementById('modal-cliente-nome').textContent = lead.nome;
  if (lead.cpf) document.getElementById('timeline-cpf').value = lead.cpf;
  
  // Armazenar lead ID no formulário
  form.dataset.leadId = leadId;
  
  // Mostrar modal
  modal.classList.remove('hidden');
  document.getElementById('timeline-cpf').focus();
};

// Configurar submit do formulário de timeline
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
  document.getElementById('modal-timeline').classList.add('hidden');
  
  // Redirecionar para a página da timeline
  sessionStorage.setItem('leadTimelineAtual', leadId);
  window.location.href = 'timeline.html';
});

// Fechar Modal
window.fecharModalTimeline = function() {
  document.getElementById('modal-timeline').classList.add('hidden');
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
