class OfferController{
    constructor(formIdCreate, formIdUpdate, tableId ){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit(){

        document.querySelector("#box-offer-update .btn-cancel").addEventListener("click", e=>{
            
            this.showPanelCreate();
        
        });

        this.formUpdateEl.addEventListener("submit", event=>{

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIdex;

            let tr = this.tableEl.rows[index];

            let offerOld = JSON.parse(tr.dataset.offer);

            let result = Object.assign({}, offerOld, values);

             this.getPhoto(this.formUpdateEl).then((content) => {

                if (!values.photo) {

                    result._photo = offerOld._photo;

                } else {

                    result._photo = content;

                }
                
                let offer = new Offer();

                offer.loadFromJSON(result);

                offer.save();

                this.getTr(offer, tr);

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

        document.querySelector("#box-offer-list .btn-list").addEventListener("click", e=>{
            
            this.showListOffer();
        
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

        let offer = {};

        let isValid = true;

        [...formEl.elements].forEach(function(field, index){

            if (['nome_offer'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            offer[field.name] = field.value;
           
           });

           if (!isValid){
               return false;
           }
    
           return new Offer(    
            offer.codigo_produto,
            offer.codigo_barras,
            offer.nome_comercial,
            offer.dosagem,
            offer.unidade_medida,
            offer.conteudo,
            offer.tipo,
            offer.estado_ativo,
            offer.principio_ativo,
            offer.fabricante,
            offer.caixa_padrao,
            offer.ipi,
            offer.icms,
            offer.pis_cofins,
            offer.pf,
            offer.pmc,
            offer.categoria,
            offer.subcategorias,
            offer.classe_terapeutica,
            offer.indicacao,
            offer.tipo_desconto,
            offer.controlado,
            offer.desconto,
            offer.lucro,
            offer.tipo_item,
            offer.estoque,
            offer.lote,
            offer.comissão,
            offer.publicar_em,
            offer.valido_ate,
            offer.observacoes,
            offer.photo,           
           );
    }
    

    selectAll(){

        let offer = Offer.getOffersStorage();

        offer.forEach(dataOffer=>{

            let offer = new Offer();

            offer.loadFromJSON(dataOffer);

            this.addLine(offer);

        });

    }

    addLine(dataOffer){

        let tr = this.getTr(dataOffer);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataOffer, tr = null){

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.offer = JSON.stringify(dataOffer);

        tr.innerHTML = `
    
            <td><img src="${dataOffer.photo}" alt="Cinque Terre" style="width: 45px" class="img-roundedimg-sm"></td>
            <td>${dataOffer.nome_comercial}</td>
            
            <td>${dataOffer.pf}</td>  
            <td>${dataOffer.pmc}</td>
            <td>${dataOffer.lucro}</td>
            <td>${Utils.dateFormat(dataOffer.register)}</td>
            <td>${dataOffer.estado_ativo}</td>
            
            
            
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

                let offer = new Offer();

                offer.loadFromJSON(JSON.parse(tr.dataset.offer));

                offer.remove();

                tr.remove();

                this.updateCount();
            }

        });   
            
        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.offer);

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

    /*showListOffers(){

        document.querySelector("#box-Offer-list").style.display = "block";
        document.querySelector("#box-Offer-create").style.display = "none";
        document.querySelector("#box-Offer-update").style.display = "none";
        

    }*/

    showPanelCreate(){

       // document.querySelector("#box-offer-list").style.display = "none";
        document.querySelector("#box-offer-create").style.display = "block";
        document.querySelector("#box-offer-update").style.display = "none";

    }

    showPanelUpdate(){

        //document.querySelector("#box-offer-list").style.display = "none";
        document.querySelector("#box-offer-create").style.display = "none";
        document.querySelector("#box-offer-update").style.display = "block";

    }

    updateCount(){

        let numberOffers = 0;

        let numberLojas = 0;

        

        [...this.tableEl.children].forEach(tr=>{

            numberOffers++;
            //numberProducts++;
           // numberProducts++;
            //let lojas = JSON.parse(tr.dataset.product);

           //if (offers._cnpj) numberLojas++;

            
        });

        document.querySelector("#number-offers").innerHTML = numberOffers;
        //document.querySelector("#number-lojas").innerHTML = numberLojas;
       // document.querySelector("#number-offer").innerHTML = numberProducts;
    }
}

