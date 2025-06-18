function substituirMultiplos(listaParaOcultar, idParaMostrar) {
  // Sempre garantir que o carrossel seja ocultado
  const carousel = document.getElementById('carouselExampleDark');
  if (carousel) carousel.style.display = 'none';

  // Oculta todos os elementos da lista recebida
  listaParaOcultar.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.style.display = "none";
    }
  });

  // Mostra apenas o que foi solicitado
  const destino = document.getElementById(idParaMostrar);
  if (destino) {
    // Se for uma div de lista ou o carrinho, usa block
    if (idParaMostrar.includes('list') || idParaMostrar === 'cart') {
      destino.style.display = 'block';
    } else {
      destino.style.display = 'flex';
    }
  }
}