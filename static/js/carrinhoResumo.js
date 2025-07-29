/*alterarQuantidade

// Módulo: carrinho-ui.js (refatorado)
// Responsável por lidar com a interface visual do carrinho

function renderizarCarrinho(tbodyId, totalId, totalPaymentId) {
  const tbody = document.getElementById(tbodyId);
  const totalSpan = document.getElementById(totalId);
  const totalPaymentSpan = document.getElementById(totalPaymentId);
  if (!tbody || !totalSpan || !totalPaymentSpan) return;

  tbody.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    const precoTotal = item.preco * item.quantidade;
    total += precoTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${item.imagem}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>${item.nome}</td>
      <td>R$ ${item.preco.toFixed(2).replace(".", ",")}</td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, -1)">−</button>
          <input type="number" min="1" value="${item.quantidade}" class="form-control mx-2 text-center" style="width: 60px;" onchange="atualizarQuantidadeDireta(${index}, this.value)">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, 1)">+</button>
        </div>
      </td>
      <td>R$ ${precoTotal.toFixed(2).replace(".", ",")}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removerItem(${index})">Remover</button></td>
    `;
    tbody.appendChild(tr);
  });

  totalSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  totalPaymentSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function formatarMoeda(valor) {
  if (typeof valor !== 'number') valor = parseFloat(valor);
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById("cart-badge");
  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  if (badge) {
    badge.textContent = totalItens;
    badge.style.display = totalItens > 0 ? "inline-block" : "none";
  }
}

// carrinho.js — Refatorado

// Utilitários
function formatarMoeda(valor) {
  const numero = typeof valor === "number" ? valor : parseFloat(valor);
  if (isNaN(numero)) return "R$ 0,00";
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function getChaveCarrinho() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  return cnpj ? `carrinho_${cnpj}` : 'carrinho_padrao';
}

// Carrinho em memória e funções de estado


function salvarCarrinho() {
  const chave = getChaveCarrinho();
  localStorage.setItem(chave, JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
}

function carregarCarrinho() {
  const chave = getChaveCarrinho();
  const dados = localStorage.getItem(chave);
  try {
    carrinho = dados ? JSON.parse(dados) : [];
    if (!Array.isArray(carrinho)) carrinho = [];
  } catch (e) {
    console.error("Erro ao carregar carrinho:", e);
    carrinho = [];
  }
  atualizarBadgeCarrinho();
}



function adicionarProdutoCarrinho(nome, preco, quantidade, imagem) {
  const chave = getChaveCarrinho();
  let carrinhoAtual = JSON.parse(localStorage.getItem(chave) || "[]");

  const existente = carrinhoAtual.find(item => item.nome === nome);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinhoAtual.push({ nome, preco, quantidade, imagem });
  }

  localStorage.setItem(chave, JSON.stringify(carrinhoAtual));

  if (chave === getChaveCarrinho()) {
    carrinho = carrinhoAtual;
    atualizarCarrinho();
    atualizarBadgeCarrinho();
  }
}

function removerItem(index) {
  const chave = getChaveCarrinho();
  let carrinhoAtual = JSON.parse(localStorage.getItem(chave) || "[]");

  carrinhoAtual.splice(index, 1);
  localStorage.setItem(chave, JSON.stringify(carrinhoAtual));

  if (chave === getChaveCarrinho()) {
    carrinho = carrinhoAtual;
    atualizarCarrinho();
    atualizarBadgeCarrinho();
  }
}

function limparCarrinho() {
  if (confirm("Deseja limpar o carrinho?")) {
    const chave = getChaveCarrinho();
    localStorage.removeItem(chave);
    carrinho = [];
    atualizarCarrinho();
    atualizarBadgeCarrinho();
  }
}

// carrinho.js (versão revisada)



// Utilitários --------------------------

function getCNPJLogado() {
  return sessionStorage.getItem('cliente_cnpj');
}

function getChaveCarrinho(cnpj = null) {
  const chave = cnpj || getCNPJLogado();
  return chave ? `carrinho_${chave}` : 'carrinho_padrao';
}

function formatarMoeda(valor) {
  const numero = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
  if (isNaN(numero)) return 'R$ 0,00';
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function salvarCarrinho(cnpj = null) {
  const chave = getChaveCarrinho(cnpj);
  localStorage.setItem(chave, JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
}

function carregarCarrinho(cnpj = null) {
  const chave = getChaveCarrinho(cnpj);
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || '[]');
    carrinho = Array.isArray(dados) ? dados : [];
  } catch {
    carrinho = [];
  }
  atualizarBadgeCarrinho();
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  badge.textContent = totalItens;
  badge.style.display = totalItens > 0 ? 'inline-block' : 'none';
}

// Manipulação do carrinho --------------------------

function adicionarProdutoCarrinho(nome, preco, quantidade, imagem) {
  const cnpj = getCNPJLogado();
  const chave = getChaveCarrinho();
  let carrinhoAtual = JSON.parse(localStorage.getItem(chave) || '[]');
  const existente = carrinhoAtual.find(p => p.nome === nome);

  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinhoAtual.push({ nome, preco, quantidade, imagem });
  }

  if (cnpj === getCNPJLogado()) {
    carrinho = carrinhoAtual;
  }

  localStorage.setItem(chave, JSON.stringify(carrinhoAtual));
  atualizarCarrinho();
  atualizarBadgeCarrinho();
}

function alterarQuantidade(index, delta) {
  if (!carrinho[index]) return;
  carrinho[index].quantidade = Math.max(1, carrinho[index].quantidade + delta);
  atualizarCarrinho();
}

function atualizarQuantidadeDireta(index, valor) {
  const novaQtd = parseInt(valor);
  if (!isNaN(novaQtd) && novaQtd >= 1) {
    carrinho[index].quantidade = novaQtd;
    atualizarCarrinho();
  }
}

function removerItem(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const tbody = document.getElementById("cart-table-body");
  const totalSpan = document.getElementById("cart-total");
  const totalPaymentSpan = document.getElementById("cart-total-payment");

  if (!tbody || !totalSpan || !totalPaymentSpan) return;

  tbody.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    const precoTotal = item.preco * item.quantidade;
    total += precoTotal;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${item.imagem}" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>${item.nome}</td>
      <td>${formatarMoeda(item.preco)}</td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidade(${index}, -1)">−</button>
          <input type="number" min="1" value="${item.quantidade}" class="form-control mx-2 text-center" style="width: 60px;" onchange="atualizarQuantidadeDireta(${index}, this.value)">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidade(${index}, 1)">+</button>
        </div>
      </td>
      <td>${formatarMoeda(precoTotal)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removerItem(${index})">Remover</button></td>
    `;
    tbody.appendChild(tr);
  });

  totalSpan.textContent = formatarMoeda(total);
  totalPaymentSpan.textContent = formatarMoeda(total);
  salvarCarrinho();
}
*/



