document.addEventListener('DOMContentLoaded', () => {
  mostrarCarrinho();

  // Evento para botão de prazo global
  const selectPrazoGlobal = document.getElementById("prazo-global");
  if (selectPrazoGlobal) {
    selectPrazoGlobal.addEventListener("change", () => {
      const novoPrazo = selectPrazoGlobal.value;
      const cnpj = sessionStorage.getItem('cliente_cnpj');
      if (!cnpj) return;

      const select = document.querySelector(`.prazo-individual[data-cnpj="${cnpj}"]`);
      if (select) {
        select.value = novoPrazo;
        localStorage.setItem(`prazo_${cnpj}`, novoPrazo);
        alert("Prazo aplicado com sucesso.");
      }
    });
  }

  // Delegação para botão de "Limpar Carrinho"
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('limpar-btn')) {
      const cnpj = e.target.dataset.cnpj;
      if (confirm(`Deseja limpar o carrinho do CNPJ ${cnpj}?`)) {
        localStorage.removeItem(`carrinho_${cnpj}`);
        mostrarCarrinho();
      }
    }
  });

  // Delegação para botão "Finalizar Compra"
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('finalizar-btn')) {
      enviarPedido();
    }
  });
});

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

  // ✅ Atualiza o total exibido no topo
  const totalCarrinho = carrinho.reduce((soma, prod) => soma + (prod.quantidade * prod.preco), 0);
  const spanTotal = document.getElementById('carrinhoLoja-total');
  if (spanTotal) spanTotal.innerHTML = `<strong>${formatarMoeda(totalCarrinho)}</strong>`;

  mostrarCarrinho();
}


function mostrarCarrinho() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  if (!cnpj) return alert("Você precisa estar logado!");

  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");
  const container = document.getElementById('carrinhos-container');
  const template = document.getElementById('template-carrinho-cnpj').content.cloneNode(true);

  container.innerHTML = '';

  if (carrinho.length === 0) {
    container.style.display = 'none';
    return;
  }

  const tabelaBody = template.querySelector('.cart-table-body');
  const totalFinalSpan = template.querySelector('.total-final');
  const prazoSelect = template.querySelector('.prazo-individual');
  const limparBtn = template.querySelector('.limpar-btn');
  const cnpjLabel = template.querySelector('.cnpj-label');

  prazoSelect.dataset.cnpj = cnpj;
  limparBtn.dataset.cnpj = cnpj;
  cnpjLabel.textContent = cnpj;

  let total = 0;

  carrinho.forEach((prod, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td><img src="${prod.imagem}" style="height: 50px;"></td>
    <td>${prod.nome}</td>
    <td>${formatarMoeda(prod.preco)}</td>
    <td>
      <div class="d-flex justify-content-center align-items-center">
        <input type="number" class="form-control text-center" name="quantidade" 
              value="${prod.quantidade}" min="1" style="width: 80px;"
              onchange="atualizarQuantidadeDireta('${cnpj}', ${index}, this.value)">
      </div>
    </td>
    <td id="totalProduto-${index}">${formatarMoeda(prod.total)}</td>
    <td><button class="btn btn-sm btn-danger" onclick="removerItemPorCNPJ('${cnpj}', ${index})">Remover</button></td>
  `;
    total += prod.total;
    tabelaBody.appendChild(tr);
  });


  totalFinalSpan.textContent = formatarMoeda(total);
  container.appendChild(template);
  container.style.display = 'block';

  document.getElementById('total-geral-pedidos').textContent = formatarMoeda(total);

  const prazoSalvo = localStorage.getItem(`prazo_${cnpj}`);
  if (prazoSalvo) prazoSelect.value = prazoSalvo;

  prazoSelect.addEventListener('change', () => {
    localStorage.setItem(`prazo_${cnpj}`, prazoSelect.value);
  });
}

function atualizarQuantidadeDireta(cnpj, index, valor) {
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");

  const novaQtd = parseInt(valor);
  if (isNaN(novaQtd) || novaQtd < 1) return;

  carrinho[index].quantidade = novaQtd;
  carrinho[index].total = parseFloat((novaQtd * carrinho[index].preco).toFixed(2));

  localStorage.setItem(chave, JSON.stringify(carrinho));

  // Atualiza total do produto diretamente
  const totalCell = document.getElementById(`totalProduto-${index}`);
  if (totalCell) totalCell.textContent = formatarMoeda(carrinho[index].total);

  // Atualiza total final do carrinho
  mostrarCarrinho();
}



function enviarPedido() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");
  const prazo = document.querySelector(`[data-cnpj="${cnpj}"]`)?.value;

  if (!prazo) return alert(`Selecione o prazo de pagamento.`);
  if (carrinho.length === 0) return alert("Carrinho vazio.");

  const pedido = { cnpj, prazo, itens: carrinho };

  // Enviar pedido
  fetch('/enviar-pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([pedido])
  })
    .then(res => res.json())
    .then(data => {
      alert("Pedido enviado com sucesso!");
      localStorage.removeItem(chave);
      mostrarCarrinho();  // atualiza visual
    })
    .catch(err => {
      console.error("Erro:", err);
      alert("Erro ao enviar pedido.");
    });
}

function formatarMoeda(valor) {
  const numero = parseFloat(valor);
  if (isNaN(numero)) return "R$ 0,00";
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function removerItem(cnpj, index) {
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");
  carrinho.splice(index, 1);
  localStorage.setItem(chave, JSON.stringify(carrinho));
  mostrarCarrinho();
}

localStorage.setItem(chave, JSON.stringify(carrinho));
quantidadeInput.value = 0;

// Atualiza total no ícone do carrinho no topo
const totalCarrinho = carrinho.reduce((soma, prod) => soma + (prod.quantidade * prod.preco), 0);
const spanTotal = document.getElementById('carrinhoLoja-total');
if (spanTotal) spanTotal.innerHTML = `<strong>${formatarMoeda(totalCarrinho)}</strong>`;

mostrarCarrinho();

