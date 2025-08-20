/* ============================
   carrinho.js - V2 UNIFICADO
   ============================ */

let carrinho = [];
let produtoSelecionado = null;

/* --------------------------------
   Utilidades de CNPJ e chaves
----------------------------------*/
function getCNPJLogado() {
  return sessionStorage.getItem('cliente_cnpj') || null;
}

function getChaveCarrinho(cnpj = null) {
  const id = cnpj || getCNPJLogado();
  return id ? `carrinho_${id}` : 'carrinho_padrao';
}

/* --------------------------------
   Formatação de moeda (pt-BR)
----------------------------------*/
function formatarMoeda(valor) {
  const num = Number(valor) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* --------------------------------
   Persistência base do carrinho
----------------------------------*/
function salvarCarrinho(cnpj = null) {
  const chave = getChaveCarrinho(cnpj);
  localStorage.setItem(chave, JSON.stringify(carrinho));
}

function carregarCarrinho(cnpj = null) {
  const chave = getChaveCarrinho(cnpj);
  try {
    carrinho = JSON.parse(localStorage.getItem(chave) || '[]');
    if (!Array.isArray(carrinho)) carrinho = [];
  } catch {
    carrinho = [];
  }
}

/* --------------------------------
   Badge do carrinho (ícone)
----------------------------------*/
function atualizarBadgeCarrinho() {
  const badge = document.getElementById('cart-badge');
  const totalItens = carrinho.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0);
  if (badge) {
    badge.textContent = totalItens;
    badge.style.display = totalItens > 0 ? 'inline-block' : 'none';
  }
}

/* --------------------------------
   Toast simples (fallback)
----------------------------------*/
function exibirToast(msg) {
  // se houver um sistema de toast, plugar aqui
  // fallback:
  console.log('[TOAST]', msg);
}

/* ----------------------------------------------------
   Hooks opcionais (no-ops, evitam erros se não existirem)
------------------------------------------------------*/
function atualizarResumoGeralPedidos() { /* no-op se não existir na página */ }
function atualizarCarrinhoVisualPorCNPJ() { /* no-op se não existir na página */ }

/* --------------------------------
   Adicionar produtos
----------------------------------*/
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

  // se for o carrinho ativo no contexto, sincroniza memória + UI
  if (cnpj === null || chave === getChaveCarrinho()) {
    carrinho = carrinhoAtual;
    atualizarCarrinho({ navegar: false });
  }
}

/* --------------------------------
   Carrinho por CNPJ (CRUD item)
----------------------------------*/
function adicionarAoCarrinhoPorCNPJ(cnpj, item) {
  const chave = `carrinho_${cnpj}`;
  const carrinhoLocal = JSON.parse(localStorage.getItem(chave) || '[]');

  const existente = carrinhoLocal.find(p => p.codBarra === item.codBarra);
  if (existente) {
    existente.quantidade += item.quantidade;
    existente.total = Number((existente.quantidade * existente.preco).toFixed(2));
  } else {
    item.total = Number((item.quantidade * item.preco).toFixed(2));
    carrinhoLocal.push(item);
  }

  localStorage.setItem(chave, JSON.stringify(carrinhoLocal));
}

function removerItemPorCNPJ(cnpj, index) {
  const chave = `carrinho_${cnpj}`;
  const lista = JSON.parse(localStorage.getItem(chave) || '[]');
  if (index >= 0 && index < lista.length) {
    lista.splice(index, 1);
    localStorage.setItem(chave, JSON.stringify(lista));
  }
  mostrarCarrinhosPorCNPJ({ navegar: false });
}

function atualizarQuantidadeDiretaPorCNPJ(cnpj, index, novaQtd) {
  const chave = `carrinho_${cnpj}`;
  const lista = JSON.parse(localStorage.getItem(chave) || '[]');

  const qtd = parseInt(novaQtd, 10);
  if (!lista[index] || isNaN(qtd) || qtd < 1) return;

  lista[index].quantidade = qtd;
  lista[index].total = Number((qtd * (Number(lista[index].preco) || 0)).toFixed(2));
  localStorage.setItem(chave, JSON.stringify(lista));

  // Atualiza célula do DOM (se existir id padronizado)
  const totalCell = document.getElementById(`totalProduto-${index}`);
  if (totalCell) totalCell.textContent = formatarMoeda(lista[index].total);

  // Recalcular visão
  mostrarCarrinhosPorCNPJ({ navegar: false });
}

