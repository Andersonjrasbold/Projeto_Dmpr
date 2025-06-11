
function toggleCarrinho() {
  const carrinho = document.getElementById("carrinho-container");
  const botao = document.getElementById("btn-carrinho");
  if (carrinho.style.display === "none") {
    carrinho.style.display = "block";
    botao.textContent = "Ocultar Carrinho";
  } else {
    carrinho.style.display = "none";
    botao.textContent = "Ver Carrinho";
  }
}


const carrinho = [];

function atualizarCarrinho() {
  const tbody = document.getElementById("cart-table-body");
  const totalSpans = document.querySelectorAll(".cart-total");
  tbody.innerHTML = "";

  let total = 0;
  carrinho.forEach((item, index) => {
    const row = document.createElement("tr");

    const precoTotal = item.preco * item.quantidade;
    total += precoTotal;

    row.innerHTML = `
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
      `;

    tbody.appendChild(row);
  });

  totalSpans.forEach(span => {
    span.textContent = `R$ ${total.toFixed(2)}`;
  });
}

function adicionarAoCarrinho(botao) {
  const card = botao.closest(".card");
  const nome = card.querySelector(".card-title").innerText;
  const imagem = card.querySelector("img").getAttribute("src");
  const preco = 99.9; // Pode ajustar para valor dinâmico futuramente
  const input = card.querySelector("input[name='quantidade']");
  const quantidade = parseInt(input.value);

  if (quantidade <= 0) {
    alert("Escolha uma quantidade válida.");
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

function substituirMultiplos(ocultarIds, mostrarId) {
  ocultarIds.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.style.display = 'none';
    }
  });

  const mostrar = document.getElementById(mostrarId);
  if (mostrar) {
    mostrar.style.display = 'block';
  }
}


