/*
function atualizarCarrinho() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  if (!cnpj) return;

  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");

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
          <input type="number" name="quantidade" value="${item.quantidade}" min="1"
            class="form-control text-center" style="max-width: 70px;"
            onchange="atualizarQuantidadeDiretaPorCNPJ('${cnpj}', ${index}, this.value)">
          <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidadeCarrinho(${index}, 1)">+</button>
        </div>
      </td>
      <td id="totalProduto-${index}">${formatarMoeda(precoTotal)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removerItem(${index})">Remover</button></td>
    `;
    tbody.appendChild(tr);
  });

  totalSpan.textContent = formatarMoeda(total);
  totalPaymentSpan.textContent = formatarMoeda(total);
  salvarCarrinho(); // Essa função precisa saber qual carrinho salvar
}*/


/*
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
} */