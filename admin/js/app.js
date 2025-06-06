


class oferta{
	constructor(){
		this.codBarras;
		this.nomeProduto;
		this.categoria;
		this.preco;
		this.desconto;
		this.novoPreco;
		this.publicarEm;
		this.validoAte;
	}
}

function salvarOferta(){
	

	let newOferta = new oferta();
	newOferta.codBarras = codBarras.value;
	newOferta.nomeProduto = nomeProduto.value;
	newOferta.categoria = categoria.value;
	newOferta.preco = preco.value;
	newOferta.desconto = desconto.value;
	newOferta.novoPreco = novoPreco.value;
	newOferta.publicarEm = publicarEm.value;
	newOferta.validoAte = validoAte.value;



	console.log(newOferta);

}


$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#myTable tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});
