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
          titulo: "Primeiro contato",
          texto: "Cliente interessado no apartamento XYZ"
        }
      ]
    }
  }
};

// Função para salvar dados no localStorage
function salvarDados() {
  localStorage.setItem('dadosImobiliaria', JSON.stringify(dados));
}

// Função para calcular dias desde o último contato
function calcularDiasSemContato(data) {
  if (!data) return "Nunca";
  
  const hoje = new Date();
  const ultimoContato = new Date(data);
  const diffTime = Math.abs(hoje - ultimoContato);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 0 ? "Hoje" : `${diffDays} dias`;
}

// =============================================
// FUNÇÕES PRINCIPAIS
// =============================================
document.addEventListener('DOMContentLoaded', () => {
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
  
  // Preencher selects de corretores
  function preencherCorretores(selectElement) {
    selectElement.innerHTML = '<option value="">Corretor Responsável</option>';
    Object.values(dados.corretores).forEach(corretor => {
      selectElement.innerHTML += `<option value="${corretor.id}">${corretor.nome}</option>`;
    });
  }
  
  // Preencher selects ao carregar
  preencherCorretores(document.getElementById('corretor-cadastro'));
  preencherCorretores(document.getElementById('corretor-edicao'));

  // 1. Controle do Formulário de Cadastro
  toggleBtn.addEventListener('click', () => {
    formCadastro.classList.toggle('hidden');
    toggleBtn.textContent = formCadastro.classList.contains('hidden') ? 
      '+ Novo Cliente' : 'Cancelar';
  });

  document.getElementById('cancelar-cadastro').addEventListener('click', () => {
    formCadastro.classList.add('hidden');
    toggleBtn.textContent = '+ Novo Cliente';
  });

  // 2. Carregar Leads na Tabela
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
        </td>
      `;
    });
  }

  // 3. Cadastrar Novo Lead
  formCadastroCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome-cadastro').value;
    const email = document.getElementById('email-cadastro').value;
    
    // Validação simples
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

  // 4. Editar Lead
  window.editarLead = function(id) {
    const lead = dados.leads[id];
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
    
    // Carrega as observações
    if (typeof window.carregarObservacoes === 'function') {
      window.carregarObservacoes(id);
    }
    
    formEdicao.scrollIntoView({ behavior: 'smooth' });
  };

  document.getElementById('cancelar-edicao').addEventListener('click', () => {
    formEdicao.classList.add('hidden');
  });

  // 5. Salvar Edição
  formEdicaoCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    const leadId = document.getElementById('id-edicao').value;
    
    dados.leads[leadId] = {
      ...dados.leads[leadId],
      nome: document.getElementById('nome-edicao').value,
      email: document.getElementById('email-edicao').value,
      telefone: document.getElementById('telefone-edicao').value,
      cpf: document.getElementById('cpf-edicao').value,
      interesse: document.getElementById('interesse-edicao').value,
      corretor_id: document.getElementById('corretor-edicao').value,
      ultimo_contato: document.getElementById('ultimo-contato-edicao').value,
      qualidade: document.getElementById('status-edicao').value
    };
    
    salvarDados();
    formEdicao.classList.add('hidden');
    carregarLeads(pesquisaInput.value);
    alert('Alterações salvas!');
  });

  // 6. Registrar Atendimento (VERSÃO CORRIGIDA)
  window.registrarAtendimento = function(id) {
    try {
      // 1. Verifica se o lead existe
      if (!dados.leads[id]) {
        alert('Cliente não encontrado!');
        return;
      }

      // 2. Referências aos elementos do DOM
      const formEdicao = document.getElementById('form-edicao');
      const idField = document.getElementById('id-edicao');
      const nomeField = document.getElementById('nome-edicao');
      const emailField = document.getElementById('email-edicao');
      const dataField = document.getElementById('ultimo-contato-edicao');
      const campoObservacao = document.getElementById('nova-observacao-texto');

      // 3. Validações dos elementos
      if (!formEdicao || !idField || !campoObservacao) {
        throw new Error('Elementos do formulário não encontrados');
      }

      // 4. Abre o formulário de edição
      formEdicao.classList.remove('hidden');

      // 5. Preenche os dados básicos
      const lead = dados.leads[id];
      idField.value = id;
      nomeField.value = lead.nome || '';
      emailField.value = lead.email || '';

      // 6. Atualiza a data do último contato
      const hoje = new Date().toISOString().split('T')[0];
      dataField.value = hoje;

      // 7. Carrega as observações existentes
      if (typeof window.carregarObservacoes === 'function') {
        window.carregarObservacoes(id);
      } else {
        console.warn('Função carregarObservacoes não disponível');
      }

      // 8. Foca e rola até o campo de observações
      setTimeout(() => {
        campoObservacao.focus();
        campoObservacao.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);

    } catch (error) {
      console.error('Erro em registrarAtendimento:', error);
      alert('Erro ao registrar atendimento: ' + error.message);
    }
  };

  // 7. Função para carregar observações
  window.carregarObservacoes = function(leadId) {
    const listaObservacoes = document.getElementById('lista-observacoes');
    listaObservacoes.innerHTML = '';
    
    const lead = dados.leads[leadId];
    if (!lead || !lead.observacoes) return;
    
    lead.observacoes.forEach(obs => {
      const divObs = document.createElement('div');
      divObs.className = 'observacao-item';
      divObs.innerHTML = `
        <div class="observacao-titulo">${obs.titulo || 'Sem título'}</div>
        <div class="observacao-data">${obs.data}</div>
        <div class="observacao-texto">${obs.texto}</div>
      `;
      listaObservacoes.appendChild(divObs);
    });
  };

  // 8. Adicionar nova observação
  document.getElementById('btn-adicionar-observacao').addEventListener('click', () => {
    const leadId = document.getElementById('id-edicao').value;
    const titulo = document.getElementById('nova-observacao-titulo').value;
    const texto = document.getElementById('nova-observacao-texto').value;
    
    if (!texto) {
      alert('Por favor, insira o texto da observação');
      return;
    }
    
    const hoje = new Date().toISOString().split('T')[0];
    
    if (!dados.leads[leadId].observacoes) {
      dados.leads[leadId].observacoes = [];
    }
    
    dados.leads[leadId].observacoes.push({
      data: hoje,
      titulo: titulo || 'Observação',
      texto: texto
    });
    
    // Atualiza o último contato
    dados.leads[leadId].ultimo_contato = hoje;
    
    salvarDados();
    window.carregarObservacoes(leadId);
    
    // Limpa os campos
    document.getElementById('nova-observacao-titulo').value = '';
    document.getElementById('nova-observacao-texto').value = '';
    
    // Atualiza a lista de clientes
    carregarLeads(pesquisaInput.value);
  });

  // 9. Pesquisa de Clientes
  btnPesquisar.addEventListener('click', () => {
    carregarLeads(pesquisaInput.value);
  });

  pesquisaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      carregarLeads(pesquisaInput.value);
    }
  });

  btnLimpar.addEventListener('click', () => {
    pesquisaInput.value = '';
    carregarLeads();
  });

  // Inicialização
  carregarLeads();
});

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
// Função para exportar dados
function exportarParaExcel() {
  // Converter os dados para formato CSV
  const headers = ["Nome", "Telefone", "E-mail", "Interesse", "Corretor", "Último Contato", "Status"];
  
  // Obter os dados dos clientes
  const rows = Object.values(dados.leads).map(lead => {
    const corretor = dados.corretores[lead.corretor_id]?.nome || "Não atribuído";
    return [
      `"${lead.nome}"`,
      `"${lead.telefone}"`,
      `"${lead.email}"`,
      `"${lead.interesse}"`,
      `"${corretor}"`,
      `"${lead.ultimo_contato}"`,
      `"${lead.qualidade}"`
    ].join(",");
  });

  // Criar conteúdo CSV
  const csvContent = [
    headers.join(","),
    ...rows
  ].join("\n");

  // Criar arquivo e fazer download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clientes_imobiliaria.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Adicionar evento ao botão de exportar
document.getElementById('btn-exportar')?.addEventListener('click', exportarParaExcel);
