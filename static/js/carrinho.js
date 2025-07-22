let carrinho = [];
let itensPorPagina = 12;
let paginaAtual = 1;

function getChaveCarrinho() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  return cnpj ? `carrinho_${cnpj}` : 'carrinho_padrao';
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('cart-badge');
  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  if (badge) {
    badge.textContent = totalItens;
    badge.style.display = totalItens > 0 ? 'inline-block' : 'none';
  }
}

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
  totalPaymentSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  salvarCarrinho();
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
    atualizarBadgeCarrinho();
  }
}



function alterarQuantidadeCarrinho(index, delta) {
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
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

function formatarMoeda(valor) {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function removerItemPorCNPJ(cnpj, index) {
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");
  carrinho.splice(index, 1);
  localStorage.setItem(chave, JSON.stringify(carrinho));
  mostrarCarrinhosPorCNPJ();
}

function renderizarCarrinhosPorCNPJ(carrinhosPorCNPJ) {
  const container = document.getElementById('carrinhos-container');
  const template = document.getElementById('template-carrinho-cnpj');
  container.innerHTML = '';

  Object.entries(carrinhosPorCNPJ).forEach(([cnpj, itens]) => {
    if (!Array.isArray(itens) || itens.length === 0) return;

    const clone = template.content.cloneNode(true);
    clone.querySelector('.cnpj-label').textContent = cnpj;

    const tbody = clone.querySelector('.cart-table-body');
    let total = 0;

    itens.forEach((item, index) => {
      const subtotal = item.preco * item.quantidade;
      total += subtotal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${item.imagem}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: cover;"></td>
        <td>${item.nome}</td>
        <td>${formatarMoeda(item.preco)}</td>
        <td>${item.quantidade}</td>
        <td>${formatarMoeda(subtotal)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removerItemPorCNPJ('${cnpj}', ${index})">Remover</button></td>
      `;
      tbody.appendChild(tr);
    });

    clone.querySelector('.total-final').textContent = formatarMoeda(total);

    // ✅ Botão de limpar carrinho individual
    const limparBtn = clone.querySelector('.limpar-btn');
    limparBtn.dataset.cnpj = cnpj;
    limparBtn.addEventListener('click', () => {
      if (confirm(`Deseja limpar o carrinho do CNPJ ${cnpj}?`)) {
        localStorage.removeItem(`carrinho_${cnpj}`);
        mostrarCarrinhosPorCNPJ();
      }
    });

    container.appendChild(clone);
  });
}


function mostrarCarrinhosPorCNPJ() {
  ['card-search-list', 'carouselExampleDark', 'photo-search-list', 'text-search-list', 'cart'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const carrinhosDiv = document.getElementById('carrinhos-container');
  if (carrinhosDiv) {
    carrinhosDiv.style.display = 'block';

    const carrinhosPorCNPJ = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('carrinho_')) {
        const cnpj = key.replace('carrinho_', '');
        const carrinho = JSON.parse(localStorage.getItem(key));
        carrinhosPorCNPJ[cnpj] = carrinho;
      }
    });

    renderizarCarrinhosPorCNPJ(carrinhosPorCNPJ);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  carregarCarrinho();
  atualizarCarrinho();
  atualizarBadgeCarrinho();

  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', function (e) {
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
          if (data.status === "ok" && data.pedidos) {
            const carrinhosPorCNPJ = {};

            Object.entries(data.pedidos).forEach(([cnpj, itens]) => {
              const chaveCarrinho = `carrinho_${cnpj}`;
              const carrinhoAtual = JSON.parse(localStorage.getItem(chaveCarrinho) || "[]");

              itens.forEach(produto => {
                const existente = carrinhoAtual.find(p => p.nome === produto.nome);
                if (existente) {
                  existente.quantidade += produto.quantidade;
                } else {
                  carrinhoAtual.push({ ...produto });
                }
              });

              localStorage.setItem(chaveCarrinho, JSON.stringify(carrinhoAtual));
              carrinhosPorCNPJ[cnpj] = carrinhoAtual;
            });

            renderizarCarrinhosPorCNPJ(carrinhosPorCNPJ);
            mostrarCarrinhosPorCNPJ();
            alert("Pedidos importados com sucesso para os CNPJs!");

            // ✅ FECHAMENTO TOTAL DO MODAL e LIMPEZA DO TRAVAMENTO
            const modalEl = document.getElementById('uploadModal');
            if (modalEl) {
              const instance = bootstrap.Modal.getInstance(modalEl);
              if (instance) instance.hide();
            }

            // ⚠️ Atraso para garantir que backdrop seja removido corretamente
            setTimeout(() => {
              document.body.classList.remove('modal-open');

              // Remove qualquer backdrop remanescente
              const backdrops = document.querySelectorAll('.modal-backdrop');
              backdrops.forEach(el => el.remove());

              // ⚠️ Também desbloqueia scroll se necessário
              document.body.style.overflow = '';
            }, 400);
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

