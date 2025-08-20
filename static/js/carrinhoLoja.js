document.addEventListener('DOMContentLoaded', () => {
  mostrarCarrinho();

  const selectPrazoGlobal = document.getElementById("prazo-global");
  if (selectPrazoGlobal) {
    selectPrazoGlobal.addEventListener("change", () => {
      const novoPrazo = selectPrazoGlobal.value;
      const cnpj = sessionStorage.getItem('cliente_cnpj');
      if (!cnpj) return;

      const select = document.querySelector(`.prazo-individual[data-cnpj="${cnpj}"]`);
      if (select) {
        select.value = novoPrazo;
        localStorage.setItem(`prazo_${cnpj}`, novoPrazo);
        alert("Prazo aplicado com sucesso.");
      }
    });
  }

  document.addEventListener('click', function (e) {
  if (e.target.classList.contains('limpar-btn')) {
    const cnpj = e.target.dataset.cnpj;
    if (confirm(`Deseja limpar o carrinho do CNPJ ${cnpj}?`)) {
      localStorage.removeItem(`carrinho_${cnpj}`);
      mostrarCarrinho();  // ✅ Atualiza total-geral e esconde o carrinho se vazio
    }
  }
});

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('finalizar-btn')) {
      enviarPedido();
    }
  });
});

function adicionarAoCarrinho(botao) {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  if (!cnpj) return alert("Você precisa estar logado!");

  const produtoElement = botao.closest('.product');
  if (!produtoElement) return;

  const nome = produtoElement.querySelector('.card-title')?.innerText || produtoElement.querySelector('.nome-produto')?.innerText;
  const codBarra = produtoElement.dataset.codbarra;
  const precoText = produtoElement.querySelector('.text-dark')?.innerText || produtoElement.querySelector('.preco-produto')?.innerText;
  const quantidadeInput = produtoElement.querySelector('input[name="quantidade"]');
  const imagem = produtoElement.querySelector('img')?.src || '';

  const quantidade = parseInt(quantidadeInput?.value || '0');
  if (quantidade <= 0) return alert("Selecione uma quantidade válida.");

  const preco = parseFloat(precoText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

  const item = {
    nome: nome?.trim(),
    codBarra: codBarra?.trim(),
    preco,
    quantidade,
    imagem,
    total: parseFloat((quantidade * preco).toFixed(2))
  };

  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave)) || [];

  const existente = carrinho.find(p => p.codBarra === item.codBarra);
  if (existente) {
    existente.quantidade += item.quantidade;
    existente.total = parseFloat((existente.quantidade * existente.preco).toFixed(2));
  } else {
    carrinho.push(item);
  }

  localStorage.setItem(chave, JSON.stringify(carrinho));
  quantidadeInput.value = 0;

  const totalCarrinho = carrinho.reduce((soma, prod) => soma + (prod.quantidade * prod.preco), 0);
  const spanTotal = document.getElementById('carrinhoLoja-total');
  if (spanTotal) spanTotal.innerHTML = `<strong>${formatarMoeda(totalCarrinho)}</strong>`;

  mostrarCarrinho();
}

