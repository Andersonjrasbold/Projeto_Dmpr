const search = () => {
    const searchbox = document.getElementById("search-item").value.toUpperCase().trim();
    const products = document.querySelectorAll("#product-list .product");
    const carouselContainer = document.getElementById("carouselExampleDark");
    const noResultsMessage = document.getElementById("no-results");

    let anyVisible = false;

    products.forEach(product => {
        const texts = [];
        
        const h5 = product.querySelector("h5");
        if (h5) texts.push(h5.textContent);

        const paragraphs = product.querySelectorAll("p");
        paragraphs.forEach(p => texts.push(p.textContent));

        const textValue = texts.join(" ").toUpperCase();

        if (textValue.includes(searchbox)) {
            product.style.display = "";
            anyVisible = true;
        } else {
            product.style.display = "none";
        }
    });

    if (carouselContainer) {
        carouselContainer.style.display = anyVisible ? "none" : "";
    }

    if (noResultsMessage) {
        noResultsMessage.style.display = anyVisible ? "none" : "block";
    }
};

  