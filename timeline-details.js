document.addEventListener('DOMContentLoaded', function() {
  // CORREÇÃO: Usar a chave correta que foi definida no timelines.js
  const leadId = sessionStorage.getItem('leadTimelineAtual');
  
  if (!leadId) {
    alert('Nenhuma timeline selecionada');
    window.location.href = 'timelines.html'; // Voltar para lista de timelines
    return;
  }

  const dados = JSON.parse(localStorage.getItem('dadosImobiliaria')) || { leads: {}, corretores: {} };
  const lead = dados.leads[leadId];
  
  if (!lead || !lead.timeline) {
    alert('Timeline não encontrada');
    window.location.href = 'timelines.html';
    return;
  }
   // Adicione estas funções NO INÍCIO do DOMContentLoaded:

  // Função para toggle dos documentos
  window.toggleDocumentos = function() {
    const content = document.getElementById('documentos-content');
    const arrow = document.getElementById('documentos-arrow');
    
    content.classList.toggle('hidden');
    arrow.textContent = content.classList.contains('hidden') ? '►' : '▼';
  };
  
  // Função para mostrar/ocultar quadro de aprovação
  function toggleQuadroAprovacao(etapaAtual) {
    const quadro = document.getElementById('quadro-aprovacao');
    if (etapaAtual === 'aprovacao' || etapaAtual === 'contrato' || etapaAtual === 'finalizado') {
      quadro.classList.remove('hidden');
      carregarAprovacoes(lead);
    } else {
      quadro.classList.add('hidden');
    }
  }
  
  // Função para carregar aprovações
  function carregarAprovacoes(lead) {
    const container = document.getElementById('lista-aprovacoes');
    container.innerHTML = '';
    
    if (!lead.timeline.aprovacoes || lead.timeline.aprovacoes.length === 0) {
      container.innerHTML = '<p>Nenhum registro de aprovação encontrado.</p>';
      return;
    }
    
    lead.timeline.aprovacoes.sort((a, b) => new Date(b.data) - new Date(a.data))
      .forEach(aprovacao => {
        const div = document.createElement('div');
        div.className = 'aprovacao-item';
        div.innerHTML = `
          <div class="aprovacao-data">${formatarDataCompleta(aprovacao.data)}</div>
          <div class="aprovacao-texto">${aprovacao.texto}</div>
          <button onclick="removerAprovacao('${aprovacao.id}')" class="btn-remover-aprovacao">
            🗑️ Remover
          </button>
        `;
        container.appendChild(div);
      });
  }
  
  // Função para adicionar aprovação
  function configurarAprovacao(lead) {
    document.getElementById('btn-adicionar-aprovacao').addEventListener('click', function() {
      const texto = document.getElementById('texto-aprovacao').value.trim();
      
      if (!texto) {
        alert('Por favor, digite o texto da aprovação');
        return;
      }
      
      if (!lead.timeline.aprovacoes) {
        lead.timeline.aprovacoes = [];
      }
      
      const novaAprovacao = {
        id: 'aprovacao_' + Date.now(),
        texto: texto,
        data: new Date().toISOString(),
        responsavel: 'corretor' // Você pode adicionar o usuário logado aqui
      };
      
      lead.timeline.aprovacoes.push(novaAprovacao);
      document.getElementById('texto-aprovacao').value = '';
      
      salvarDados(dados);
      carregarAprovacoes(lead);
      alert('Anotação registrada com sucesso!');
    });
  }
  
  // Função global para remover aprovação
  window.removerAprovacao = function(aprovacaoId) {
    if (confirm('Tem certeza que deseja remover este registro?')) {
      lead.timeline.aprovacoes = lead.timeline.aprovacoes.filter(a => a.id !== aprovacaoId);
      salvarDados(dados);
      carregarAprovacoes(lead);
    }
  };
  
  // Adicione esta função auxiliar para data completa
  function formatarDataCompleta(dataString) {
    return new Date(dataString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // NO FINAL do DOMContentLoaded, adicione:
  toggleQuadroAprovacao(lead.timeline.etapaAtual);
  configurarAprovacao(lead);
  
  // Modifique a função avancarEtapa para mostrar o quadro quando necessário
  function avancarEtapa(lead) {
    const etapas = ['documentacao', 'analise', 'aprovacao', 'contrato', 'finalizado'];
    const etapaAtualIndex = etapas.indexOf(lead.timeline.etapaAtual);
    
    if (etapaAtualIndex < etapas.length - 1) {
      const novaEtapa = etapas[etapaAtualIndex + 1];
      
      lead.timeline.historicoEtapas.push({
        tipo: 'etapa',
        data: new Date().toISOString(),
        texto: `Etapa alterada para ${formatarEtapa(novaEtapa)}`
      });
      
      lead.timeline.etapaAtual = novaEtapa;
      lead.timeline.ultimaAtualizacao = new Date().toISOString();
      
      salvarDados(dados);
      
      // Mostra/oculta quadro de aprovação baseado na nova etapa
      toggleQuadroAprovacao(novaEtapa);
      
      alert(`Etapa avançada para: ${formatarEtapa(novaEtapa)}`);
      window.location.reload();
    }
}
  // INICIALIZAÇÃO - Garantir que arrays existam
  if (!lead.timeline.documentos) lead.timeline.documentos = [];
  if (!lead.timeline.emails) lead.timeline.emails = [];
  if (!lead.timeline.historicoEtapas) lead.timeline.historicoEtapas = [];

  // Exibe informações básicas
  document.getElementById('timeline-cliente-nome').textContent = lead.nome;
  document.getElementById('timeline-status').textContent = formatarEtapa(lead.timeline.etapaAtual);
  document.getElementById('timeline-status').className = `status-badge ${lead.timeline.etapaAtual}`;

  // Informações do cliente
  document.getElementById('cliente-cpf').textContent = lead.timeline.cliente1?.cpf || 'Não informado';
  document.getElementById('cliente-telefone').textContent = lead.timeline.cliente1?.telefone || 'Não informado';
  document.getElementById('cliente-email').textContent = lead.email || 'Não informado';
  document.getElementById('cliente-interesse').textContent = lead.interesse || 'Não informado';

  // Configura o fluxo visual
  renderizarEtapas(lead.timeline.etapaAtual);

  // Configura upload de documentos
  configurarUploadsDocumentos(lead);

  // Configura botão avançar etapa
  document.getElementById('btn-avancar-etapa').addEventListener('click', function() {
    avancarEtapa(lead);
  });

  // Configura envio de email
  document.getElementById('btn-enviar-email').addEventListener('click', function() {
    abrirModalEmail(lead);
  });

  // Configura gestão de documentos
  document.getElementById('btn-gestao-documentos').addEventListener('click', function() {
    // Já estamos na página de gestão de documentos
    alert('Você já está na página de gestão de documentos desta timeline.');
  });

  // Mostra histórico completo
  renderizarHistorico(lead);

  // Função para configurar uploads específicos
  function configurarUploadsDocumentos(lead) {
    const documentosNecessarios = [
      { id: 'upload-rg', nome: 'RG', obrigatorio: true, tipo: 'rg' },
      { id: 'upload-cpf', nome: 'CPF', obrigatorio: true, tipo: 'cpf' },
      { id: 'upload-comprovante-renda', nome: 'Comprovante de Renda', obrigatorio: true, tipo: 'comprovante-renda' },
      { id: 'upload-certidao', nome: 'Certidão Civil', obrigatorio: true, tipo: 'certidao' },
      { id: 'upload-simulacao', nome: 'Simulação', obrigatorio: true, tipo: 'simulacao' },
      { id: 'upload-outros', nome: 'Outros Documentos', obrigatorio: false, tipo: 'outros' }
    ];

    const container = document.getElementById('document-list');
    container.innerHTML = '';

    documentosNecessarios.forEach(doc => {
      const docContainer = document.createElement('div');
      docContainer.className = 'document-upload-container';
      docContainer.innerHTML = `
        <h4>${doc.nome} ${doc.obrigatorio ? '<span class="obrigatorio">*</span>' : ''}</h4>
        <input type="file" id="${doc.id}" class="document-upload" data-tipo="${doc.tipo}">
        <div id="lista-${doc.id}" class="document-list"></div>
      `;
      container.appendChild(docContainer);

      // Configura evento de upload
      document.getElementById(doc.id).addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
          enviarDocumento(lead, files[0], doc.tipo);
        }
      });
    });

    // Mostra documentos já enviados
    atualizarListaDocumentos(lead);
  }

  // Função para enviar documento
  function enviarDocumento(lead, file, tipo) {
    // Cria URL temporária para o arquivo
    const fileURL = URL.createObjectURL(file);

    lead.timeline.documentos.push({
      nome: file.name,
      tipo: tipo,
      tamanho: file.size,
      data: new Date().toISOString(),
      arquivo: fileURL
    });

    // Adiciona ao histórico
    lead.timeline.historicoEtapas.push({
      tipo: 'documento',
      data: new Date().toISOString(),
      texto: `Documento enviado: ${file.name} (${tipo})`
    });

    salvarDados(dados);
    atualizarListaDocumentos(lead);
    alert('Documento enviado com sucesso!');
  }

  // Função para abrir modal de email
  function abrirModalEmail(lead) {
    const modal = document.createElement('div');
    modal.className = 'modal-email';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2>Enviar Documentos para Análise</h2>
        
        <div class="form-group">
          <label>Para (E-mail):</label>
          <input type="email" id="email-destino" value="analise@imobiliaria.com" class="form-input">
        </div>
        
        <div class="form-group">
          <label>Assunto:</label>
          <input type="text" id="email-assunto" value="Documentação para análise - ${lead.nome}" class="form-input">
        </div>
        
        <div class="form-group">
          <label>Mensagem:</label>
          <textarea id="email-mensagem" class="form-textarea">Prezados,\n\nSegue em anexo a documentação completa do cliente ${lead.nome} para análise do financiamento.\n\nAtenciosamente,\n${dados.corretores[lead.corretor_id]?.nome || 'Corretor'}</textarea>
        </div>
        
        <button id="btn-enviar-email-confirm" class="btn btn-primary">Enviar E-mail</button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btn-enviar-email-confirm').addEventListener('click', function() {
      const emailData = {
        para: document.getElementById('email-destino').value,
        assunto: document.getElementById('email-assunto').value,
        mensagem: document.getElementById('email-mensagem').value,
        data: new Date().toISOString()
      };

      lead.timeline.emails.push(emailData);
      
      // Adiciona ao histórico
      lead.timeline.historicoEtapas.push({
        tipo: 'email',
        data: new Date().toISOString(),
        texto: `E-mail enviado para: ${emailData.para} - ${emailData.assunto}`
      });

      salvarDados(dados);

      alert('E-mail registrado com sucesso!');
      modal.remove();
      window.location.reload();
    });
  }

  // Função para avançar etapa
  function avancarEtapa(lead) {
    const etapas = ['documentacao', 'analise', 'aprovacao', 'contrato', 'finalizado'];
    const etapaAtualIndex = etapas.indexOf(lead.timeline.etapaAtual);
    
    if (etapaAtualIndex < etapas.length - 1) {
      const novaEtapa = etapas[etapaAtualIndex + 1];
      
      // Adiciona ao histórico
      lead.timeline.historicoEtapas.push({
        tipo: 'etapa',
        data: new Date().toISOString(),
        texto: `Etapa alterada de ${formatarEtapa(lead.timeline.etapaAtual)} para ${formatarEtapa(novaEtapa)}`
      });
      
      lead.timeline.etapaAtual = novaEtapa;
      lead.timeline.ultimaAtualizacao = new Date().toISOString();
      
      salvarDados(dados);
      window.location.reload();
    } else {
      alert('A timeline já está na etapa final!');
    }
  }

  // Função para atualizar lista de documentos
  function atualizarListaDocumentos(lead) {
    if (!lead.timeline.documentos || lead.timeline.documentos.length === 0) {
      return;
    }

    lead.timeline.documentos.forEach(doc => {
      const container = document.getElementById(`lista-upload-${doc.tipo}`);
      if (container) {
        container.innerHTML = `
          <div class="document-item">
            <span>${doc.nome}</span>
            <span>(${formatarTamanho(doc.tamanho)})</span>
            <span>${formatarData(doc.data)}</span>
            <button onclick="visualizarDocumento('${doc.arquivo}')" class="btn btn-small">Visualizar</button>
          </div>
        `;
      }
    });
  }

  // Função para renderizar etapas
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
      etapaEl.className = `etapa ${etapa.id === etapaAtual ? 'ativa' : ''} ${etapas.indexOf(etapa) < etapas.indexOf(etapas.find(e => e.id === etapaAtual)) ? 'completa' : ''}`;
      etapaEl.innerHTML = `
        <div class="etapa-marcador"></div>
        <div class="etapa-texto">${etapa.nome}</div>
      `;
      container.appendChild(etapaEl);
    });
  }

  // Função para renderizar histórico
  function renderizarHistorico(lead) {
    const historicoContainer = document.getElementById('historico-lista');
    historicoContainer.innerHTML = '';
    
    if (!lead.timeline.historicoEtapas || lead.timeline.historicoEtapas.length === 0) {
      historicoContainer.innerHTML = '<p>Nenhuma atividade registrada</p>';
      return;
    }
    
    // Ordenar por data (mais recente primeiro)
    const historicoOrdenado = [...lead.timeline.historicoEtapas].sort((a, b) => 
      new Date(b.data) - new Date(a.data)
    );
    
    historicoOrdenado.forEach(evento => {
      const item = document.createElement('div');
      item.className = `historico-item ${evento.tipo}`;
      item.innerHTML = `
        <div class="historico-data">${formatarData(evento.data)}</div>
        <div class="historico-texto">${evento.texto}</div>
      `;
      historicoContainer.appendChild(item);
    });
  }

  // Funções auxiliares
  function formatarEtapa(etapa) {
    const etapas = {
      'documentacao': 'Documentação',
      'analise': 'Análise',
      'aprovacao': 'Aprovado',
      'contrato': 'Contrato',
      'finalizado': 'Finalizado'
    };
    return etapas[etapa] || etapa;
  }

  function formatarData(dataString) {
    return new Date(dataString).toLocaleDateString('pt-BR');
  }

  function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function salvarDados(dados) {
    localStorage.setItem('dadosImobiliaria', JSON.stringify(dados));
  }

  // Funções globais
  window.visualizarDocumento = function(url) {
    window.open(url, '_blank');
  };
});
