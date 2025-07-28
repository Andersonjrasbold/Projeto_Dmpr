let itensPorPagina = 120;
let paginaAtual = 1;

//gerar a chave correta para acessar o carrinho de um cliente específico no localStorage (ou outro armazenamento), com base no CNPJ do cliente logado.
function getChaveCarrinho() {
  const cnpj = sessionStorage.getItem('cliente_cnpj');
  return cnpj ? `carrinho_${cnpj}` : 'carrinho_padrao';
}


function adicionarProdutoAoCarrinho({ produtoElement, quantidade, cnpj }) {
  if (!cnpj) return alert("CNPJ não informado.");
  if (!produtoElement) return alert("Elemento do produto não encontrado.");

  const nome = produtoElement.querySelector('.card-title')?.innerText || produtoElement.querySelector('.nome-produto')?.innerText;
  const codBarra = produtoElement.querySelector('.card-text small')?.innerText || produtoElement.querySelectorAll('td')[2]?.innerText;
  const precoText = produtoElement.querySelector('.text-dark')?.innerText || produtoElement.querySelector('.preco-produto')?.innerText;
  const imagem = produtoElement.querySelector('img')?.src || '';

  const qtd = parseInt(quantidade || '0');
  if (qtd <= 0) return alert("Selecione uma quantidade válida.");

  const preco = parseFloat(precoText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

  const item = {
    nome: nome?.trim(),
    codBarra: codBarra?.trim(),
    preco,
    quantidade: qtd,
    imagem,
    total: parseFloat((qtd * preco).toFixed(2))
  };

  const chave = `carrinho_${cnpj}`;
  const carrinhoExistente = JSON.parse(localStorage.getItem(chave)) || [];

  const produtoExistente = carrinhoExistente.find(p => p.codBarra === item.codBarra);
  if (produtoExistente) {
    produtoExistente.quantidade += item.quantidade;
    produtoExistente.total = parseFloat((produtoExistente.quantidade * produtoExistente.preco).toFixed(2));
  } else {
    carrinhoExistente.push(item);
  }

  localStorage.setItem(chave, JSON.stringify(carrinhoExistente));
  mostrarCarrinhosPorCNPJ();
}


// Exponha explicitamente para o HTML reconhecer
window.adicionarAoCarrinho = adicionarAoCarrinho;










