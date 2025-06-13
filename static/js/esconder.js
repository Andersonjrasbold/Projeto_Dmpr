function substituirMultiplos(idsOcultar = [], idMostrar) {
  // Oculta todos os elementos passados
  idsOcultar.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Mostra o novo container
  const mostrar = document.getElementById(idMostrar);
  if (mostrar) {
    mostrar.style.display = 'block';

    // Força reflow para corrigir possíveis quebras de layout (como em tabelas)
    void mostrar.offsetWidth;

    // Reinicia a paginação para a nova visualização
    paginaAtual = 1;
    paginarProdutos(idMostrar);

    // Reexecuta a busca para garantir layout e visibilidade corretos
    search();
  }
}
