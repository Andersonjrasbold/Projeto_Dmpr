class RedeController{

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    

    onEdit(){

        document.querySelector("#box-rede-update .btn-cancel").addEventListener("click", e=>{
            
            this.showPanelCreate();
        
        });

        this.formUpdateEl.addEventListener("submit", event=>{

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIdex;

            let tr = this.tableEl.rows[index];

            let redeOld = JSON.parse(tr.dataset.rede);

            let result = Object.assign({}, redeOld, values);

             this.getPhoto(this.formUpdateEl).then((content) => {

                if (!values.photo) {

                    result._photo = redeOld._photo;

                } else {

                    result._photo = content;

                }

                let rede = new Rede();

                rede.loadFromJSON(result);

                rede.save();

                this.getTr(rede, tr);

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

        document.querySelector("#box-rede-list .btn-list").addEventListener("click", e=>{
            
            this.showListRedes();
        
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

        let rede = {};

        let isValid = true;

        [...formEl.elements].forEach(function(field, index){

            if (['nome_rede'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            rede[field.name] = field.value;
           
           });

           if (!isValid){
               return false;
           }
    
           return new Rede(
            rede.matricula, 
            rede.nome_rede,
            rede.filial,
            rede.grupo_economico, 
            rede.numero_lojas,
            rede.estado_ativo,
            rede.cnpj,
            rede.ie,
            rede.imunicipal, 
            rede.razaoSocial,
            rede.nomeFantasia, 
            rede.ddd_farmacia, 
            rede.celular_farmacia, 
            rede.ddd_fixo_farmacia, 
            rede.fone_fixo_farmacia, 
            rede.contato,
            rede.funcao,
            rede.cep,
            rede.endereco, 
            rede.numero, 
            rede.complemento, 
            rede.bairro, 
            rede.cidade,
            rede.estado,
            rede.pais,
            rede.email_xml,
            rede.nome_socio_principal, 
            rede.sobrenome_socio_principal, 
            rede.ddd_socio_principal,
            rede.celular_socio_principal, 
            rede.email_socio_principal, 
            rede.nome_socio_secundario,
            rede.sobrenome_socio_secundario,
            rede.ddd_socio_secundario,
            rede.celular_socio_secundario,
            rede.email_socio_secundario, 
            rede.horario_abertura_loja,
            rede.horario_fechamento_loja,
            rede.observacoes, 
            rede.taxa_min_pedido,
            rede.horario_inicio_entrega,
            rede.horario_termino_entrega,
            rede.custo_km, 
            rede.tempo_medio_entrega, 
            rede.primeira_taxa_custo, 
            rede.primeira_taxa_km,
            rede.segunda_taxa_custo, 
            rede.segunda_taxa_km, 
            rede.terceira_taxa_custo,
            rede.terceira_taxa_km,
            rede.photo,
           );
    }


    selectAll(){

        let redes = Rede.getRedesStorage();

        redes.forEach(dataRede=>{

            let rede = new Rede();

            rede.loadFromJSON(dataRede);

            this.addLine(rede);

        });

    }

    addLine(dataRede){

        let tr = this.getTr(dataRede);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataRede, tr = null){

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.rede = JSON.stringify(dataRede);

        tr.innerHTML = `
    
            <td><img src="${dataRede.photo}" alt="Cinque Terre" style="width: 45px" class="img-roundedimg-sm"></td>
            <td>${dataRede.nome_rede}</td>
            <td>${dataRede.cidade}</td>
            <td>${dataRede.estado}</td>   
            <td>${dataRede.nome_socio_principal}</td>
            <td>${dataRede.ddd_socio_principal}</td>
            <td>${dataRede.celular_socio_principal}</td>
            <td>${Utils.dateFormat(dataRede.register)}</td>
            
            
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

                let rede = new Rede();

                rede.loadFromJSON(JSON.parse(tr.dataset.rede));

                rede.remove();

                tr.remove();

                this.updateCount();
            }

        });   
            
        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.rede);

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

    /*showListRedes(){

        document.querySelector("#box-rede-list").style.display = "block";
        document.querySelector("#box-rede-create").style.display = "none";
        document.querySelector("#box-rede-update").style.display = "none";
        

    }*/

    showPanelCreate(){

       // document.querySelector("#box-rede-list").style.display = "none";
        document.querySelector("#box-rede-create").style.display = "block";
        document.querySelector("#box-rede-update").style.display = "none";

    }

    showPanelUpdate(){

        //document.querySelector("#box-rede-list").style.display = "none";
        document.querySelector("#box-rede-create").style.display = "none";
        document.querySelector("#box-rede-update").style.display = "block";

    }

    updateCount(){

        let numberRedes = 0;

        let numberLojas = 0;

        let numberUsers = 0;

        [...this.tableEl.children].forEach(tr=>{

            numberRedes++;
            //numberRedes++;
           // numberUsers++;
            //let lojas = JSON.parse(tr.dataset.rede);

           //if (rede._cnpj) numberLojas++;

            
        });

        document.querySelector("#number-redes").innerHTML = numberRedes;
        //document.querySelector("#number-lojas").innerHTML = numberLojas;
       // document.querySelector("#number-users").innerHTML = numberUsers;
    }

};