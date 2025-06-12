function search() {
  const searchbox = document.getElementById("search-item").value.toUpperCase().trim();
  const carouselContainer = document.getElementById("carouselExampleDark");
  const noResultsMessage = document.getElementById("no-results");

  let anyVisible = false;

  // Percorre todas as visualizações visíveis (card, photo, table)
  document.querySelectorAll(".visual-view").forEach(list => {
    const isVisible = list.offsetParent !== null;
    if (!isVisible) return;

    const products = list.querySelectorAll(".product");

    products.forEach(product => {
      const texts = [];

      const h5 = product.querySelector("h5");
      if (h5) texts.push(h5.textContent);

      const paragraphs = product.querySelectorAll("p");
      paragraphs.forEach(p => texts.push(p.textContent));

      const tdTexts = product.querySelectorAll("td");
      tdTexts.forEach(td => texts.push(td.textContent));

      const textValue = texts.join(" ").toUpperCase();

      const wrapper = product.closest(".col") || product;

      const match = textValue.includes(searchbox);

      if (wrapper) {
        if (match) {
          wrapper.style.display = wrapper.tagName === "TR" ? "table-row" : "block";
          anyVisible = true;
        } else {
          wrapper.style.display = "none";
        }
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
