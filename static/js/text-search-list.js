let itensPorPagina = 50;
let paginaAtual = 1;

function paginarProdutos(containerId = "card-search-list") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const produtos = container.querySelectorAll(".product");
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);

  produtos.forEach((produto, index) => {
    const wrapper = produto.closest(".col") || produto;
    wrapper.style.display = (index >= (paginaAtual - 1) * itensPorPagina && index < paginaAtual * itensPorPagina) 
      ? "block" 
      : "none";
  });

  atualizarPaginacao(totalPaginas);
  document.getElementById("page").style.display = totalPaginas > 1 ? "flex" : "none";
}

function atualizarPaginacao(totalPaginas) {
  const paginacao = document.getElementById("pagination");
  if (!paginacao) return;
  paginacao.innerHTML = "";

  paginacao.innerHTML += `
    <li class="page-item ${paginaAtual === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual - 1})">&laquo;</a>
    </li>`;

  for (let i = 1; i <= totalPaginas; i++) {
    paginacao.innerHTML += `
      <li class="page-item ${paginaAtual === i ? "active" : ""}">
        <a class="page-link" href="#" onclick="mudarPagina(${i})">${i}</a>
      </li>`;
  }

  paginacao.innerHTML += `
    <li class="page-item ${paginaAtual === totalPaginas ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual + 1})">&raquo;</a>
    </li>`;
}

function mudarPagina(pagina) {
  if (pagina < 1) return;
  paginaAtual = pagina;
  paginarProdutos(); // ou passe o containerId se usar outro além de "card-search-list"
}

window.onload = () => {
  paginarProdutos();
};

function substituirMultiplos(idsOcultar = [], idMostrar) {
  idsOcultar.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const mostrar = document.getElementById(idMostrar);
  if (mostrar) {
    mostrar.style.display = 'block';
    paginaAtual = 1;
    paginarProdutos(idMostrar);

    // 👇 Força reflow/repaint para corrigir layout da tabela
    void mostrar.offsetWidth;
  }
}

function substituirMultiplos(idsOcultar = [], idMostrar) {
  idsOcultar.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const mostrar = document.getElementById(idMostrar);
  if (mostrar) {
    mostrar.classList.add('active');
    paginaAtual = 1;
    paginarProdutos(idMostrar);
  }
}
