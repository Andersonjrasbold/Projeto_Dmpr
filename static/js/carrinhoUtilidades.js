// ================== carrinho-storage.js ==================

function getChaveCarrinho() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  return cnpj ? `carrinho_${cnpj}` : 'carrinho_padrao';
}

function salvarCarrinhoLocal(carrinho, chave = getChaveCarrinho()) {
  localStorage.setItem(chave, JSON.stringify(carrinho));
}

function carregarCarrinhoLocal(chave = getChaveCarrinho()) {
  try {
    const data = localStorage.getItem(chave);
    const carrinho = data ? JSON.parse(data) : [];
    return Array.isArray(carrinho) ? carrinho : [];
  } catch (e) {
    console.error("Erro ao carregar carrinho:", e);
    return [];
  }
}

function removerCarrinhoLocal(chave = getChaveCarrinho()) {
  localStorage.removeItem(chave);
}


// ================== carrinho-utils.js ==================

function formatarMoeda(valor) {
  const numero = typeof valor === 'number' ? valor : parseFloat(valor);
  if (isNaN(numero)) return "R$ 0,00";
  return `R$ ${numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}


function alterarQuantidade(delta, botao) {
  const input = botao.parentElement.querySelector('input[name="quantidade"]');
  let valor = parseInt(input.value) || 0;
  valor += delta;
  input.value = Math.max(0, valor);
}

// ================== carrinho-core.js ==================


function removerItemCarrinho(codBarra, cnpj) {
  const chave = `carrinho_${cnpj}`;
  let carrinho = JSON.parse(localStorage.getItem(chave)) || [];
  carrinho = carrinho.filter(p => p.codBarra !== codBarra);
  localStorage.setItem(chave, JSON.stringify(carrinho));
  mostrarCarrinhosPorCNPJ();
}

function limparCarrinho(cnpj) {
  if (!confirm("Deseja realmente limpar o carrinho?")) return;
  localStorage.removeItem(`carrinho_${cnpj}`);
  mostrarCarrinhosPorCNPJ();
}

function atualizarQuantidadeDireta(index, valor) {
  const novaQtd = parseInt(valor);
  if (isNaN(novaQtd) || novaQtd < 1) return;
  carrinho[index].quantidade = novaQtd;
  atualizarCarrinho();
}


function limparCarrinho() {
  if (confirm("Deseja limpar o carrinho?")) {
    removerCarrinhoLocal();
    carrinho = [];
    atualizarCarrinho();
    atualizarBadgeCarrinho(carrinho);
  }
}



/*


function salvarCarrinho() {
  const chave = getChaveCarrinho();
  localStorage.setItem(chave, JSON.stringify(carrinho));
  
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

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${item.imagem}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>${item.nome}</td>
      <td>R$ ${item.preco.toFixed(2).replace(".", ",")}</td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, -1)">−</button>
          <input type="number" min="1" value="${item.quantidade}" 
            class="form-control mx-2 text-center" style="width: 60px;"
            onchange="atualizarQuantidadeDireta(${index}, this.value)">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, 1)">+</button>
        </div>
      </td>
      <td>R$ ${(precoTotal).toFixed(2).replace(".", ",")}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removerItem(${index})">Remover</button></td>
    `;
    tbody.appendChild(tr);
  });

  totalSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  totalPaymentSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

  salvarCarrinho(); // Salva estado atualizado
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

  // Salva no carrinho do CNPJ específico
  localStorage.setItem(chave, JSON.stringify(carrinhoAtual));

  // Se este CNPJ for o mesmo da sessão, atualiza o carrinho visual (cart padrão)
  if (chave === getChaveCarrinho()) {
    carrinho = carrinhoAtual;
    atualizarCarrinho();
    
  }
}



function alterarQuantidade(index, delta) {
  if (!carrinho[index]) return;

  const novaQuantidade = carrinho[index].quantidade + delta;
  carrinho[index].quantidade = novaQuantidade < 1 ? 1 : novaQuantidade;

  atualizarCarrinho();
}


function atualizarQuantidadeDireta(index, valor) {
  const novaQtd = parseInt(valor);
  if (isNaN(novaQtd) || novaQtd < 1) return;

  carrinho[index].quantidade = novaQtd;
  atualizarCarrinho();
}


function removerItem(index) {
  const chave = getChaveCarrinho();
  let carrinhoAtual = JSON.parse(localStorage.getItem(chave) || "[]");

  carrinhoAtual.splice(index, 1);
  localStorage.setItem(chave, JSON.stringify(carrinhoAtual));

  if (chave === getChaveCarrinho()) {
    carrinho = carrinhoAtual;
    atualizarCarrinho();
    
  }
}

function limparCarrinho() {
  if (confirm("Deseja limpar o carrinho?")) {
    const chave = getChaveCarrinho();
    localStorage.removeItem(chave);
    carrinho = [];
    atualizarCarrinho();
    
  }
}


function adicionarAoCarrinho(botao) {
  const card = botao.closest(".card");
  if (card) {
    const nome = card.querySelector(".card-title")?.innerText;
    const imagem = card.querySelector("img")?.getAttribute("src");
    const precoTexto = card.querySelector(".text-dark")?.innerText.replace("Final R$ ", "").replace(",", ".");
    const preco = parseFloat(precoTexto);
    const input = card.querySelector("input[name='quantidade']");
    const quantidade = parseInt(input?.value);

    if (!quantidade || quantidade <= 0 || isNaN(preco)) {
      alert("Escolha uma quantidade e preço válidos.");
      return;
    }

    adicionarProdutoCarrinho(nome, preco, quantidade, imagem);
    input.value = 0;
    return;
  }

  alert("Não foi possível adicionar o produto.");
}

function adicionarProdutosPorCatalogo(catalogoBackEnd, listaDeProdutos) {
  listaDeProdutos.forEach(produto => {
    const info = catalogoBackEnd.find(item => item.ean === produto.ean);
    if (info) {
      adicionarProdutoCarrinho(info.nome, info.preco, produto.quantidade, info.imagem);
    } else {
      console.warn(`Produto com EAN ${produto.ean} não encontrado no catálogo do backend.`);
    }
  });
} */