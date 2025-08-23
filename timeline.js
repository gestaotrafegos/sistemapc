document.addEventListener('DOMContentLoaded', function() {
  const leadId = sessionStorage.getItem('leadTimelineAtual');
  if (!leadId) {
    alert('Nenhum cliente selecionado');
    window.location.href = 'timelines.html';
    return;
  }
  // Inicializa documentos se não existirem
  if (!lead.timeline.documentos) {
    lead.timeline.documentos = [];
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
  document.getElementById('timeline-status').className = `status-badge ${lead.timeline.etapaAtual}`;

  // Configura o fluxo visual
  renderizarEtapas(lead.timeline.etapaAtual);

  // Configura upload de documentos específicos
  configurarUploadsDocumentos();

  // Configura botão avançar etapa
  document.getElementById('btn-avancar-etapa').addEventListener('click', function() {
    avancarEtapa(lead);
  });

  // Configura envio de email
  document.getElementById('btn-enviar-email').addEventListener('click', function() {
    abrirModalEmail(lead);
  });

  // Função para configurar uploads específicos
  function configurarUploadsDocumentos() {
    const documentosNecessarios = [
      { id: 'upload-rg', nome: 'RG', obrigatorio: true },
      { id: 'upload-cpf', nome: 'CPF', obrigatorio: true },
      { id: 'upload-comprovante-renda', nome: 'Comprovante de Renda', obrigatorio: true },
      { id: 'upload-certidao', nome: 'Certidão Civil', obrigatorio: true },
      { id: 'upload-simulacao', nome: 'Simulação', obrigatorio: true },
      { id: 'upload-outros', nome: 'Outros Documentos', obrigatorio: false }
    ];

    const container = document.getElementById('document-list');
    container.innerHTML = '';

    documentosNecessarios.forEach(doc => {
      const docContainer = document.createElement('div');
      docContainer.className = 'document-upload-container';
      docContainer.innerHTML = `
        <h4>${doc.nome} ${doc.obrigatorio ? '<span class="obrigatorio">*</span>' : ''}</h4>
        <input type="file" id="${doc.id}" class="document-upload" data-tipo="${doc.id.replace('upload-', '')}">
        <div id="lista-${doc.id}" class="document-list"></div>
      `;
      container.appendChild(docContainer);

      // Configura evento de upload
      document.getElementById(doc.id).addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
          enviarDocumento(lead, files[0], doc.id.replace('upload-', ''));
        }
      });
    });

    // Mostra documentos já enviados
    atualizarListaDocumentos(lead);
  }

  // Função para enviar documento
  function enviarDocumento(lead, file, tipo) {
    if (!lead.timeline.documentos) {
      lead.timeline.documentos = [];
    }

    // Remove documento do mesmo tipo se existir
    lead.timeline.documentos = lead.timeline.documentos.filter(d => d.tipo !== tipo);

    lead.timeline.documentos.push({
      nome: file.name,
      tipo: tipo,
      tamanho: file.size,
      data: new Date().toISOString(),
      arquivo: URL.createObjectURL(file)
    });

    salvarDados();
    atualizarListaDocumentos(lead);
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

      if (!lead.timeline.emails) {
        lead.timeline.emails = [];
      }

      lead.timeline.emails.push(emailData);
      lead.timeline.etapaAtual = 'analise';
      salvarDados();

      alert('E-mail registrado com sucesso! Processo enviado para análise.');
      modal.remove();
      window.location.reload();
    });
  }

  // Função para avançar etapa
  function avancarEtapa(lead) {
    const etapas = ['documentacao', 'analise', 'aprovacao', 'contrato', 'finalizado'];
    const etapaAtualIndex = etapas.indexOf(lead.timeline.etapaAtual);
    
    if (etapaAtualIndex < etapas.length - 1) {
      // Verifica documentos obrigatórios na etapa de documentação
      if (lead.timeline.etapaAtual === 'documentacao') {
        const docsObrigatorios = ['rg', 'cpf', 'comprovante-renda', 'certidao', 'simulacao'];
        const docsFaltantes = docsObrigatorios.filter(tipo => 
          !lead.timeline.documentos?.some(doc => doc.tipo === tipo)
        );
        
        if (docsFaltantes.length > 0) {
          alert(`Documentos obrigatórios faltantes: ${docsFaltantes.join(', ')}`);
          return;
        }
      }
      
      lead.timeline.etapaAtual = etapas[etapaAtualIndex + 1];
      lead.timeline.ultimaAtualizacao = new Date().toISOString();
      salvarDados();
      window.location.reload();
    }
  }

  // Função para atualizar lista de documentos
  function atualizarListaDocumentos(lead) {
    if (!lead.timeline.documentos) return;

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

  // Funções auxiliares
  function formatarEtapa(etapa) {
    const etapas = {
      'documentacao': 'Em Documentação',
      'analise': 'Em Análise',
      'aprovacao': 'Aprovado',
      'contrato': 'Contrato',
      'finalizado': 'Finalizado'
    };
    return etapas[etapa] || etapa;
  }

  function renderizarEtapas(etapaAtual) {
    const etapas = [
      { id: 'documentacao', nome: 'Documentação' },
      { id: 'analise', nome: 'Análise' },
      { id: 'aprovacao', nome: 'Aprovação' },
      { id: 'contrato', nome: 'Contrato' },
      { id: 'finalizado', nome: 'Finalizado' }
    ];

    const container = document.querySelector('.timeline-flow');
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

  function formatarData(dataString) {
    return new Date(dataString).toLocaleDateString('pt-BR');
  }

  function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function salvarDados() {
    localStorage.setItem('dadosImobiliaria', JSON.stringify(dados));
  }

  // Funções globais
  window.visualizarDocumento = function(url) {
    window.open(url, '_blank');
  };
});
