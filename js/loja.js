class AddToCart{
    
    addItemToCart(){

        document.querySelector(".add-to-cart-link").addEventListener("click", e=>{

            let item =  document.getElementById("#title-product");

              item.innerHTML = `
                    <li>${item}</li>
              `

        });
        console.log(item);
    }
}

