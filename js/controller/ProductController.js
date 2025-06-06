
class ProductController{
    constructor(formIdCreate, formIdUpdate, tableId ){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit(){

        document.querySelector("#box-product-update .btn-cancel").addEventListener("click", e=>{
            
            this.showPanelCreate();
        
        });

        this.formUpdateEl.addEventListener("submit", event=>{

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIdex;

            let tr = this.tableEl.rows[index];

            let productOld = JSON.parse(tr.dataset.product);

            let result = Object.assign({}, productOld, values);

             this.getPhoto(this.formUpdateEl).then((content) => {

                if (!values.photo) {

                    result._photo = productOld._photo;

                } else {

                    result._photo = content;

                }
                
                let product = new Product();

                product.loadFromJSON(result);

                product.save();

                this.getTr(product, tr);

                this.updateCount();

                this.formUpdateEl.reset();

                btn.disabled = false;

                this.showPanelCreate();

           }, (e)=>{

                console.error(e);

                }
           
           );

        });

    }

   /* showList(){

        document.querySelector("#box-product-list .btn-list").addEventListener("click", e=>{
            
            this.showListProduct();
        
        });

        return e;
    }*/

    onSubmit(){


       this.formEl.addEventListener("submit", event => {

           event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");
            
            btn.disabled = true;

           let values = this.getValues(this.formEl);

           if (!values) return false;

           this.getPhoto(this.formEl).then((content)=>{

                values.photo = content;

                values.save();

                this.addLine(values);

                this.formEl.reset();

                btn.disabled = false;

           }, (e)=>{

                console.error(e);

                }
           
           );
           
        });
        
    }

    getPhoto(formEl){

        return new Promise((resolve, reject) => {

        let fileReader = new FileReader();

        let elements = [...formEl.elements].filter(item => {
           
            if (item.name === 'photo') {
               return item;
            }

        });

        let file = elements[0].files[0];

        fileReader.onload = () => {

            resolve(fileReader.result);

        };

        fileReader.onerror = (e) =>{

            reject(e);
        };

        if (file) {
            fileReader.readAsDataURL(file);
        } else {
            resolve("D:/farmaoferta/img/avatar.jpg");
        }
        });

        
    }

    getValues(formEl){

        let product = {};

        let isValid = true;

        [...formEl.elements].forEach(function(field, index){

            if (['nome_product'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            product[field.name] = field.value;
           
           });

           if (!isValid){
               return false;
           }
    
           return new Product(    
            product.codigo_produto,
            product.codigo_barras,
            product.nome_comercial,
            product.dosagem,
            product.unidade_medida,
            product.conteudo,
            product.tipo,
            product.estado_ativo,
            product.principio_ativo,
            product.fabricante,
            product.caixa_padrao,
            product.ipi,
            product.icms,
            product.pis_cofins,
            product.pf,
            product.pmc,
            product.categoria,
            product.subcategorias,
            product.classe_terapeutica,
            product.indicacao,
            product.tipo_desconto,
            product.controlado,
            product.desconto,
            product.lucro,
            product.tipo_item,
            product.estoque,
            product.lote,
            product.comissão,
            product.validade,
            product.ultima_venda,
            product.observacoes,
            product.photo,           
           );
    }
    

    selectAll(){

        let product = Product.getProductsStorage();

        product.forEach(dataProduct=>{

            let product = new Product();

            product.loadFromJSON(dataProduct);

            this.addLine(product);

        });

    }

    addLine(dataProduct){

        let tr = this.getTr(dataProduct);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataProduct, tr = null){

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.product = JSON.stringify(dataProduct);

        tr.innerHTML = `
    
            <td><img src="${dataProduct.photo}" alt="Cinque Terre" style="width: 45px" class="img-roundedimg-sm"></td>
            <td>${dataProduct.nome_comercial}</td>
            
            <td>${dataProduct.pf}</td>  
            <td>${dataProduct.pmc}</td>
            <td>${dataProduct.lucro}</td>
            <td>${Utils.dateFormat(dataProduct.register)}</td>
            <td>${dataProduct.estado_ativo}</td>
            
            
            
            <td>
                <button type="button"  class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>    
        `;

        this.addEventsTr(tr);

        return tr;
    }

   

    addEventsTr(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e=>{

            if (confirm("Deseja realmente excluir?")){

                let product = new Product();

                product.loadFromJSON(JSON.parse(tr.dataset.product));

                product.remove();

                tr.remove();

                this.updateCount();
            }

        });   
            
        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.product);

            this.formUpdateEl.dataset.trIdex = tr.sectionRowIndex;

            for (let name in json){

                let field = this.formUpdateEl.querySelector("[name="+ name.replace("_", "") + "]");

                

                if (field){

                    if (field.type == 'file') continue;

                    field.value = json[name];
                    
                }

                

            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();

        });
    } 

    /*showListProducts(){

        document.querySelector("#box-product-list").style.display = "block";
        document.querySelector("#box-product-create").style.display = "none";
        document.querySelector("#box-product-update").style.display = "none";
        

    }*/

    showPanelCreate(){

       // document.querySelector("#box-product-list").style.display = "none";
        document.querySelector("#box-product-create").style.display = "block";
        document.querySelector("#box-product-update").style.display = "none";

    }

    showPanelUpdate(){

        //document.querySelector("#box-product-list").style.display = "none";
        document.querySelector("#box-product-create").style.display = "none";
        document.querySelector("#box-product-update").style.display = "block";

    }

    updateCount(){

        let numberProducts = 0;

        let numberLojas = 0;

        

        [...this.tableEl.children].forEach(tr=>{

            numberProducts++;
            //numberProducts++;
           // numberProducts++;
            //let lojas = JSON.parse(tr.dataset.product);

           //if (product._cnpj) numberLojas++;

            
        });

        document.querySelector("#number-product").innerHTML = numberProducts;
        //document.querySelector("#number-lojas").innerHTML = numberLojas;
       // document.querySelector("#number-product").innerHTML = numberProducts;
    }
}

