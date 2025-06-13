
// Estado do carrinho com persistência no localStorage
let carrinho = [];
let itensPorPagina = 12;
let paginaAtual = 1;

// Salvar carrinho no localStorage
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Carregar carrinho do localStorage
function carregarCarrinho() {
  const dados = localStorage.getItem("carrinho");
  try {
    carrinho = dados ? JSON.parse(dados) : [];
    if (!Array.isArray(carrinho)) carrinho = [];
  } catch (e) {
    console.error("Erro ao carregar carrinho:", e);
    carrinho = [];
  }
}

// Mostrar/Ocultar carrinho
function toggleCarrinho() {
  const carrinhoContainer = document.getElementById("cart");
  const botao = document.getElementById("btn-carrinho");
  const visivel = carrinhoContainer.style.display === "block";
  carrinhoContainer.style.display = visivel ? "none" : "block";
  if (botao) botao.textContent = visivel ? "Ver Carrinho" : "Ocultar Carrinho";
}

// Atualizar carrinho na tela
function atualizarCarrinho() {
  const tbody = document.getElementById("cart-table-body");
  const totalSpan = document.getElementById("cart-total");

  if (!tbody || !totalSpan) return;

  tbody.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    const precoTotal = item.preco * item.quantidade;
    total += precoTotal;

    tbody.innerHTML += `
      <tr>
        <td><img src="${item.imagem}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: cover;"></td>
        <td>${item.nome}</td>
        <td>R$ ${item.preco.toFixed(2).replace(".", ",")}</td>
        <td>
          <div class="d-flex justify-content-center align-items-center">
            <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, -1)">-</button>
            <input type="number" min="1" value="${item.quantidade}" class="form-control mx-2 text-center" style="width: 60px;" onchange="atualizarQuantidadeDireta(${index}, this.value)">
            <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, 1)">+</button>
          </div>
        </td>
        <td>R$ ${precoTotal.toFixed(2).replace(".", ",")}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removerItem(${index})">Remover</button></td>
      </tr>`;
  });

  totalSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  salvarCarrinho();
}

// Adicionar produto ao carrinho
function adicionarAoCarrinho(botao) {
  if (!Array.isArray(carrinho)) carrinho = [];

  const card = botao.closest(".card");
  if (!card) return;

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

  const existente = carrinho.find(item => item.nome === nome);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({ nome, preco, quantidade, imagem });
  }

  atualizarCarrinho();
  if (input) input.value = 0;
}

// Alterar quantidade com botão +/-
function alterarQuantidadeCarrinho(index, delta) {
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }
  atualizarCarrinho();
}

// Alterar quantidade digitando
function atualizarQuantidadeDireta(index, valor) {
  const novaQtd = parseInt(valor);
  if (novaQtd > 0) {
    carrinho[index].quantidade = novaQtd;
  } else {
    carrinho.splice(index, 1);
  }
  atualizarCarrinho();
}

// Remover item
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// Limpar carrinho
function limparCarrinho() {
  if (confirm("Deseja limpar o carrinho?")) {
    carrinho = [];
    atualizarCarrinho();
  }
}

// Carregar carrinho ao abrir a página
window.addEventListener("DOMContentLoaded", () => {
  carregarCarrinho();
  atualizarCarrinho();
});


