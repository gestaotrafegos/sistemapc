document.addEventListener('DOMContentLoaded', function() {
  const leadId = sessionStorage.getItem('timelineSelecionada');
  if (!leadId) {
    alert('Nenhuma timeline selecionada');
    window.location.href = 'timelines.html';
    return;
  }

  const dados = JSON.parse(localStorage.getItem('dadosImobiliaria'));
  const lead = dados.leads[leadId];
  
  if (!lead || !lead.timeline) {
    alert('Timeline não encontrada');
    window.location.href = 'timelines.html';
    return;
  }

  // Preenche informações do cliente
  document.getElementById('nome-cliente-timeline').textContent = lead.nome;
  document.getElementById('cliente-cpf').textContent = lead.timeline.cliente1?.cpf || 'Não informado';
  document.getElementById('cliente-telefone').textContent = lead.timeline.cliente1?.telefone || 'Não informado';
  document.getElementById('cliente-email').textContent = lead.email || 'Não informado';
  document.getElementById('cliente-interesse').textContent = lead.interesse || 'Não informado';

  // Renderiza etapas
  renderizarEtapas(lead.timeline.etapaAtual);

  // Configura botão de gerenciar documentos
  document.getElementById('btn-gestao-documentos').addEventListener('click', function() {
    sessionStorage.setItem('leadTimelineAtual', leadId);
    window.location.href = 'timeline.html';
  });

  // Mostra histórico completo
  renderizarHistorico(lead);

  function renderizarEtapas(etapaAtual) {
    const etapas = [
      { id: 'documentacao', nome: 'Documentação' },
      { id: 'analise', nome: 'Análise' },
      { id: 'aprovacao', nome: 'Aprovação' },
      { id: 'contrato', nome: 'Contrato' },
      { id: 'finalizado', nome: 'Finalizado' }
    ];

    const container = document.querySelector('.timeline-flow-steps');
    container.innerHTML = '';

    etapas.forEach(etapa => {
      const etapaEl = document.createElement('div');
      etapaEl.className = `etapa ${etapa.id === etapaAtual ? 'ativa' : ''} ${etapas.indexOf(etapa) < etapas.indexOf({id: etapaAtual}) ? 'completa' : ''}`;
      etapaEl.innerHTML = `
        <div class="etapa-marcador"></div>
        <div class="etapa-texto">${etapa.nome}</div>
      `;
      container.appendChild(etapaEl);
    });
  }

  function renderizarHistorico(lead) {
    const historicoContainer = document.createElement('div');
    historicoContainer.className = 'historico-container';
    historicoContainer.innerHTML = '<h3>Histórico Completo</h3>';
    
    const eventos = [];
    
    // Adiciona criação da timeline
    eventos.push({
      data: lead.timeline.criadoEm,
      tipo: 'criacao',
      texto: `Timeline criada por ${dados.corretores[lead.corretor_id]?.nome || 'corretor'}`
    });
    
    // Adiciona documentos
    if (lead.timeline.documentos) {
      lead.timeline.documentos.forEach(doc => {
        eventos.push({
          data: doc.data,
          tipo: 'documento',
          texto: `Documento enviado: ${doc.nome} (${doc.tipo})`
        });
      });
    }
    
    // Adiciona emails
    if (lead.timeline.emails) {
      lead.timeline.emails.forEach(email => {
        eventos.push({
          data: email.data,
          tipo: 'email',
          texto: `E-mail enviado para ${email.para}`
        });
      });
    }
    
    // Adiciona mudanças de etapa
    if (lead.timeline.historicoEtapas) {
      lead.timeline.historicoEtapas.forEach(etapa => {
        eventos.push({
          data: etapa.data,
          tipo: 'etapa',
          texto: `Etapa alterada para ${formatarEtapa(etapa.para)}`
        });
      });
    }
    
    // Ordena eventos por data
    eventos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Cria lista de eventos
    const lista = document.createElement('div');
    lista.className = 'historico-lista';
    
    if (eventos.length > 0) {
      eventos.forEach(evento => {
        const item = document.createElement('div');
        item.className = `historico-item ${evento.tipo}`;
        item.innerHTML = `
          <div class="historico-data">${formatarData(evento.data)}</div>
          <div class="historico-texto">${evento.texto}</div>
        `;
        lista.appendChild(item);
      });
    } else {
      lista.innerHTML = '<p>Nenhum evento registrado</p>';
    }
    
    historicoContainer.appendChild(lista);
    document.querySelector('.timeline-detail-container').appendChild(historicoContainer);
  }

  function formatarEtapa(etapa) {
    const etapas = {
      'documentacao': 'Documentação',
      'analise': 'Análise',
      'aprovacao': 'Aprovação',
      'contrato': 'Contrato',
      'finalizado': 'Finalizado'
    };
    return etapas[etapa] || etapa;
  }

  function formatarData(dataString) {
    return new Date(dataString).toLocaleString('pt-BR');
  }
});
