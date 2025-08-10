// timeline.js
document.addEventListener('DOMContentLoaded', function() {
  if (!window.location.pathname.includes('timeline.html')) return;

  const leadId = sessionStorage.getItem('leadTimelineAtual');
  if (!leadId) {
    alert('Nenhum cliente selecionado para criar timeline');
    window.location.href = 'clientes.html';
    return;
  }

  const dados = JSON.parse(localStorage.getItem('dadosImobiliaria'));
  const lead = dados.leads[leadId];
  if (!lead) {
    alert('Cliente não encontrado');
    window.location.href = 'clientes.html';
    return;
  }

  // Exibir dados básicos
  document.getElementById('nome-cliente-timeline').textContent = lead.nome;
  document.getElementById('telefone-cliente').textContent = lead.telefone || 'Não informado';
  document.getElementById('email-cliente').textContent = lead.email || 'Não informado';
  document.getElementById('interesse-cliente').textContent = lead.interesse || 'Não informado';
  
  const corretor = dados.corretores[lead.corretor_id];
  document.getElementById('corretor-cliente').textContent = corretor ? corretor.nome : 'Não atribuído';

  // Configurar formulário
  const formTimeline = document.getElementById('formulario-timeline');
  if (lead.timeline) {
    preencherFormularioTimeline(lead.timeline);
  }

  formTimeline.addEventListener('submit', function(e) {
    e.preventDefault();
    salvarTimeline(leadId);
  });

  document.getElementById('detalhe-cliente').classList.remove('hidden');
});

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

  // Cliente 2
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

function salvarTimeline(leadId) {
  const dados = JSON.parse(localStorage.getItem('dadosImobiliaria'));
  const lead = dados.leads[leadId];

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

  // Validação
  if (!validarTimeline(timelineData)) {
    return;
  }

  lead.timeline = timelineData;
  localStorage.setItem('dadosImobiliaria', JSON.stringify(dados));
  alert('Timeline salva com sucesso!');
}

function validarTimeline(timelineData) {
  const cliente1 = timelineData.cliente1;
  if (!cliente1.nome || !cliente1.telefone || !cliente1.cpf || !cliente1.rg || 
      !cliente1.nascimento || !cliente1.cep || !cliente1.rua || !cliente1.bairro) {
    alert('Por favor, preencha todos os campos obrigatórios do Cliente 1');
    return false;
  }

  if (!timelineData.renda.bruta || !timelineData.renda.fgts || !timelineData.renda.valorAvaliacao) {
    alert('Por favor, preencha todos os campos de renda');
    return false;
  }

  return true;
}
