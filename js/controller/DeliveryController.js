class DeliveryController{

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    

    onEdit(){

        document.querySelector("#box-delivery-update .btn-cancel").addEventListener("click", e=>{
            
            this.showPanelCreate();
        
        });

        this.formUpdateEl.addEventListener("submit", event=>{

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIdex;

            let tr = this.tableEl.rows[index];

            let deliveryOld = JSON.parse(tr.dataset.delivery);

            let result = Object.assign({}, deliveryOld, values);

             this.getPhoto(this.formUpdateEl).then((content) => {

                if (!values.photo) {

                    result._photo = deliveryOld._photo;

                } else {

                    result._photo = content;

                }

                let delivery = new Delivery();

                delivery.loadFromJSON(result);

                delivery.save();

                this.getTr(delivery, tr);

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

        document.querySelector("#box-delivery-list .btn-list").addEventListener("click", e=>{
            
            this.showListDeliverys();
        
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

        let delivery = {};

        let isValid = true;

        [...formEl.elements].forEach(function(field, index){

            if (['nome_delivery'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            delivery[field.name] = field.value;
           
           });

           if (!isValid){
               return false;
           }
    
           return new Delivery(
            delivery.matricula, 
            delivery.cnpj,
            delivery.razaoSocial,
            delivery.nome_rede,
            delivery.filial,
            delivery.estado_ativo,
            delivery.cep,
            delivery.endereco, 
            delivery.numero, 
            delivery.complemento, 
            delivery.bairro, 
            delivery.cidade,
            delivery.estado,
            delivery.pais,
            delivery.taxa_min_pedido,
            delivery.horario_inicio_entrega,
            delivery.horario_termino_entrega,
            delivery.custo_km, 
            delivery.tempo_medio_entrega, 
            delivery.primeira_taxa_custo, 
            delivery.primeira_taxa_km,
            delivery.segunda_taxa_custo, 
            delivery.segunda_taxa_km, 
            delivery.terceira_taxa_custo,
            delivery.terceira_taxa_km,
            delivery.observacoes,
            delivery.photo,
        
           );
    }


    selectAll(){

        let delivery = Delivery.getDeliverysStorage();

        delivery.forEach(dataDelivery=>{

            let delivery = new Delivery();

            delivery.loadFromJSON(dataDelivery);

            this.addLine(delivery);

        });

    }

    addLine(dataDelivery){

        let tr = this.getTr(dataDelivery);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataDelivery, tr = null){

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.delivery = JSON.stringify(dataDelivery);

        tr.innerHTML = `
    
            <td><img src="${dataDelivery.photo}" alt="Cinque Terre" style="width: 45px" class="img-roundedimg-sm"></td>
            <td>${dataDelivery.nome_rede}</td>
            <td>${dataDelivery.cidade}</td>
            <td>${dataDelivery.estado}</td>   
            <td>${dataDelivery.nome_socio_principal}</td>
            <td>${dataDelivery.ddd_socio_principal}</td>
            <td>${dataDelivery.celular_socio_principal}</td>
            <td>${Utils.dateFormat(dataDelivery.register)}</td>
            
            
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

                let delivery = new Delivery();

                delivery.loadFromJSON(JSON.parse(tr.dataset.delivery));

                delivery.remove();

                tr.remove();

                this.updateCount();
            }

        });   
            
        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.delivery);

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

    /*showListDelivery(){

        document.querySelector("#box-delivery-list").style.display = "block";
        document.querySelector("#box-delivery-create").style.display = "none";
        document.querySelector("#box-delivery-update").style.display = "none";
        

    }*/

    showPanelCreate(){

       // document.querySelector("#box-delivery-list").style.display = "none";
        document.querySelector("#box-delivery-create").style.display = "block";
        document.querySelector("#box-delivery-update").style.display = "none";

    }

    showPanelUpdate(){

        //document.querySelector("#box-delivery-list").style.display = "none";
        document.querySelector("#box-delivery-create").style.display = "none";
        document.querySelector("#box-delivery-update").style.display = "block";

    }

    updateCount(){

        let numberDeliverys = 0;

        let numberLojas = 0;

        let numberUsers = 0;

        [...this.tableEl.children].forEach(tr=>{

            numberDeliverys++;
            //numberRedes++;
           // numberUsers++;
            //let lojas = JSON.parse(tr.dataset.rede);

           //if (rede._cnpj) numberLojas++;

            
        });

        document.querySelector("#number-delivery").innerHTML = numberDeliverys;
        //document.querySelector("#number-lojas").innerHTML = numberLojas;
       // document.querySelector("#number-users").innerHTML = numberUsers;
    }

};