function alterarQuantidade(delta, btn) {
    const input = btn.parentElement.querySelector('input');
    let valor = parseInt(input.value) || 0;
    valor += delta;
    if (valor < 0) valor = 0;
    input.value = valor;
  }
