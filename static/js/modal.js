  function preencherModal(nome, codigo, preco, img) {
    document.getElementById("modalNome").textContent = nome;
    document.getElementById("modalCodigo").textContent = codigo;
    document.getElementById("modalPreco").textContent = parseFloat(preco).toFixed(2).replace('.', ',');
    
  }