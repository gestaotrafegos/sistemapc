{
  "corretores": {
    "corretor1_id": {
      "nome": "João Silva",
      "email": "joao@imobiliaria.com"
    }
  },
  "leads": {
    "lead1_id": {
      "nome": "Cliente A",
      "cpf": "123.456.789-00",
      "telefone": "(11) 99999-9999",
      "email": "cliente@email.com",
      "qualidade": "quente",
      "corretor_id": "corretor1_id",
      "ultimo_contato": "2023-11-20T10:00:00",
      "observacoes": {
        "atendimento1_id": {
          "data": "2023-11-20T10:00:00",
          "texto": "Cliente interessado no apartamento XYZ"
        }
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar/ocultar formulário de cadastro
  const toggleBtn = document.getElementById('toggle-cadastro');
  const formCadastro = document.getElementById('form-cadastro');
  
  toggleBtn.addEventListener('click', () => {
    formCadastro.classList.toggle('hidden');
    toggleBtn.textContent = formCadastro.classList.contains('hidden') ? 
      '+ Novo Cliente' : 'Cancelar';
  });

  // Simulação: Abrir edição de cliente (exemplo)
  function abrirEdicao(clienteId) {
    document.getElementById('form-edicao').classList.remove('hidden');
    // Rolagem suave para o formulário
    document.querySelector('.horizontal-form').scrollIntoView({
      behavior: 'smooth'
    });
  }

  // Exemplo de uso (integrar com sua lógica real)
  abrirEdicao(1);
});
