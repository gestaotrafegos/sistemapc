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

// Função para salvar dados no localStorage
function salvarDados() {
  localStorage.setItem('dadosImobiliaria', JSON.stringify(dados));
}

// =============================================
// FUNÇÕES DA TIMELINE (NOVAS IMPLEMENTAÇÕES)
// =============================================

// Função para criar timeline (chamada da página de clientes)
window.criarTimeline = function(leadId) {
  // Verifica se já existe timeline para este lead
  const lead = dados.leads[leadId];
  if (!lead) {
    alert('Cliente não encontrado!');
    return;
  }

  // Armazena o lead que está sendo trabalhado
  sessionStorage.setItem('leadTimelineAtual', leadId);
  
  // Redireciona para a página de timeline
  window.location.href = 'timeline.html';
};

// Função para carregar a timeline (executada na página timeline.html)
function carregarTimeline() {
  const leadId = sessionStorage.getItem('leadTimelineAtual');
  if (!leadId) {
    alert('Nenhum cliente selecionado para criar timeline');
    window.location.href = 'clientes.html';
    return;
  }

  const lead = dados.leads[leadId];
  if (!lead) {
    alert('Cliente não encontrado');
    window.location.href = 'clientes.html';
    return;
  }

  // Preenche os dados básicos do lead
  document.getElementById('nome-cliente-timeline').textContent = lead.nome;
  document.getElementById('telefone-cliente').textContent = lead.telefone || 'Não informado';
  document.getElementById('email-cliente').textContent = lead.email || 'Não informado';
  document.getElementById('interesse-cliente').textContent = lead.interesse || 'Não informado';
  
  const corretor = dados.corretores[lead.corretor_id];
  document.getElementById('corretor-cliente').textContent = corretor ? corretor.nome : 'Não atribuído';

  // Se já existir timeline, preenche os dados
  if (lead.timeline) {
    preencherFormularioTimeline(lead.timeline);
  }

  // Configura o formulário
  document.getElementById('formulario-timeline').addEventListener('submit', function(e) {
    e.preventDefault();
    salvarTimeline(leadId);
  });

  // Mostra o formulário de timeline
  document.getElementById('detalhe-cliente').classList.remove('hidden');
}

// Preenche o formulário com dados existentes
function preencherFormularioTimeline(timelineData) {
  // Cliente 1
  document.getElementById('cliente1-nome').value = timelineData.cliente1.nome || '';
  document.getElementById('cliente1-telefone').value = timelineData.cliente1.telefone || '';
  document.getElementById('cliente1-cpf').value = timelineData.cliente1.cpf || '';
  document.getElementById('cliente1-rg').value = timelineData.cliente1.rg || '';
  document.getElementById('cliente1-nascimento').value = timelineData.cliente1.nascimento || '';
  document.getElementById('cliente1-cep').value = timelineData.cliente1.cep || '';
  document.getElementById('cliente1-rua').value = timelineData.cliente1.rua || '';
  document.getElementById('cliente1-bairro').value = timelineData.cliente1.bairro || '';
  document.getElementById('cliente1-complemento').value = timelineData.cliente1.complemento || '';

  // Cliente 2 (opcional)
  if (timelineData.cliente2) {
    document.getElementById('cliente2-nome').value = timelineData.cliente2.nome || '';
    document.getElementById('cliente2-telefone').value = timelineData.cliente2.telefone || '';
    document.getElementById('cliente2-cpf').value = timelineData.cliente2.cpf || '';
    document.getElementById('cliente2-rg').value = timelineData.cliente2.rg || '';
    document.getElementById('cliente2-nascimento').value = timelineData.cliente2.nascimento || '';
  }

  // Dados de renda
  document.getElementById('renda-bruta').value = timelineData.renda.bruta || '';
  document.getElementById('fgts-tempo').value = timelineData.renda.fgts || '';
  document.getElementById('valor-avaliacao').value = timelineData.renda.valorAvaliacao || '';
}

// Salva os dados da timeline
function salvarTimeline(leadId) {
  // Coleta todos os dados do formulário
  const timelineData = {
    cliente1: {
      nome: document.getElementById('cliente1-nome').value,
      telefone: document.getElementById('cliente1-telefone').value,
      cpf: document.getElementById('cliente1-cpf').value,
      rg: document.getElementById('cliente1-rg').value,
      nascimento: document.getElementById('cliente1-nascimento').value,
      cep: document.getElementById('cliente1-cep').value,
      rua: document.getElementById('cliente1-rua').value,
      bairro: document.getElementById('cliente1-bairro').value,
      complemento: document.getElementById('cliente1-complemento').value
    },
    cliente2: {
      nome: document.getElementById('cliente2-nome').value,
      telefone: document.getElementById('cliente2-telefone').value,
      cpf: document.getElementById('cliente2-cpf').value,
      rg: document.getElementById('cliente2-rg').value,
      nascimento: document.getElementById('cliente2-nascimento').value
    },
    renda: {
      bruta: document.getElementById('renda-bruta').value,
      fgts: document.getElementById('fgts-tempo').value,
      valorAvaliacao: document.getElementById('valor-avaliacao').value
    },
    etapaAtual: 'documentacao',
    criadoEm: new Date().toISOString()
  };

  // Validação dos campos obrigatórios
  if (!validarTimeline(timelineData)) {
    return;
  }

  // Salva no objeto do lead
  if (!dados.leads[leadId].timeline) {
    dados.leads[leadId].timeline = {};
  }
  dados.leads[leadId].timeline = timelineData;
  salvarDados();
  
  alert('Timeline salva com sucesso!');
  // Aqui você pode adicionar redirecionamento ou atualizar a UI
}

// Valida os dados da timeline
function validarTimeline(timelineData) {
  // Valida Cliente 1 (todos os campos obrigatórios)
  const cliente1 = timelineData.cliente1;
  if (!cliente1.nome || !cliente1.telefone || !cliente1.cpf || !cliente1.rg || 
      !cliente1.nascimento || !cliente1.cep || !cliente1.rua || !cliente1.bairro) {
    alert('Por favor, preencha todos os campos obrigatórios do Cliente 1');
    return false;
  }

  // Valida Dados de Renda
  if (!timelineData.renda.bruta || !timelineData.renda.fgts || !timelineData.renda.valorAvaliacao) {
    alert('Por favor, preencha todos os campos de renda');
    return false;
  }

  return true;
}

// =============================================
// INICIALIZAÇÃO (APENAS NA PÁGINA TIMELINE)
// =============================================
if (window.location.pathname.includes('timeline.html')) {
  document.addEventListener('DOMContentLoaded', carregarTimeline);
}
