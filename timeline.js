// timelines.js
document.addEventListener('DOMContentLoaded', function() {
  // Elementos DOM
  const tabelaTimelines = document.getElementById('tabela-timelines').querySelector('tbody');
  const pesquisaInput = document.getElementById('pesquisa-timeline');
  const btnPesquisar = document.getElementById('btn-pesquisar-timeline');
  const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
  const filtroCorretor = document.getElementById('filtro-corretor');
  const filtroStatus = document.getElementById('filtro-status');
  const filtroPeriodo = document.getElementById('filtro-periodo');

  // Carregar dados
  const dados = JSON.parse(localStorage.getItem('dadosImobiliaria')) || { leads: {}, corretores: {} };

  // Preencher filtro de corretores
  function preencherFiltroCorretores() {
    filtroCorretor.innerHTML = '<option value="">Todos os corretores</option>';
    Object.values(dados.corretores).forEach(corretor => {
      filtroCorretor.innerHTML += `<option value="${corretor.id}">${corretor.nome}</option>`;
    });
  }

  // Carregar Timelines na Tabela
  function carregarTimelines(filtros = {}) {
    tabelaTimelines.innerHTML = '';
    
    const leadsComTimeline = Object.values(dados.leads).filter(lead => lead.timeline);
    
    const leadsFiltrados = leadsComTimeline.filter(lead => {
      // Filtro de texto
      if (filtros.texto) {
        const termo = filtros.texto.toLowerCase();
        if (!lead.nome.toLowerCase().includes(termo) &&
            !lead.email.toLowerCase().includes(termo) &&
            !lead.telefone.toLowerCase().includes(termo)) {
          return false;
        }
      }
      
      // Filtro por corretor
      if (filtros.corretor && lead.corretor_id !== filtros.corretor) {
        return false;
      }
      
      // Filtro por status
      if (filtros.status && lead.timeline.etapaAtual !== filtros.status) {
        return false;
      }
      
      // Filtro por período
      if (filtros.periodo) {
        const dias = parseInt(filtros.periodo);
        const dataCriacao = new Date(lead.timeline.criadoEm);
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);
        
        if (dataCriacao < dataLimite) {
          return false;
        }
      }
      
      return true;
    });
    
    // Ordenar por última atualização (mais recente primeiro)
    leadsFiltrados.sort((a, b) => {
      return new Date(b.timeline.ultimaAtualizacao) - new Date(a.timeline.ultimaAtualizacao);
    });
    
    leadsFiltrados.forEach(lead => {
      const corretor = dados.corretores[lead.corretor_id] || { nome: 'Não atribuído' };
      const row = tabelaTimelines.insertRow();
      
      row.innerHTML = `
        <td>${lead.nome}</td>
        <td>${corretor.nome}</td>
        <td><span class="status-badge ${lead.timeline.etapaAtual}">${formatarEtapa(lead.timeline.etapaAtual)}</span></td>
        <td>${formatarData(lead.timeline.criadoEm)}</td>
        <td>${formatarData(lead.timeline.ultimaAtualizacao)}</td>
        <td>
          <button onclick="abrirTimeline('${lead.id}')" class="btn btn-primary">Abrir Timeline</button>
          <button onclick="excluirTimeline('${lead.id}')" class="btn btn-danger">Excluir</button>
        </td>
      `;
    });
    
    // Atualizar contador
    atualizarContador(leadsFiltrados.length, leadsComTimeline.length);
  }

  // Atualizar contador de resultados
  function atualizarContador(mostrando, total) {
    const contador = document.getElementById('contador-resultados') || criarContador();
    contador.textContent = `Mostrando ${mostrando} de ${total} timelines`;
  }

  function criarContador() {
    const contador = document.createElement('div');
    contador.id = 'contador-resultados';
    contador.className = 'contador-resultados';
    contador.style.margin = '10px 0';
    contador.style.fontSize = '14px';
    contador.style.color = '#666';
    
    const filtersRow = document.querySelector('.filters-row');
    filtersRow.appendChild(contador);
    
    return contador;
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
    if (!dataString) return 'N/A';
    return new Date(dataString).toLocaleDateString('pt-BR');
  }

  // Configurar eventos
  btnPesquisar.addEventListener('click', function() {
    aplicarFiltros();
  });

  pesquisaInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      aplicarFiltros();
    }
  });

  btnLimparFiltros.addEventListener('click', function() {
    pesquisaInput.value = '';
    filtroCorretor.value = '';
    filtroStatus.value = '';
    filtroPeriodo.value = '';
    carregarTimelines();
  });

  [filtroCorretor, filtroStatus, filtroPeriodo].forEach(select => {
    select.addEventListener('change', aplicarFiltros);
  });

  function aplicarFiltros() {
    const filtros = {
      texto: pesquisaInput.value.trim(),
      corretor: filtroCorretor.value,
      status: filtroStatus.value,
      periodo: filtroPeriodo.value
    };
    
    carregarTimelines(filtros);
  }

  // Funções globais
  window.abrirTimeline = function(leadId) {
    sessionStorage.setItem('leadTimelineAtual', leadId);
    window.location.href = 'timeline-details.html'; // Página de detalhes
  };

  window.excluirTimeline = function(leadId) {
    if (confirm('Tem certeza que deseja excluir esta timeline? Esta ação não pode ser desfeita.')) {
      delete dados.leads[leadId].timeline;
      localStorage.setItem('dadosImobiliaria', JSON.stringify(dados));
      carregarTimelines();
      alert('Timeline excluída com sucesso!');
    }
  };

  // Inicialização
  preencherFiltroCorretores();
  carregarTimelines();
});
