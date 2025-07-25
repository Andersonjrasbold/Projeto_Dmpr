
document.addEventListener("DOMContentLoaded", function () {
  carregarCarrinho();
  atualizarCarrinho();
  atualizarBadgeCarrinho();
  atualizarResumoGeralPedidos(); // <- adiciona esta linha


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

            // Fechar modal
            const modalEl = document.getElementById('uploadModal');
            if (modalEl) {
              const instance = bootstrap.Modal.getInstance(modalEl);
              if (instance) instance.hide();
            }

            // Limpar travamento de tela
            setTimeout(() => {
              document.body.classList.remove('modal-open');
              document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
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

  // ✅ EVENTO PRAZO GLOBAL
  const selectPrazoGlobal = document.getElementById("prazo-global");

  if (selectPrazoGlobal) {
    selectPrazoGlobal.addEventListener("change", () => {
      const novoPrazo = selectPrazoGlobal.value;

      document.querySelectorAll('.prazo-individual').forEach(select => {
        const cnpj = select.dataset.cnpj;
        select.value = novoPrazo;
        localStorage.setItem(`prazo_${cnpj}`, novoPrazo);
      });

      alert("Prazo global aplicado com sucesso.");
    });
  }
});
///---------------------------------------
let produtoSelecionado = null;


function adicionarAoCarrinhoPorCNPJ(cnpj, produto) {
  const chave = `carrinho_${cnpj}`;
  const carrinhoAtual = JSON.parse(localStorage.getItem(chave) || "[]");

  const existente = carrinhoAtual.find(p => p.codbarra === produto.codbarra);
  if (existente) {
    existente.quantidade += produto.quantidade;
  } else {
    carrinhoAtual.push(produto);
  }

  localStorage.setItem(chave, JSON.stringify(carrinhoAtual));
}

function abrirModalLojasDoGrupo(botao) {
  const modal = new bootstrap.Modal(document.getElementById('modalSelecionarLoja'));
  const tabela = document.getElementById('tabela-lojas-grupo');
  tabela.innerHTML = '';

  let nomeProduto = '';
  let codBarra = '';
  let precoFinal = '';
  let imagem = '';

  const card = botao.closest('.card');
  const linhaTabela = botao.closest('tr');

  if (card) {
    nomeProduto = card.querySelector('.card-title')?.textContent.trim() || '';
    codBarra = card.querySelector('.text-body-secondary.mb-0')?.textContent.trim() || '';
    precoFinal = card.querySelector('.fs-6.mb-0')?.textContent.replace('Final R$ ', '').trim() || '';
    imagem = card.querySelector("img")?.src || '';
  } else if (linhaTabela) {
    nomeProduto = linhaTabela.querySelector('.nome-produto')?.textContent.trim() || '';
    codBarra = linhaTabela.children[2]?.textContent.trim() || '';
    precoFinal = linhaTabela.querySelector('.preco-produto')?.textContent.replace('R$', '').trim() || '';
    imagem = linhaTabela.querySelector("img")?.src || '';
  }

  if (!lojasDoGrupo || lojasDoGrupo.length === 0) {
    alert("Nenhuma loja do grupo encontrada.");
    return;
  }

  produtoSelecionado = {
    nome: nomeProduto,
    codbarra: codBarra,
    preco: parseFloat(precoFinal.replace(",", ".")),
    imagem: imagem
  };

  lojasDoGrupo.forEach(loja => {
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${loja.NOME_CLIENTE}</td>
      <td>${loja.CGC_CLIENTE}</td>
      <td>
        <div class="d-flex align-items-center justify-content-center gap-1">
          <button type="button" class="btn btn-sm btn-outline-dark px-2" onclick="alterarQuantidade(-1, this)">−</button>
          <input type="number" class="form-control form-control-sm text-center border-0 quantidade-loja" value="0" min="0" style="width: 60px;">
          <button type="button" class="btn btn-sm btn-outline-dark px-2" onclick="alterarQuantidade(1, this)">+</button>
        </div>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="adicionarParaLoja('${loja.CGC_CLIENTE}', this)">Adicionar</button>
      </td>
    `;
    tabela.appendChild(linha);
  });

  modal.show();
}

function adicionarParaLoja(cnpj, botao) {
  if (!produtoSelecionado || !produtoSelecionado.nome) {
    alert("Nenhum produto selecionado.");
    return;
  }

  const linha = botao.closest('tr');
  const input = linha?.querySelector('.quantidade-loja');
  const quantidade = parseInt(input?.value);

  if (!quantidade || quantidade <= 0) {
    alert("Informe uma quantidade válida.");
    return;
  }

  const item = { ...produtoSelecionado, quantidade };
  adicionarAoCarrinhoPorCNPJ(cnpj, item);
  input.value = 0;

  alert(`Produto adicionado ao carrinho de: ${cnpj}`);
  if (typeof atualizarCarrinhoVisualPorCNPJ === "function") {
    atualizarCarrinhoVisualPorCNPJ();
  }
}

function alterarQuantidade(delta, botao) {
  const input = botao.parentElement.querySelector("input");
  let valor = parseInt(input.value) || 0;
  valor += delta;
  if (valor < 0) valor = 0;
  input.value = valor;
}


function adicionarProdutoParaTodasLojas(nomeProduto, codBarra, preco, modalId) {
  const linhas = document.querySelectorAll("#tabela-lojas-grupo tr");
  let algumAdicionado = false;

  linhas.forEach(linha => {
    const cnpj = linha.children[1].textContent.trim();
    const input = linha.querySelector("input");
    const qtd = parseInt(input.value);

    if (qtd > 0) {
      adicionarAoCarrinhoPorCNPJ(cnpj, {
        nome: nomeProduto,
        codbarra: codBarra,
        preco: parseFloat(preco.replace(',', '.')),
        quantidade: qtd
      });
      algumAdicionado = true;
    }
  });

  if (algumAdicionado) {
    if (typeof atualizarCarrinhoVisualPorCNPJ === "function") {
      atualizarCarrinhoVisualPorCNPJ();
    }

    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }

    alert("Produtos adicionados ao(s) carrinho(s) com sucesso!");
  } else {
    alert("Informe ao menos uma quantidade válida.");
  }
}

// carrinho.js - V2 UNIFICADO E ROBUSTO



function getCNPJLogado() {
  return sessionStorage.getItem('cliente_cnpj') || null;
}

function getChaveCarrinho(cnpj = null) {
  const id = cnpj || getCNPJLogado();
  return id ? `carrinho_${id}` : 'carrinho_padrao';
}

function formatarMoeda(valor) {
  const num = parseFloat(valor);
  if (isNaN(num)) return 'R$ 0,00';
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
}

function salvarCarrinho(cnpj = null) {
  const chave = getChaveCarrinho(cnpj);
  localStorage.setItem(chave, JSON.stringify(carrinho));
  
}

function carregarCarrinho(cnpj = null) {
  const chave = getChaveCarrinho(cnpj);
  try {
    carrinho = JSON.parse(localStorage.getItem(chave)) || [];
    if (!Array.isArray(carrinho)) carrinho = [];
  } catch {
    carrinho = [];
  }
  
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById('cart-badge');
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  if (badge) {
    badge.textContent = totalItens;
    badge.style.display = totalItens > 0 ? 'inline-block' : 'none';
  }
}

function adicionarProdutoCarrinho(nome, preco, quantidade, imagem, cnpj = null) {
  const chave = getChaveCarrinho(cnpj);
  let carrinhoAtual = JSON.parse(localStorage.getItem(chave) || '[]');

  const existente = carrinhoAtual.find(p => p.nome === nome);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinhoAtual.push({ nome, preco, quantidade, imagem });
  }

  localStorage.setItem(chave, JSON.stringify(carrinhoAtual));

  if (cnpj === null || chave === getChaveCarrinho()) {
    carrinho = carrinhoAtual;
    atualizarCarrinho();
    
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

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${item.imagem}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>${item.nome}</td>
      <td>${formatarMoeda(item.preco)}</td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, -1)">−</button>
          <input type="number" min="1" value="${item.quantidade}" class="form-control mx-2 text-center" style="width: 60px;" onchange="atualizarQuantidadeDireta(${index}, this.value)">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, 1)">+</button>
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

function alterarQuantidadeCarrinho(index, delta) {
  if (!carrinho[index]) return;
  carrinho[index].quantidade = Math.max(1, carrinho[index].quantidade + delta);
  atualizarCarrinho();
}

function atualizarQuantidadeDireta(index, valor) {
  const novaQtd = parseInt(valor);
  if (isNaN(novaQtd) || novaQtd < 1) return;
  carrinho[index].quantidade = novaQtd;
  atualizarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarCarrinho();
}

function limparCarrinho() {
  const chave = getChaveCarrinho();
  localStorage.removeItem(chave);
  carrinho = [];
  atualizarCarrinho();
  
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
        <td>
        <div class="input-group input-group-sm justify-content-center" style="max-width: 160px; margin: auto;">
          <button class="btn btn-outline-dark" type="button" onclick="alterarQuantidade(-1, this)">−</button>
          <input type="number" name="quantidade" value="${item.quantidade}" min="0"
                class="form-control text-center" style="max-width: 70px;">
          <button class="btn btn-outline-dark" type="button" onclick="alterarQuantidade(1, this)">+</button>
        </div>

        </td>
        <td>${formatarMoeda(subtotal)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removerItemPorCNPJ('${cnpj}', ${index})">Remover</button></td>
      `;
      tbody.appendChild(tr);
    });

    clone.querySelector('.total-final').textContent = formatarMoeda(total);

    // ✅ Botão de limpar
    const limparBtn = clone.querySelector('.limpar-btn');
    limparBtn.dataset.cnpj = cnpj;
    limparBtn.addEventListener('click', () => {
      if (confirm(`Deseja limpar o carrinho do CNPJ ${cnpj}?`)) {
        localStorage.removeItem(`carrinho_${cnpj}`);
        mostrarCarrinhosPorCNPJ();
      }
    });

    // ✅ Select de prazo
    const prazoSelect = clone.querySelector('.prazo-individual');
    prazoSelect.dataset.cnpj = cnpj;

    // Carrega o prazo salvo, se existir
    const prazoSalvo = localStorage.getItem(`prazo_${cnpj}`);
    if (prazoSalvo) {
      prazoSelect.value = prazoSalvo;
    }

    // Salva alterações ao mudar
    prazoSelect.addEventListener('change', () => {
      localStorage.setItem(`prazo_${cnpj}`, prazoSelect.value);
    });

    container.appendChild(clone);
  });

  // ✅ Atualiza card resumo geral depois de renderizar tudo
  atualizarResumoGeralPedidos();
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

