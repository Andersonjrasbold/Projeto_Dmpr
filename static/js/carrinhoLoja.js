function adicionarAoCarrinho(botao) {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  if (!cnpj) return alert("Você precisa estar logado!");

  const produtoElement = botao.closest('.product');
  if (!produtoElement) return;

  const nome = produtoElement.querySelector('.card-title')?.innerText || produtoElement.querySelector('.nome-produto')?.innerText;
  const codBarra = produtoElement.querySelector('.card-text small')?.innerText || produtoElement.querySelectorAll('td')[2]?.innerText;
  const precoText = produtoElement.querySelector('.text-dark')?.innerText || produtoElement.querySelector('.preco-produto')?.innerText;
  const quantidadeInput = produtoElement.querySelector('input[name="quantidade"]');
  const imagem = produtoElement.querySelector('img')?.src || '';

  const quantidade = parseInt(quantidadeInput?.value || '0');
  if (quantidade <= 0) return alert("Selecione uma quantidade válida.");

  const preco = parseFloat(precoText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

  const item = {
    nome: nome?.trim(),
    codBarra: codBarra?.trim(),
    preco,
    quantidade,
    imagem,
    total: parseFloat((quantidade * preco).toFixed(2))
  };

  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

  const existente = carrinho.find(p => p.codBarra === item.codBarra);
  if (existente) {
    existente.quantidade += item.quantidade;
    existente.total = parseFloat((existente.quantidade * existente.preco).toFixed(2));
  } else {
    carrinho.push(item);
  }

  localStorage.setItem(chave, JSON.stringify(carrinho));
  quantidadeInput.value = 0;
  mostrarCarrinhosPorCNPJ();
}

function mostrarCarrinhosPorCNPJ() {
  const container = document.getElementById('carrinhos-container');
  container.innerHTML = '';
  let totalGeral = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith('carrinho_')) continue;

    const cnpj = key.replace('carrinho_', '');
    const carrinho = JSON.parse(localStorage.getItem(key)) || [];
    if (carrinho.length === 0) continue;

    const template = document.getElementById('template-carrinho-cnpj').content.cloneNode(true);
    const tabelaBody = template.querySelector('.cart-table-body');
    const totalFinalSpan = template.querySelector('.total-final');
    const prazoSelect = template.querySelector('.prazo-individual');
    const limparBtn = template.querySelector('.limpar-btn');
    const cnpjLabel = template.querySelector('.cnpj-label');

    prazoSelect.dataset.cnpj = cnpj;
    limparBtn.dataset.cnpj = cnpj;
    cnpjLabel.textContent = cnpj;

    let total = 0;
    carrinho.forEach(prod => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${prod.imagem}" style="height: 50px;"></td>
        <td>${prod.nome}</td>
        <td>${formatarMoeda(prod.preco)}</td>
        <td>${prod.quantidade}</td>
        <td>${formatarMoeda(prod.total)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removerItemCarrinho('${prod.codBarra}', '${cnpj}')">Remover</button></td>
      `;
      total += prod.total;
      tabelaBody.appendChild(tr);
    });

    totalFinalSpan.textContent = formatarMoeda(total);
    container.appendChild(template);
    totalGeral += total;
  }

  document.getElementById('total-geral-pedidos').textContent = formatarMoeda(totalGeral);
  container.style.display = 'block';
}




function enviarTodosPedidos() {
  let pedidos = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith('carrinho_')) continue;

    const cnpj = key.replace('carrinho_', '');
    const carrinho = JSON.parse(localStorage.getItem(key)) || [];
    if (carrinho.length === 0) continue;

    const prazo = document.querySelector(`[data-cnpj="${cnpj}"]`)?.value;
    if (!prazo) {
      alert(`Selecione o prazo de pagamento para o CNPJ ${cnpj}.`);
      return;
    }

    pedidos.push({ cnpj, prazo, itens: carrinho });
  }

  if (pedidos.length === 0) return alert("Nenhum pedido para enviar.");

  // Aqui você pode enviar via fetch() ou outro método
  console.log("Pedidos enviados:", pedidos);

  pedidos.forEach(p => localStorage.removeItem(`carrinho_${p.cnpj}`));
  alert("Todos os pedidos foram enviados!");
  mostrarCarrinhosPorCNPJ();
}

// Delegação para botões "Limpar Carrinho"
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('limpar-btn')) {
    const cnpj = e.target.dataset.cnpj;
    limparCarrinho(cnpj);
  }
});

// Mostrar carrinhos ao carregar página
document.addEventListener('DOMContentLoaded', mostrarCarrinhosPorCNPJ);
