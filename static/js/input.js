// Estado do carrinho
const carrinho = [];
let itensPorPagina = 10;
let paginaAtual = 1;

function toggleCarrinho() {
  const carrinho = document.getElementById("carrinho-container");
  const botao = document.getElementById("btn-carrinho");
  const visivel = carrinho.style.display === "block";
  carrinho.style.display = visivel ? "none" : "block";
  botao.textContent = visivel ? "Ver Carrinho" : "Ocultar Carrinho";
}

function atualizarCarrinho() {
  const tbody = document.getElementById("cart-table-body");
  const totalSpans = document.querySelectorAll(".cart-total");
  tbody.innerHTML = "";

  let total = 0;
  carrinho.forEach((item, index) => {
    const precoTotal = item.preco * item.quantidade;
    total += precoTotal;

    tbody.innerHTML += `
      <tr>
        <td><img src="${item.imagem}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: cover;"></td>
        <td>${item.nome}</td>
        <td>R$ ${item.preco.toFixed(2)}</td>
        <td>
          <div class="d-flex justify-content-center align-items-center">
            <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, -1)">-</button>
            <input type="number" min="1" value="${item.quantidade}" class="form-control mx-2 text-center" style="width: 60px;" onchange="atualizarQuantidadeDireta(${index}, this.value)">
            <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, 1)">+</button>
          </div>
        </td>
        <td>R$ ${precoTotal.toFixed(2)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removerItem(${index})">Remover</button></td>
      </tr>`;
  });

  totalSpans.forEach(span => {
    span.textContent = `R$ ${total.toFixed(2)}`;
  });
}

function adicionarAoCarrinho(botao) {
  const card = botao.closest(".card");
  const nome = card.querySelector(".card-title").innerText;
  const imagem = card.querySelector("img").getAttribute("src");
  const precoTexto = card.querySelector(".text-dark").innerText.replace("Final R$ ", "").replace(",", ".");
  const preco = parseFloat(precoTexto);
  const input = card.querySelector("input[name='quantidade']");
  const quantidade = parseInt(input.value);

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
  input.value = 0;
}

function alterarQuantidadeCarrinho(index, delta) {
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }
  atualizarCarrinho();
}

function atualizarQuantidadeDireta(index, valor) {
  const novaQtd = parseInt(valor);
  if (novaQtd > 0) {
    carrinho[index].quantidade = novaQtd;
  } else {
    carrinho.splice(index, 1);
  }
  atualizarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

function limparCarrinho() {
  if (confirm("Deseja limpar o carrinho?")) {
    carrinho.length = 0;
    atualizarCarrinho();
  }
}

function substituirMultiplos(idsOcultar = [], idMostrar) {
  idsOcultar.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const mostrar = document.getElementById(idMostrar);
  if (mostrar) {
    mostrar.style.display = 'block';
    paginaAtual = 1;
    paginarProdutos(idMostrar);
  }
}

function paginarProdutos(containerId = "cardProduct") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const produtos = container.querySelectorAll('.product');
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);

  produtos.forEach((produto, index) => {
    let wrapper = produto.closest('.col');
    if (!wrapper && produto.classList.contains('list-group-item')) {
      wrapper = produto;
    }
    if (wrapper) wrapper.style.display = 'none';

    if (index >= (paginaAtual - 1) * itensPorPagina && index < paginaAtual * itensPorPagina) {
      if (wrapper) wrapper.style.display = 'block';
    }
  });

  atualizarPaginacao(totalPaginas);
  document.getElementById('page').style.display = totalPaginas > 1 ? 'flex' : 'none';
}

function atualizarPaginacao(totalPaginas) {
  const paginacao = document.getElementById('pagination');
  if (!paginacao) return;
  paginacao.innerHTML = '';

  paginacao.innerHTML += `
    <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual - 1})">&laquo;</a>
    </li>`;

  for (let i = 1; i <= totalPaginas; i++) {
    paginacao.innerHTML += `
      <li class="page-item ${paginaAtual === i ? 'active' : ''}">
        <a class="page-link" href="#" onclick="mudarPagina(${i})">${i}</a>
      </li>`;
  }

  paginacao.innerHTML += `
    <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual + 1})">&raquo;</a>
    </li>`;
}

function mudarPagina(pagina) {
  if (pagina < 1) return;
  paginaAtual = pagina;
  paginarProdutos();
}

window.onload = () => {
  paginarProdutos();
};

const search = () => {
  const searchbox = document.getElementById("search-item").value.toUpperCase().trim();
  const products = document.querySelectorAll("#search-list .product");
  const carouselContainer = document.getElementById("carouselExampleDark");
  const noResultsMessage = document.getElementById("no-results");

  let anyVisible = false;

  products.forEach(product => {
    const texts = [];

    const h5 = product.querySelector("h5");
    if (h5) texts.push(h5.textContent);

    const paragraphs = product.querySelectorAll("p");
    paragraphs.forEach(p => texts.push(p.textContent));

    const textValue = texts.join(" ").toUpperCase();

    const wrapper = product.closest('.col') || product;
    if (textValue.includes(searchbox)) {
      wrapper.style.display = "block";
      anyVisible = true;
    } else {
      wrapper.style.display = "none";
    }
  });

  if (carouselContainer) {
    carouselContainer.style.display = anyVisible ? "none" : "";
  }

  if (noResultsMessage) {
    noResultsMessage.style.display = anyVisible ? "none" : "block";
  }
};
