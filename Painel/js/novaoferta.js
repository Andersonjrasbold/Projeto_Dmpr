var fields = document.querySelectorAll("#form-new-oferta [name]");
var oferta = {};

function addLine(dataOferta){

    document.getElementById("table-oferta").innerHTML = `
        <tr>
            <td> <input type="checkbox" value=""></td>
            <td>${dataOferta.codigo_barras}</td>
            <td>${dataOferta.nome_comercial}</td>
            <td>${dataOferta.dosagem}</td>   
            <td>${dataOferta.unidade_medida}</td>
            <td>${dataOferta.conteudo}</td>
            <td>${dataOferta.tipo}</td>
            <td>${dataOferta.principio_ativo}</td>
            <td>${dataOferta.fabricante}</td>
           
            <td>${dataOferta.preco_atual}</td>
            <td>${dataOferta.desconto}</td>
            <td>${dataOferta.novo_preco}</td>
            <td>${dataOferta.publicar_em}</td>
            <td>${dataOferta.valido_ate}</td>
            <td>
                <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        </tr>

    `;

    
    
}

document.getElementById("form-new-oferta").addEventListener("submit",function(event){

    event.preventDefault();
    
    fields.forEach(function(field, index){

        
    
            oferta[field.name] = field.value;
        
    
    });

    addLine(oferta);
});
