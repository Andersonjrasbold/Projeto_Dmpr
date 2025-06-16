fetch('/importar-produtos', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.status === "ok") {
    adicionarProdutosPorCatalogo(data.catalogo, data.lista_de_produtos);
    alert("Produtos importados com sucesso!");
    const uploadModal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
    uploadModal.hide();
  } else {
    alert("Erro ao importar: " + (data.mensagem || "Erro desconhecido."));
  }
});
