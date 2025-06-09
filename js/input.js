const search = () => {
    const searchbox = document.getElementById("search-item").value.toUpperCase().trim();
    const products = document.querySelectorAll("#product-list .product");
    const carouselContainer = document.getElementById("carouselExampleDark");
    const noResultsMessage = document.getElementById("no-results");

    let anyVisible = false;

    products.forEach(product => {
        const pname = product.querySelector("p");
        const h5name = product.querySelector("h5");

        let textValue = "";
        if (pname) textValue += pname.textContent + " ";
        if (h5name) textValue += h5name.textContent;

        if (textValue.toUpperCase().includes(searchbox)) {
            product.style.display = "";
            anyVisible = true;
        } else {
            product.style.display = "none";
        }
    });

    // Mostrar ou esconder o carrossel
    if (carouselContainer) {
        carouselContainer.style.display = anyVisible ? "none" : "";
    }

    // Mostrar ou esconder a mensagem de "nenhum resultado"
    if (noResultsMessage) {
        noResultsMessage.style.display = anyVisible ? "none" : "block";
    }
};
