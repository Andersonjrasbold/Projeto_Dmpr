function alterarQuantidade(valor, botao) {
  const input = botao.parentElement.querySelector('input[name="quantidade"]');
  let atual = parseInt(input.value) || 0;
  let novoValor = atual + valor;

  input.value = novoValor < 0 ? 0 : novoValor;
}

