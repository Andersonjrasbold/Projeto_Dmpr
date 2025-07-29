
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


function adicionarAoCarrinhoPorCNPJ(cnpj, item) {
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

  // Verifica se o produto já existe no carrinho
  const existente = carrinho.find(p => p.codBarra === item.codBarra);

  if (existente) {
    existente.quantidade += item.quantidade;
    existente.total = parseFloat((existente.quantidade * existente.preco).toFixed(2));
  } else {
    // Calcula o total do novo item
    item.total = parseFloat((item.quantidade * item.preco).toFixed(2));
    carrinho.push(item);
  }

  // Salva no mesmo carrinho, sem criar duplicatas
  localStorage.setItem(chave, JSON.stringify(carrinho));
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

// Atualiza a quantidade ao clicar nos botões + ou - dentro dos carrinhos por CNPJ
function alterarQuantidade(delta, botao) {
  const input = botao.parentElement.querySelector("input");
  let valor = parseInt(input.value) || 0;
  valor += delta;
  if (valor < 0) valor = 0;
  input.value = valor;

  // Atualiza o carrinho com base no DOM
  atualizarQuantidadeCarrinhoPorCNPJ(botao);
}

// Atualiza a quantidade ao digitar diretamente no campo
function atualizarQuantidadeDiretaInput(input) {
  const valor = parseInt(input.value);
  if (isNaN(valor) || valor < 0) return;
  atualizarQuantidadeCarrinhoPorCNPJ(input);
}

function atualizarQuantidadeCarrinhoPorCNPJ(elemento) {
  const tr = elemento.closest("tr");
  const tbody = tr.closest("tbody");
  const container = tr.closest(".carrinho-cnpj-container");
  const cnpj = container?.dataset?.cnpj;
  if (!cnpj) return;

  const carrinho = JSON.parse(localStorage.getItem(`carrinho_${cnpj}`) || "[]");
  const index = [...tbody.children].indexOf(tr);

  const inputQtd = tr.querySelector("input[name='quantidade']");
  const novaQtd = parseInt(inputQtd.value);
  if (isNaN(novaQtd) || novaQtd < 1) return;

  // Atualiza valores
  carrinho[index].quantidade = novaQtd;
  carrinho[index].total = parseFloat((novaQtd * carrinho[index].preco).toFixed(2));
  localStorage.setItem(`carrinho_${cnpj}`, JSON.stringify(carrinho));

  // ✅ Atualiza subtotal da linha
  const tdSubtotal = tr.querySelector("td:nth-child(5)");
  if (tdSubtotal) {
    tdSubtotal.textContent = formatarMoeda(carrinho[index].total);
  }

  // ✅ Atualiza total do carrinho individual
  const novaSoma = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const containerTotal = container.querySelector(".total-final");
  if (containerTotal) {
    containerTotal.textContent = formatarMoeda(novaSoma);
  }

  // ✅ Atualiza resumo geral no topo
  atualizarResumoGeralPedidos();
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
        codBarra: codBarra,
        preco: parseFloat(preco.replace(',', '.')),
        quantidade: qtd
      });
      algumAdicionado = true;
    }
  });

  if (algumAdicionado) {
    // ✅ Atualiza visual
    if (typeof atualizarCarrinhoVisualPorCNPJ === "function") {
      atualizarCarrinhoVisualPorCNPJ();
    }

    // ✅ Atualiza total no topo
    if (typeof atualizarResumoGeralPedidos === "function") {
      atualizarResumoGeralPedidos();
    }

    // ✅ Fecha modal
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }

    // ✅ Toast moderno
    exibirToast("Produtos adicionados ao(s) carrinho(s)!");
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



function atualizarQuantidadeDiretaPorCNPJ(cnpj, index, novaQtd) {
  const chave = `carrinho_${cnpj}`;
  let carrinho = JSON.parse(localStorage.getItem(chave) || "[]");

  const qtd = parseInt(novaQtd);
  if (!carrinho[index] || isNaN(qtd) || qtd < 1) return;

  carrinho[index].quantidade = qtd;
  carrinho[index].total = parseFloat((qtd * carrinho[index].preco).toFixed(2));
  localStorage.setItem(chave, JSON.stringify(carrinho));

  // Atualiza valor individual no DOM
  const totalCell = document.getElementById(`totalProduto-${index}`);
  if (totalCell) totalCell.textContent = formatarMoeda(carrinho[index].total);

  // Atualiza totais gerais
  atualizarCarrinho(); // opcional: você pode substituir isso por lógica que atualiza só o total geral
}



function alterarQuantidadeCarrinho(index, delta) {
  if (!carrinho[index]) return;
  carrinho[index].quantidade = Math.max(1, carrinho[index].quantidade + delta);
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
    const wrapper = document.createElement('div');
    wrapper.className = 'carrinho-cnpj-container';
    wrapper.dataset.cnpj = cnpj;

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
          <input type="number" name="quantidade" value="${item.quantidade}" min="1"
            class="form-control text-center" style="max-width: 70px;"
            onchange="atualizarQuantidadeDiretaPorCNPJ('${cnpj}', ${index}, this.value)">
          <button class="btn btn-outline-dark" type="button" onclick="alterarQuantidade(1, this)">+</button>
        </div>

        </td>
        <td>${formatarMoeda(subtotal)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removerItemPorCNPJ('${cnpj}', ${index})">Remover</button></td>
      `;
      tbody.appendChild(tr);
    });

    clone.querySelector('.total-final').textContent = formatarMoeda(total);

    const limparBtn = clone.querySelector('.limpar-btn');
    limparBtn.dataset.cnpj = cnpj;
    limparBtn.addEventListener('click', () => {
      if (confirm(`Deseja limpar o carrinho do CNPJ ${cnpj}?`)) {
        localStorage.removeItem(`carrinho_${cnpj}`);
        mostrarCarrinhosPorCNPJ();
      }
    });

    const prazoSelect = clone.querySelector('.prazo-individual');
    prazoSelect.dataset.cnpj = cnpj;
    const prazoSalvo = localStorage.getItem(`prazo_${cnpj}`);
    if (prazoSalvo) {
      prazoSelect.value = prazoSalvo;
    }
    prazoSelect.addEventListener('change', () => {
      localStorage.setItem(`prazo_${cnpj}`, prazoSelect.value);
    });

    wrapper.appendChild(clone);
    container.appendChild(wrapper);
  });

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