/* --------------------------------
   Carrinho “padrão” (sem CNPJ)
----------------------------------*/
function alterarQuantidadeCarrinho(index, delta) {
  if (!carrinho[index]) return;
  carrinho[index].quantidade = Math.max(1, (Number(carrinho[index].quantidade) || 1) + delta);
  salvarCarrinho();
  atualizarCarrinho({ navegar: false });
}

function removerItem(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarCarrinho({ navegar: false });
}

function limparCarrinho() {
  const chave = getChaveCarrinho();
  localStorage.removeItem(chave);
  carrinho = [];
  atualizarCarrinho({ navegar: false });
}

/* --------------------------------
   Handlers de UI por linha (multi)
----------------------------------*/
function alterarQuantidade(delta, botao) {
  const input = botao.parentElement.querySelector('input');
  let valor = parseInt(input.value, 10) || 0;
  valor += delta;
  if (valor < 1) valor = 1;
  input.value = valor;

  // Ajusta via DOM (por CNPJ)
  atualizarQuantidadeCarrinhoPorCNPJ(botao);
}

function atualizarQuantidadeDiretaInput(input) {
  const valor = parseInt(input.value, 10);
  if (isNaN(valor) || valor < 1) return;
  atualizarQuantidadeCarrinhoPorCNPJ(input);
}

function atualizarQuantidadeCarrinhoPorCNPJ(elemento) {
  const tr = elemento.closest('tr');
  const tbody = tr.closest('tbody');
  const container = tr.closest('.carrinho-cnpj-container');
  const cnpj = container?.dataset?.cnpj;
  if (!cnpj) return;

  const lista = JSON.parse(localStorage.getItem(`carrinho_${cnpj}`) || '[]');
  const index = [...tbody.children].indexOf(tr);

  const inputQtd = tr.querySelector("input[name='quantidade']");
  const novaQtd = parseInt(inputQtd.value, 10);
  if (isNaN(novaQtd) || novaQtd < 1 || !lista[index]) return;

  lista[index].quantidade = novaQtd;
  lista[index].total = Number((novaQtd * (Number(lista[index].preco) || 0)).toFixed(2));
  localStorage.setItem(`carrinho_${cnpj}`, JSON.stringify(lista));

  // Subtotal da linha
  const tdSubtotal = tr.querySelector('td:nth-child(5)');
  if (tdSubtotal) tdSubtotal.textContent = formatarMoeda(lista[index].total);

  // Total do carrinho individual
  const novaSoma = lista.reduce((acc, item) => acc + (Number(item.preco) || 0) * (Number(item.quantidade) || 0), 0);
  const containerTotal = container.querySelector('.total-final');
  if (containerTotal) containerTotal.textContent = formatarMoeda(novaSoma);

  atualizarResumoGeralPedidos();
}

