function limitarExibicao(containerId = "card-search-list") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const produtos = container.querySelectorAll('.product');
  produtos.forEach((produto, index) => {
    const wrapper = produto.closest('.col') || produto;

    if (wrapper) {
      if (index < 50) {
        wrapper.style.display = wrapper.tagName === "TR" ? "table-row" : "block";
      } else {
        wrapper.style.display = "none";
      }
    }
  });

  // Oculta também a paginação (caso ainda tenha na página)
  const pageNav = document.getElementById('page');
  if (pageNav) pageNav.style.display = "none";
}
