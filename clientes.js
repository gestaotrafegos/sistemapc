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
      ultimo_contato: "2023-11-20",
      observacoes: [
        {
          data: "2023-11-20",
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
// FUNÇÕES PRINCIPAIS (CORRIGIDAS)
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const toggleBtn = document.getElementById('toggle-cadastro');
  const formCadastro = document.getElementById('form-cadastro');
  const formEdicao = document.getElementById('form-edicao');
  const tabelaClientes = document.getElementById('tabela-clientes');
  const formCadastroCliente = document.getElementById('cadastro-cliente');
  const formEdicaoCliente = document.getElementById('edicao-cliente');

  // 1. Controle do Formulário de Cadastro
  toggleBtn.addEventListener('click', () => {
    formCadastro.classList.toggle('hidden');
    toggleBtn.textContent = formCadastro.classList.contains('hidden') ? 
      '+ Novo Cliente' : 'Cancelar';
  });

  // 2. Carregar Leads na Tabela
  function carregarLeads() {
    const tbody = tabelaClientes.querySelector('tbody') || tabelaClientes.createTBody();
    tbody.innerHTML = '';
    
    // Cabeçalho se não existir
    if (!tabelaClientes.tHead) {
      const thead = tabelaClientes.createTHead();
      thead.innerHTML = `
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Interesse</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      `;
    }
    
    Object.values(dados.leads).forEach(lead => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${lead.nome}</td>
        <td>${lead.telefone}</td>
        <td>${lead.interesse}</td>
        <td>${lead.qualidade}</td>
        <td>
          <button onclick="editarLead('${lead.id}')" class="btn-editar">✏️ Editar</button>
          <button onclick="registrarAtendimento('${lead.id}')" class="btn-atendimento">📞 Atendimento</button>
        </td>
      `;
    });
  }

  // 3. Cadastrar Novo Lead (CORRIGIDO)
  formCadastroCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const form = e.target;
    const nomeInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    
    // Validação simples
    if (!nomeInput.value || !emailInput.value) {
      alert('Nome e e-mail são obrigatórios!');
      return;
    }
    
    const novoLeadId = 'lead' + (Object.keys(dados.leads).length + 1);
    
    dados.leads[novoLeadId] = {
      id: novoLeadId,
      nome: nomeInput.value,
      email: emailInput.value,
      telefone: form.querySelector('input[type="tel"]').value || '',
      interesse: form.querySelector('select').value,
      qualidade: "quente",
      corretor_id: "corretor1", // CORREÇÃO: estava "corretor1"
      ultimo_contato: new Date().toISOString().split('T')[0],
      observacoes: []
    };
    
    salvarDados(); // Persiste os dados
    form.reset();
    formCadastro.classList.add('hidden');
    toggleBtn.textContent = '+ Novo Cliente';
    carregarLeads();
    alert('Lead cadastrado com sucesso!');
  });

  // 4. Editar Lead
  window.editarLead = function(id) {
    const lead = dados.leads[id];
    formEdicao.classList.remove('hidden');
    
    const form = formEdicaoCliente;
    form.dataset.leadId = id;
    form.querySelector('input[type="text"]').value = lead.nome;
    form.querySelector('input[type="email"]').value = lead.email;
    form.querySelector('input[type="tel"]').value = lead.telefone;
    form.querySelector('select').value = lead.interesse;
    form.querySelector('input[type="date"]').value = lead.ultimo_contato;
    
    formEdicao.scrollIntoView({ behavior: 'smooth' });
  };

  // 5. Salvar Edição
  formEdicaoCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const leadId = form.dataset.leadId;
    
    dados.leads[leadId] = {
      ...dados.leads[leadId],
      nome: form.querySelector('input[type="text"]').value,
      email: form.querySelector('input[type="email"]').value,
      telefone: form.querySelector('input[type="tel"]').value,
      interesse: form.querySelector('select').value,
      ultimo_contato: form.querySelector('input[type="date"]').value
    };
    
    formEdicao.classList.add('hidden');
    carregarLeads();
    alert('Alterações salvas!');
  });

  // 6. Registrar Atendimento
  window.registrarAtendimento = function(id) {
    const texto = prompt("Registre o atendimento:");
    if (texto) {
      dados.leads[id].observacoes.push({
        data: new Date().toISOString().split('T')[0],
        texto: texto
      });
      alert('Atendimento registrado!');
    }
  };

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

// (Adicione um botão no HTML para chamar: <button onclick="exportarDados()">Exportar Dados</button>)
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
