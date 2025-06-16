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
            <input type="" min="1" value="${item.quantidade}" class="form-control mx-2 text-center" style="width: 60px;" onchange="atualizarQuantidadeDireta(${index}, this.value)">
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

function adicionarProdutoCarrinho(nome, preco, quantidade, imagem) {
  const existente = carrinho.find(item => item.nome === nome);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({ nome, preco, quantidade, imagem });
  }
  atualizarCarrinho();
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
    carrinho = [];
    atualizarCarrinho();
  }
}

// ✅ Adicionar produtos de cards OU de tabelas
function adicionarAoCarrinho(botao) {
  // Se veio de um card
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

  // Se veio de uma tabela (linha <tr>)
  const row = botao.closest("tr");
  if (row) {
    const nome = row.querySelector(".nome-produto")?.innerText;
    const precoTexto = row.querySelector(".preco-produto")?.innerText.replace("R$ ", "").replace(",", ".");
    const preco = parseFloat(precoTexto);
    const imagem = row.querySelector("img")?.getAttribute("src") || "/static/fotos/sem-imagem.jpg";
    const input = row.querySelector("input[name='quantidade']");
    const quantidade = parseInt(input?.value);

    if (!quantidade || quantidade <= 0 || isNaN(preco) || !nome) {
      alert("Escolha uma quantidade e preço válidos.");
      return;
    }

    adicionarProdutoCarrinho(nome, preco, quantidade, imagem);
    input.value = 0;
    return;
  }

  alert("Não foi possível adicionar o produto.");
}

// ✅ Adicionar produtos recebidos do backend via Excel
function adicionarProdutosPorCatalogo(catalogoBackEnd, listaDeProdutos) {
  listaDeProdutos.forEach(produto => {
    const info = catalogoBackEnd.find(item => item.ean === produto.ean);
    if (info) {
      adicionarProdutoCarrinho(info.nome, info.preco, produto.quantidade, info.imagem);
    } else {
      console.warn(`Produto com EAN ${produto.ean} não encontrado no catálogo do backend.`);
    }
  });
}

// ✅ Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", function() {
  carregarCarrinho();
  atualizarCarrinho();

  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const fileInput = document.getElementById('fileUpload');
      const file = fileInput.files[0];

      if (!file) {
        alert("Selecione um arquivo Excel para importar.");
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      fetch('/importar-produtos', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === "ok" && Array.isArray(data.catalogo) && Array.isArray(data.lista_de_produtos)) {
          adicionarProdutosPorCatalogo(data.catalogo, data.lista_de_produtos);
          alert("Produtos importados com sucesso!");
          const uploadModal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
          uploadModal.hide();
        } else {
          alert("Erro ao importar: " + (data.mensagem || "Erro desconhecido."));
        }
      })
      .catch(error => {
        console.error("Erro:", error);
        alert("Falha na importação.");
      });
    });
  }
});