function mostrarCarrinho() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  if (!cnpj) return alert("Você precisa estar logado!");

  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");
  const container = document.getElementById('carrinhos-container');
  const template = document.getElementById('template-carrinho-logado').content.cloneNode(true);

  container.innerHTML = '';

  if (carrinho.length === 0) {
    container.style.display = 'none';

    // Atualiza o total do ícone mesmo se o carrinho estiver vazio
    const spanTotal = document.getElementById('carrinhoLoja-total');
    if (spanTotal) spanTotal.innerHTML = `<strong>R$ 0,00</strong>`;
    
    return;
  }

  const tabelaBody = template.querySelector('.cart-table-body');
  const totalFinalSpan = template.querySelector('.total-final');
  const prazoSelect = template.querySelector('.prazo-individual');
  const limparBtn = template.querySelector('.limpar-btn');
  const cnpjLabel = template.querySelector('.cnpj-label');

  prazoSelect.dataset.cnpj = cnpj;
  limparBtn.dataset.cnpj = cnpj;
  cnpjLabel.textContent = cnpj;

  let total = 0;

  carrinho.forEach((prod, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${prod.imagem}" style="height: 50px;"></td>
      <td>${prod.nome}</td>
      <td>${formatarMoeda(prod.preco)}</td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <input type="number" class="form-control text-center" name="quantidade" 
                value="${prod.quantidade}" min="1" style="width: 80px;"
                onchange="atualizarQuantidadeDireta('${cnpj}', ${index}, this.value)">
        </div>
      </td>
      <td id="totalProduto-${index}">${formatarMoeda(prod.total)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removerItem('${cnpj}', ${index})">Remover</button></td>
    `;
    total += prod.total;
    tabelaBody.appendChild(tr);
  });

  totalFinalSpan.textContent = formatarMoeda(total);
  container.appendChild(template);
  container.style.display = 'block';

  document.getElementById('total-geral-pedidos').textContent = formatarMoeda(total);

  const prazoSalvo = localStorage.getItem(`prazo_${cnpj}`);
  if (prazoSalvo) prazoSelect.value = prazoSalvo;

  prazoSelect.addEventListener('change', () => {
    localStorage.setItem(`prazo_${cnpj}`, prazoSelect.value);
  });

  // ✅ Atualiza o total no ícone do carrinho
  const spanTotal = document.getElementById('carrinhoLoja-total');
  if (spanTotal) {
    spanTotal.innerHTML = `<strong>${formatarMoeda(total)}</strong>`;
  }
}

function atualizarQuantidadeDireta(cnpj, index, valor) {
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");

  const novaQtd = parseInt(valor);
  if (isNaN(novaQtd) || novaQtd < 1) return;

  carrinho[index].quantidade = novaQtd;
  carrinho[index].total = parseFloat((novaQtd * carrinho[index].preco).toFixed(2));

  localStorage.setItem(chave, JSON.stringify(carrinho));

  mostrarCarrinho();  // isso já atualiza todos os totais
}


function enviarPedido() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");
  const prazo = document.querySelector(`[data-cnpj="${cnpj}"]`)?.value;

  if (!prazo) return alert(`Selecione o prazo de pagamento.`);
  if (carrinho.length === 0) return alert("Carrinho vazio.");

  const pedido = { cnpj, prazo, itens: carrinho };

  fetch('/enviar-pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([pedido])
  })
    .then(res => res.json())
    .then(data => {
      alert("Pedido enviado com sucesso!");
      localStorage.removeItem(chave);
      mostrarCarrinho();
    })
    .catch(err => {
      console.error("Erro:", err);
      alert("Erro ao enviar pedido.");
    });
}

function formatarMoeda(valor) {
  const numero = parseFloat(valor);
  if (isNaN(numero)) return "R$ 0,00";
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function removerItem(cnpj, index) {
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || "[]");
  carrinho.splice(index, 1);
  localStorage.setItem(chave, JSON.stringify(carrinho));

  mostrarCarrinho();  // ✅ Atualiza tudo, incluindo total-geral-pedidos
}


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileUpload');
  const statusBox = document.getElementById('uploadStatus');
  

  const LS_KEY = 'carrinhosPorCNPJ';

  // Normalizadores
  const normKey = s => String(s||'')
    .trim().toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu,'')
    .replace(/\s+/g,'_');
  const digits = s => String(s||'').replace(/\D+/g,'');

  // Lê Excel → linhas JSON
  function readExcel(file){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
      reader.onload = (e)=>{
        try{
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type:'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]]; // 1ª aba
          const rows = XLSX.utils.sheet_to_json(sheet, { defval:'' });
          resolve(rows);
        } catch(err){ reject(err); }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Mapeia uma linha para {cnpj, ean, quantidade, descricao?, preco?}
  function mapRow(row){
    const m = {};
    Object.keys(row).forEach(k => m[normKey(k)] = row[k]);

    const cnpj = digits(
      m['cnpj'] ?? m['cliente_cnpj'] ?? m['destinatario_cnpj'] ?? m['cnpj_destinatario'] ?? ''
    );
    const ean = (m['ean'] ?? m['codbarra'] ?? m['codigo_de_barras'] ?? m['codigo'] ?? m['cod_barras'] ?? '').toString().trim();
    const quantidade = Number(String(m['quantidade'] ?? m['qtd'] ?? m['qtde'] ?? '0').replace(',','.')) || 0;
    const descricao = (m['descricao'] ?? m['produto'] ?? m['nome'] ?? m['nome_produto'] ?? '').toString().trim();
    const preco = Number(String(m['preco'] ?? m['valor'] ?? m['preco_unit'] ?? m['preco_unitario'] ?? '0').replace(',','.')) || 0;

    return { cnpj, ean, quantidade, descricao, preco };
  }

  function upsertItem(carrinho, it){
    const idx = carrinho.itens.findIndex(p => String(p.ean) === String(it.ean));
    if (idx >= 0){
      carrinho.itens[idx].quantidade = Number(carrinho.itens[idx].quantidade) + Number(it.quantidade);
      if (it.preco) carrinho.itens[idx].preco = Number(it.preco);
      if (it.descricao) carrinho.itens[idx].nome = it.descricao;
    } else {
      carrinho.itens.push({
        ean: String(it.ean),
        nome: it.descricao || `EAN ${it.ean}`,
        quantidade: Number(it.quantidade),
        preco: Number(it.preco) || 0
      });
    }
  }

  async function importarParaCarrinho(file){
    statusBox.innerHTML = 'Processando arquivo…';
    const rows = await readExcel(file);
    if (!rows.length) {
      statusBox.innerHTML = '<span class="text-danger">Nenhuma linha encontrada na planilha.</span>';
      return;
    }

    // Converte e filtra válidos (com EAN e quantidade > 0)
    let itens = rows.map(mapRow).filter(r => r.ean && r.quantidade > 0);

    // Se não veio CNPJ na planilha, usa o CNPJ logado
    const cnpjSessao = sessionStorage.getItem('cliente_cnpj') ? digits(sessionStorage.getItem('cliente_cnpj')) : '';
    const temAlgumCNPJ = itens.some(i => i.cnpj);
    if (!temAlgumCNPJ) {
      if (!cnpjSessao) {
        statusBox.innerHTML = '<span class="text-danger">Planilha sem coluna CNPJ e nenhum CNPJ logado encontrado.</span>';
        return;
      }
      itens = itens.map(i => ({ ...i, cnpj: cnpjSessao }));
    }

    // Agrupa por CNPJ
    const porCNPJ = {};
    for (const it of itens) {
      if (!it.cnpj) continue; // segurança
      (porCNPJ[it.cnpj] ||= []).push(it);
    }

    // Carrega carrinhos existentes
    const atual = JSON.parse(localStorage.getItem(LS_KEY) || '{}');

    // Mescla
    Object.entries(porCNPJ).forEach(([cnpj, lista])=>{
      if (!atual[cnpj]) {
        atual[cnpj] = { itens: [], prazo: localStorage.getItem(`prazo_${cnpj}`) || null };
      }
      lista.forEach(it => upsertItem(atual[cnpj], it));
    });

    // Salva
    localStorage.setItem(LS_KEY, JSON.stringify(atual));

    // Renderiza sua UI
    if (typeof mostrarCarrinhosPorCNPJ === 'function') {
      mostrarCarrinhosPorCNPJ();
    } else if (typeof mostrarCarrinho === 'function') {
      // rota que trabalha com o CNPJ logado
      mostrarCarrinho();
    }

    // Feedback
    const qtdItens = itens.length;
    const qtdCNPJs = Object.keys(porCNPJ).length;
    statusBox.innerHTML = `<span class="text-success">Importação concluída: ${qtdItens} itens em ${qtdCNPJs} CNPJ(s).</span>`;

    // Fecha modal
    try {
      const modalEl = document.getElementById('uploadModal');
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    } catch(_) {}
  }

  // ==== Normalizadores (mantém) ====
const normKey = s => String(s||'')
  .trim().toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu,'')
  .replace(/\s+/g,'_');
const digits = s => String(s||'').replace(/\D+/g,'');

// Converte "1.234,56" → 1234.56 com segurança
function parsePrecoBR(value) {
  if (value == null) return 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  // remove qualquer coisa que não seja dígito, vírgula ou ponto
  const cleaned = raw.replace(/[^0-9.,]/g, '');
  // se tem vírgula e ponto, assumimos vírgula = decimal → remove pontos (milhar) e troca vírgula por ponto
  if (cleaned.includes(',') && cleaned.includes('.')) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // se tem só vírgula, vírgula = decimal
  if (cleaned.includes(',')) {
    return Number(cleaned.replace(',', '.')) || 0;
  }
  // só número ou número com ponto decimal
  return Number(cleaned) || 0;
}

// ==== Lê Excel → linhas JSON ====
function readExcel(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.onload = (e)=>{
      try{
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type:'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]]; // 1ª aba
        const rows = XLSX.utils.sheet_to_json(sheet, { defval:'' });
        resolve(rows);
      } catch(err){ reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ==== Mapeia uma linha genérica do Excel → {cnpj, codBarra, quantidade, nome?, preco?} ====
function mapRow(row){
  const m = {};
  Object.keys(row).forEach(k => m[normKey(k)] = row[k]);

  const cnpj = digits(
    m['cnpj'] ?? m['cliente_cnpj'] ?? m['destinatario_cnpj'] ?? m['cnpj_destinatario'] ?? ''
  );
  const codBarra = (m['ean'] ?? m['codbarra'] ?? m['codigo_de_barras'] ?? m['codigo'] ?? m['cod_barras'] ?? '').toString().trim();
  const quantidade = Number(String(m['quantidade'] ?? m['qtd'] ?? m['qtde'] ?? '0').replace(',','.')) || 0;
  const nome = (m['descricao'] ?? m['produto'] ?? m['nome'] ?? m['nome_produto'] ?? '').toString().trim();
  const preco = parsePrecoBR(m['preco'] ?? m['valor'] ?? m['preco_unit'] ?? m['preco_unitario'] ?? 0);

  return { cnpj, codBarra, quantidade, nome, preco };
}

// ==== Upsert na estrutura que seu mostrarCarrinho() usa (carrinho_{cnpj} como ARRAY) ====
function upsertNoCarrinhoArray(cnpj, itemExcel){
  const chave = `carrinho_${cnpj}`;
  const carrinho = JSON.parse(localStorage.getItem(chave) || '[]');

  const idx = carrinho.findIndex(p => String(p.codBarra) === String(itemExcel.codBarra));
  if (idx >= 0) {
    // soma quantidade e recalcula total
    carrinho[idx].quantidade = Number(carrinho[idx].quantidade) + Number(itemExcel.quantidade);
    // atualiza nome/preço se vier no Excel
    if (itemExcel.nome) carrinho[idx].nome = itemExcel.nome;
    if (!isNaN(itemExcel.preco) && itemExcel.preco > 0) carrinho[idx].preco = Number(itemExcel.preco);
    carrinho[idx].total = parseFloat((carrinho[idx].quantidade * carrinho[idx].preco).toFixed(2));
  } else {
    // cria item compatível com seu fluxo
    const novo = {
      nome: itemExcel.nome || `EAN ${itemExcel.codBarra}`,
      codBarra: String(itemExcel.codBarra),
      preco: Number(itemExcel.preco) || 0,
      quantidade: Number(itemExcel.quantidade),
      imagem: '', // não vem da planilha
      total: 0
    };
    novo.total = parseFloat((novo.quantidade * novo.preco).toFixed(2));
    carrinho.push(novo);
  }

  localStorage.setItem(chave, JSON.stringify(carrinho));
  return carrinho.length;
}

// ==== Fluxo principal de importação → grava em carrinho_{cnpj} e renderiza ====
async function importarParaCarrinho(file){
  const statusBox = document.getElementById('uploadStatus');
  statusBox.innerHTML = 'Processando arquivo…';

  const rows = await readExcel(file);
  if (!rows.length) {
    statusBox.innerHTML = '<span class="text-danger">Nenhuma linha encontrada na planilha.</span>';
    return;
  }

  // Converte e filtra válidos (precisa codBarra e quantidade > 0)
  let itens = rows.map(mapRow).filter(r => r.codBarra && r.quantidade > 0);

  // Se não veio CNPJ na planilha, usa o CNPJ logado
  const cnpjSessao = sessionStorage.getItem('cliente_cnpj') ? digits(sessionStorage.getItem('cliente_cnpj')) : '';
  const temAlgumCNPJ = itens.some(i => i.cnpj);
  if (!temAlgumCNPJ) {
    if (!cnpjSessao) {
      statusBox.innerHTML = '<span class="text-danger">Planilha sem coluna CNPJ e nenhum CNPJ logado encontrado.</span>';
      return;
    }
    itens = itens.map(i => ({ ...i, cnpj: cnpjSessao }));
  }

  // Agrupa por CNPJ e grava cada um no seu carrinho_{cnpj}
  const porCNPJ = {};
  for (const it of itens) {
    if (!it.cnpj) continue;
    (porCNPJ[it.cnpj] ||= []).push(it);
  }

  let totalItensGravados = 0;
  Object.entries(porCNPJ).forEach(([cnpj, lista]) => {
    lista.forEach(it => {
      upsertNoCarrinhoArray(cnpj, it);
      totalItensGravados += 1;
    });
  });

  // Renderiza sua UI já existente
  if (typeof mostrarCarrinhosPorCNPJ === 'function') {
    // Se você tiver a visão de múltiplos CNPJs
    mostrarCarrinhosPorCNPJ();
  } else if (typeof mostrarCarrinho === 'function') {
    // Sua visão atual usa o CNPJ logado
    mostrarCarrinho();
  }

  // Feedback
  const qtdCNPJs = Object.keys(porCNPJ).length;
  statusBox.innerHTML = `<span class="text-success">Importação concluída: ${totalItensGravados} itens em ${qtdCNPJs} CNPJ(s).</span>`;

  // Fechar modal
  try {
    const modalEl = document.getElementById('uploadModal');
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.hide();
  } catch(_) {}
}

// ==== Handler do formulário (mantém a mesma UX do seu modal) ====
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusBox = document.getElementById('uploadStatus');
  const file = fileInput.files?.[0];
  if (!file) {
    statusBox.innerHTML = '<span class="text-danger">Selecione um arquivo .xlsx</span>';
    return;
  }
  if (!/\.xlsx?$/.test(file.name.toLowerCase())) {
    statusBox.innerHTML = '<span class="text-danger">Formato inválido. Envie .xlsx/.xls</span>';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const cancelBtn = form.querySelector('[data-bs-dismiss="modal"]');
  submitBtn?.setAttribute('disabled', 'disabled');
  cancelBtn?.setAttribute('disabled', 'disabled');
  submitBtn?.classList.add('disabled');

  try {
    await importarParaCarrinho(file);
    fileInput.value = '';
  } catch (err) {
    console.error(err);
    statusBox.innerHTML = `<span class="text-danger">Erro ao importar: ${err.message}</span>`;
  } finally {
    submitBtn?.removeAttribute('disabled');
    cancelBtn?.removeAttribute('disabled');
    submitBtn?.classList.remove('disabled');
  }
});


