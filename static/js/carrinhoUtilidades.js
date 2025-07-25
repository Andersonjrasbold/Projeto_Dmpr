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