function atualizarResumoGeralPedidos() {
  let totalGeral = 0;

  // Soma de todos os carrinhos armazenados
  Object.keys(localStorage).forEach(chave => {
    if (chave.startsWith("carrinho_")) {
      const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");
      carrinho.forEach(item => {
        totalGeral += item.preco * item.quantidade;
      });
    }
  });

  const spanTotal = document.getElementById("total-geral-pedidos");
  if (spanTotal) {
    spanTotal.textContent = formatarMoeda(totalGeral);
  }

  const cartTotal = document.getElementById("cart-total");
  if (cartTotal) {
    cartTotal.innerHTML = `<strong>${formatarMoeda(totalGeral)}</strong>`;
  }

  const resumoDiv = document.getElementById("resumo-geral-pedidos");
  if (resumoDiv) {
    resumoDiv.style.display = totalGeral > 0 ? "block" : "none";
  }
}


function enviarTodosPedidos() {
  const pedidos = [];

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('carrinho_')) {
      const cnpj = key.replace('carrinho_', '');
      const itens = JSON.parse(localStorage.getItem(key));
      const prazo = document.getElementById('prazo-global').value || '';
      if (itens.length > 0) {
        pedidos.push({ cnpj, prazo, itens });
      }
    }
  });

  if (pedidos.length === 0) {
    alert("Nenhum pedido encontrado para envio.");
    return;
  }

  fetch('/enviar-pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pedidos })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        alert("Todos os pedidos foram enviados com sucesso!");
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('carrinho_')) localStorage.removeItem(key);
        });
        mostrarCarrinhosPorCNPJ(); // recarrega carrinhos
      } else {
        alert("Erro ao enviar pedidos: " + (data.mensagem || "Erro desconhecido."));
      }
    })
    .catch(err => {
      console.error("Erro:", err);
      alert("Falha ao enviar pedidos.");
    });
}
