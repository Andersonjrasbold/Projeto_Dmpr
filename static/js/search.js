function search() {
  const searchbox = document.getElementById("search-item").value.toUpperCase().trim();
  const selectedIndustria = document.getElementById("filtro-industria").value.toUpperCase().trim();
  const carouselContainer = document.getElementById("carouselExampleDark");
  const noResultsMessage = document.getElementById("no-results");

  let anyVisible = false;

  document.querySelectorAll(".visual-view").forEach(list => {
    const isVisible = list.style.display !== "none";
    if (!isVisible) return;

    const products = list.querySelectorAll(".product");
    let count = 0; // Limite de 50 por visual-view

    products.forEach(product => {
      const texts = [];

      const h5 = product.querySelector("h5");
      if (h5) texts.push(h5.textContent);

      const paragraphs = product.querySelectorAll("p");
      paragraphs.forEach(p => texts.push(p.textContent));

      const tds = product.querySelectorAll("td");
      tds.forEach(td => texts.push(td.textContent));

      const textValue = texts.join(" ").toUpperCase();

      const wrapper = product.closest(".col") || product.closest("tr") || product;

      const matchSearch = searchbox === "" || textValue.includes(searchbox);
      const matchIndustria = selectedIndustria === "" || textValue.includes(selectedIndustria);

      if (matchSearch && matchIndustria && count < 30) {
        if (wrapper.tagName === "TR") {
          wrapper.style.display = "table-row";
        } else {
          wrapper.style.display = "block";
        }
        anyVisible = true;
        count++;
      } else {
        wrapper.style.display = "none";
      }
    });
  });

  if (carouselContainer) {
    carouselContainer.style.display = anyVisible ? "none" : "";
  }

  if (noResultsMessage) {
    noResultsMessage.style.display = anyVisible ? "none" : "block";
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const filtroIndustriaSelect = document.getElementById("filtro-industria");
  const searchInput = document.getElementById("search-item");

  if (filtroIndustriaSelect) {
    filtroIndustriaSelect.addEventListener("change", search);
  }
  if (searchInput) {
    searchInput.addEventListener("keyup", search);
  }
});
