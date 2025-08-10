document.addEventListener('DOMContentLoaded', () => {
  const dados = JSON.parse(localStorage.getItem('dadosImobiliaria')) || { leads: {} };
  const tabela = document.getElementById('tabela-timelines').querySelector('tbody');

  function carregarTimelines() {
    tabela.innerHTML = '';
    
    Object.values(dados.leads).forEach(lead => {
      if (lead.timeline) {
        const row = tabela.insertRow();
        row.innerHTML = `
          <td>${lead.nome}</td>
          <td><span class="etapa-badge">${formatarEtapa(lead.timeline.etapaAtual)}</span></td>
          <td>${formatarData(lead.timeline.criadoEm)}</td>
          <td>
            <button onclick="abrirDetalhesTimeline('${lead.id}')" class="btn btn-primary">Detalhes</button>
          </td>
        `;
      }
    });
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
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
  }

  window.abrirDetalhesTimeline = function(leadId) {
    sessionStorage.setItem('timelineSelecionada', leadId);
    window.location.href = 'timeline-details.html';
  };

  // Pesquisa
  document.getElementById('btn-pesquisar-timeline').addEventListener('click', () => {
    const termo = document.getElementById('pesquisa-timeline').value.toLowerCase();
    const linhas = tabela.querySelectorAll('tr');
    
    linhas.forEach(linha => {
      const nome = linha.cells[0].textContent.toLowerCase();
      linha.style.display = nome.includes(termo) ? '' : 'none';
    });
  });

  carregarTimelines();
});