/* --------------------------------
   Renderização MULTI por CNPJ
----------------------------------*/
function renderizarCarrinhosPorCNPJ(carrinhosPorCNPJ) {
  const container = document.getElementById('carrinhos-container');
  const template = document.getElementById('template-carrinho-cnpj');
  if (!container || !template) {
    console.warn('Template multi não encontrado nesta página.');
    return;
  }

  container.innerHTML = '';

  Object.entries(carrinhosPorCNPJ).forEach(([cnpj, itens]) => {
    if (!Array.isArray(itens) || itens.length === 0) return;

    const clone = template.content.cloneNode(true);
    const wrapper = document.createElement('div');
    wrapper.className = 'carrinho-cnpj-container';
    wrapper.dataset.cnpj = cnpj;

    const cnpjLabel = clone.querySelector('.cnpj-label');
    if (cnpjLabel) cnpjLabel.textContent = cnpj;

    const tbody = clone.querySelector('.cart-table-body');
    let total = 0;

    itens.forEach((item, index) => {
      const preco = Number(item.preco) || 0;
      const qtd = Number(item.quantidade) || 0;
      const subtotal = preco * qtd;
      total += subtotal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${item.imagem || ''}" alt="${item.nome || ''}" style="width:50px;height:50px;object-fit:cover;"></td>
        <td>${item.nome || ''}</td>
        <td>${formatarMoeda(preco)}</td>
        <td>
          <div class="input-group input-group-sm justify-content-center" style="max-width:160px;margin:auto;">
            <button class="btn btn-outline-dark" type="button" onclick="alterarQuantidade(-1, this)">−</button>
            <input type="number" name="quantidade" value="${qtd}" min="1"
              class="form-control text-center" style="max-width:70px;"
              onchange="atualizarQuantidadeDiretaPorCNPJ('${cnpj}', ${index}, this.value)">
            <button class="btn btn-outline-dark" type="button" onclick="alterarQuantidade(1, this)">+</button>
          </div>
        </td>
        <td>${formatarMoeda(subtotal)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removerItemPorCNPJ('${cnpj}', ${index})">Remover</button></td>
      `;
      tbody.appendChild(tr);
    });

    const totalFinal = clone.querySelector('.total-final');
    if (totalFinal) totalFinal.textContent = formatarMoeda(total);

    const limparBtn = clone.querySelector('.limpar-btn');
    if (limparBtn) {
      limparBtn.dataset.cnpj = cnpj;
      limparBtn.addEventListener('click', () => {
        if (confirm(`Deseja limpar o carrinho do CNPJ ${cnpj}?`)) {
          localStorage.removeItem(`carrinho_${cnpj}`);
          mostrarCarrinhosPorCNPJ({ navegar: false });
        }
      });
    }

    const prazoSelect = clone.querySelector('.prazo-individual');
    if (prazoSelect) {
      prazoSelect.dataset.cnpj = cnpj;
      const prazoSalvo = localStorage.getItem(`prazo_${cnpj}`);
      if (prazoSalvo) prazoSelect.value = prazoSalvo;
      prazoSelect.addEventListener('change', () => {
        localStorage.setItem(`prazo_${cnpj}`, prazoSelect.value);
      });
    }

    wrapper.appendChild(clone);
    container.appendChild(wrapper);
  });

  atualizarResumoGeralPedidos();
}

/* --------------------------------
   Mostrar carrinhos por CNPJ
   (navegação só se navegar=true)
----------------------------------*/
function mostrarCarrinhosPorCNPJ(arg) {
  const opts = typeof arg === 'object' && arg !== null ? arg : {};
  const navegar = !!opts.navegar;

  const template = document.getElementById('template-carrinho-cnpj');
  const carrinhosDiv = document.getElementById('carrinhos-container');
  if (!template || !carrinhosDiv) return;

  const outrosIds = ['card-search-list','carouselExampleDark','photo-search-list','text-search-list','cart'];

  if (navegar) {
    outrosIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    carrinhosDiv.style.display = 'block';
  }

  const carrinhosPorCNPJ = {};
  const prefix = 'carrinho_';
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(prefix)) {
      const cnpj = key.slice(prefix.length);
      const arr  = JSON.parse(localStorage.getItem(key) || '[]');
      carrinhosPorCNPJ[cnpj] = Array.isArray(arr) ? arr : [];
    }
  });

  renderizarCarrinhosPorCNPJ(carrinhosPorCNPJ);
}

/* --------------------------------
   Substituir múltiplos blocos
----------------------------------*/
function substituirMultiplos(listaParaOcultar, idParaMostrar) {
  const carousel = document.getElementById('carouselExampleDark');
  if (carousel) carousel.style.display = 'none';

  listaParaOcultar.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.style.display = 'none';
  });

  const destino = document.getElementById(idParaMostrar);
  if (destino) {
    if (idParaMostrar.includes('list') || idParaMostrar === 'template-carrinho-cnpj') {
      destino.style.display = 'block';
    } else {
      destino.style.display = 'flex';
    }
  }
}

/* --------------------------------
   Adição para lojas (modal de grupo)
----------------------------------*/
function adicionarParaLoja(cnpj, botao) {
  if (!produtoSelecionado || !produtoSelecionado.nome) {
    alert('Nenhum produto selecionado.');
    return;
  }

  const linha = botao.closest('tr');
  const input = linha?.querySelector('.quantidade-loja');
  const quantidade = parseInt(input?.value, 10);

  if (!quantidade || quantidade <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }

  const item = { ...produtoSelecionado, quantidade };
  adicionarAoCarrinhoPorCNPJ(cnpj, item);
  if (input) input.value = 0;

  alert(`Produto adicionado ao carrinho de: ${cnpj}`);
  atualizarCarrinhoVisualPorCNPJ();
}

function adicionarProdutoParaTodasLojas(nomeProduto, codBarra, preco, modalId) {
  const linhas = document.querySelectorAll('#tabela-lojas-grupo tr');
  let algumAdicionado = false;

  linhas.forEach(linha => {
    const cnpj = (linha.children[1]?.textContent || '').trim();
    const input = linha.querySelector('input');
    const qtd = parseInt(input?.value, 10);

    if (qtd > 0) {
      adicionarAoCarrinhoPorCNPJ(cnpj, {
        nome: nomeProduto,
        codBarra: codBarra,
        preco: Number(String(preco).replace(',', '.')) || 0,
        quantidade: qtd
      });
      algumAdicionado = true;
    }
  });

  if (algumAdicionado) {
    atualizarCarrinhoVisualPorCNPJ();
    atualizarResumoGeralPedidos();

    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }

    exibirToast('Produtos adicionados ao(s) carrinho(s)!');
  } else {
    alert('Informe ao menos uma quantidade válida.');
  }
}

/* --------------------------------
   Atualização de carrinho (genérico)
   - NÃO navega por padrão
----------------------------------*/
window.atualizarCarrinho = function (opts = {}) {
  const isMultiPage = !!document.getElementById('template-carrinho-cnpj');
  const navegar = !!opts.navegar;

  if (isMultiPage && typeof mostrarCarrinhosPorCNPJ === 'function') {
    return mostrarCarrinhosPorCNPJ({ navegar });
  }
  // fora da /multi, apenas mantenha os dados sincronizados (visual local da rota)
  return null;
};

/* --------------------------------
   DOMContentLoaded: inicialização
----------------------------------*/
document.addEventListener('DOMContentLoaded', function () {
  carregarCarrinho();
  atualizarCarrinho({ navegar: false });
  atualizarBadgeCarrinho();
  atualizarResumoGeralPedidos();

  // Upload Excel -> importar para múltiplos CNPJs
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fileInput = document.getElementById('fileUpload');
      const file = fileInput?.files?.[0];

      if (!file) {
        alert('Selecione um arquivo Excel para importar.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      fetch('/importar-produtos', {
        method: 'POST',
        body: formData
      })
        .then(r => r.json())
        .then(data => {
          if (data.status === 'ok' && data.pedidos) {
            const carrinhosPorCNPJ = {};

            Object.entries(data.pedidos).forEach(([cnpj, itens]) => {
              const chaveCarrinho = `carrinho_${cnpj}`;
              const carrinhoAtual = JSON.parse(localStorage.getItem(chaveCarrinho) || '[]');

              itens.forEach(produto => {
                const existente = carrinhoAtual.find(p => p.nome === produto.nome);
                if (existente) {
                  existente.quantidade += produto.quantidade;
                  existente.total = Number((existente.quantidade * (Number(existente.preco) || 0)).toFixed(2));
                } else {
                  carrinhoAtual.push({
                    ...produto,
                    total: Number(((Number(produto.preco) || 0) * (Number(produto.quantidade) || 0)).toFixed(2))
                  });
                }
              });

              localStorage.setItem(chaveCarrinho, JSON.stringify(carrinhoAtual));
              carrinhosPorCNPJ[cnpj] = carrinhoAtual;
            });

            renderizarCarrinhosPorCNPJ(carrinhosPorCNPJ);
            mostrarCarrinhosPorCNPJ({ navegar: true });
            alert('Pedidos importados com sucesso para os CNPJs!');

            // Fechar modal
            const modalEl = document.getElementById('uploadModal');
            if (modalEl) {
              const instance = bootstrap.Modal.getInstance(modalEl);
              if (instance) instance.hide();
            }

            // Limpeza extra (caso backdrop persista)
            setTimeout(() => {
              document.body.classList.remove('modal-open');
              document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
              document.body.style.overflow = '';
            }, 400);
          } else {
            alert('Erro ao importar: ' + (data.mensagem || 'Erro desconhecido.'));
          }
        })
        .catch(err => {
          console.error('Erro:', err);
          alert('Falha na importação.');
        });
    });
  }

  // Prazo global (multi)
  const selectPrazoGlobal = document.getElementById('prazo-global');
  if (selectPrazoGlobal) {
    selectPrazoGlobal.addEventListener('change', () => {
      const novoPrazo = selectPrazoGlobal.value;

      document.querySelectorAll('.prazo-individual').forEach(select => {
        const cnpj = select.dataset.cnpj;
        select.value = novoPrazo;
        localStorage.setItem(`prazo_${cnpj}`, novoPrazo);
      });

      alert('Prazo global aplicado com sucesso.');
    });
  }
});

/* --------------------------------
   Seleção de produto (para modais)
----------------------------------*/
function selecionarProduto(prod) {
  // Ex.: prod = { nome, codBarra, preco, imagem }
  produtoSelecionado = { ...prod, preco: Number(String(prod.preco).replace(',', '.')) || 0 };
}
