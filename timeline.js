// timeline.js
document.addEventListener('DOMContentLoaded', function() {
  const leadId = sessionStorage.getItem('leadTimelineAtual');
  if (!leadId) {
    alert('Nenhum cliente selecionado');
    window.location.href = 'clientes.html';
    return;
  }

  const dados = JSON.parse(localStorage.getItem('dadosImobiliaria'));
  const lead = dados.leads[leadId];
  
  if (!lead || !lead.timeline) {
    alert('Timeline não encontrada');
    window.location.href = 'clientes.html';
    return;
  }

  // Exibe informações básicas
  document.getElementById('timeline-cliente-nome').textContent = lead.nome;
  document.getElementById('timeline-status').textContent = formatarEtapa(lead.timeline.etapaAtual);

  // Configura o fluxo visual
  renderizarEtapas(lead.timeline.etapaAtual);

  // Configura upload de documentos
  document.getElementById('btn-upload').addEventListener('click', function() {
    const files = document.getElementById('document-upload').files;
    if (files.length === 0) {
      alert('Selecione pelo menos um documento');
      return;
    }

    if (!lead.timeline.documentos) {
      lead.timeline.documentos = [];
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      lead.timeline.documentos.push({
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
        data: new Date().toISOString()
      });
    }

    salvarDados();
    alert('Documentos enviados com sucesso!');
    atualizarListaDocumentos();
  });

  // Função auxiliar para formatar etapa
  function formatarEtapa(etapa) {
    const etapas = {
      'documentacao': 'Em Documentação',
      'analise': 'Em Análise',
      'aprovacao': 'Aprovado',
      'finalizado': 'Finalizado'
    };
    return etapas[etapa] || etapa;
  }

  // Função para renderizar as etapas
  function renderizarEtapas(etapaAtual) {
    const etapas = [
      { id: 'documentacao', nome: 'Documentação' },
      { id: 'analise', nome: 'Análise' },
      { id: 'aprovacao', nome: 'Aprovação' },
      { id: 'finalizado', nome: 'Finalizado' }
    ];

    const container = document.querySelector('.timeline-flow');
    container.innerHTML = '';

    etapas.forEach(etapa => {
      const etapaEl = document.createElement('div');
      etapaEl.className = `etapa ${etapa.id === etapaAtual ? 'ativa' : ''} ${etapa.id < etapaAtual ? 'completa' : ''}`;
      etapaEl.innerHTML = `
        <div class="etapa-marcador"></div>
        <div class="etapa-texto">${etapa.nome}</div>
      `;
      container.appendChild(etapaEl);
    });
  }

  // Função para atualizar lista de documentos
  function atualizarListaDocumentos() {
    const container = document.getElementById('document-list');
    container.innerHTML = '';
    
    if (lead.timeline.documentos && lead.timeline.documentos.length > 0) {
      const list = document.createElement('ul');
      lead.timeline.documentos.forEach(doc => {
        const item = document.createElement('li');
        item.textContent = `${doc.nome} (${formatarTamanho(doc.tamanho)}) - ${formatarData(doc.data)}`;
        list.appendChild(item);
      });
      container.appendChild(list);
    } else {
      container.textContent = 'Nenhum documento enviado ainda.';
    }
  }

  // Funções auxiliares
  function formatarData(dataString) {
    return new Date(dataString).toLocaleDateString('pt-BR');
  }

  function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // Inicializa a lista de documentos
  atualizarListaDocumentos();
});
