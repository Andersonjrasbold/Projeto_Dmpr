function paginarProdutos(containerId = "card-search-list") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const produtos = container.querySelectorAll('.product');
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);

  produtos.forEach((produto, index) => {
    let wrapper = produto.closest('.col') || produto;
    wrapper.style.display = (index >= (paginaAtual - 1) * itensPorPagina && index < paginaAtual * itensPorPagina)
      ? 'block' : 'none';
  });

  atualizarPaginacao(totalPaginas);

  const pageContainer = document.getElementById('page');
  if (pageContainer) {
    pageContainer.style.display = totalPaginas > 1 ? 'flex' : 'none';
  }
}

function atualizarPaginacao(totalPaginas) {
  const paginacao = document.getElementById('pagination');
  if (!paginacao) return;
  paginacao.innerHTML = '';

  paginacao.innerHTML += `
    <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual - 1})">&laquo;</a>
    </li>`;

  for (let i = 1; i <= totalPaginas; i++) {
    paginacao.innerHTML += `
      <li class="page-item ${paginaAtual === i ? 'active' : ''}">
        <a class="page-link" href="#" onclick="mudarPagina(${i})">${i}</a>
      </li>`;
  }

  paginacao.innerHTML += `
    <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual + 1})">&raquo;</a>
    </li>`;
}

function mudarPagina(pagina) {
  if (pagina < 1) return;
  paginaAtual = pagina;

  const ativo = document.querySelector(".visual-view[style*='display: block']");
  if (ativo) {
    paginarProdutos(ativo.id);
  }
}

window.onload = () => {
  paginarProdutos();
};