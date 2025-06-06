class StaffController{

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    

    onEdit(){

        document.querySelector("#box-staff-update .btn-cancel").addEventListener("click", e=>{
            
            this.showPanelCreate();
        
        });

        this.formUpdateEl.addEventListener("submit", event=>{

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIdex;

            let tr = this.tableEl.rows[index];

            let staffOld = JSON.parse(tr.dataset.staff);

            let result = Object.assign({}, staffOld, values);

             this.getPhoto(this.formUpdateEl).then((content) => {

                if (!values.photo) {

                    result._photo = staffOld._photo;

                } else {

                    result._photo = content;

                }
                
                let staff = new Staff();

                staff.loadFromJSON(result);

                staff.save();

                this.getTr(staff, tr);

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

        document.querySelector("#box-staff-list .btn-list").addEventListener("click", e=>{
            
            this.showListStaff();
        
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

        let staff = {};

        let isValid = true;

        [...formEl.elements].forEach(function(field, index){

            if (['nome_staff'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            staff[field.name] = field.value;
           
           });

           if (!isValid){
               return false;
           }
    
           return new Staff( 
            staff.nome_rede,
            staff.filial,
            staff.matricula,
            staff.funcao, 
            staff.estado_ativo, 
            staff.cpf, 
            staff.rg, 
            staff.name, 
            staff.sobrenome, 
            staff.gender, 
            staff.ddd, 
            staff.celular, 
            staff.ddd_fixo, 
            staff.telFixo, 
            staff.data_nascimento,
            staff.data_admissao, 
            staff.data_demissao,
            staff.email, 
            staff.password, 
            staff.permissoes, 
            staff.horario_inicio_acesso, 
            staff.horario_termino_acesso, 
            staff.cep, 
            staff.endereco, 
            staff.numero, 
            staff.complemento, 
            staff.bairro, 
            staff.cidade, 
            staff.estado, 
            staff.pais, 
            staff.cnpj, 
            staff.ie, 
            staff.imunicipal, 
            staff.razaoSocial, 
            staff.nomeFantasia, 
            staff.ddd_farmacia, 
            staff.celular_farmacia, 
            staff.ddd_fixo_farmacia, 
            staff.fone_fixo_farmacia, 
            staff.contato, 
            staff.funcao_contato, 
            staff.horario_abertura_loja, 
            staff.horario_fechamento_loja, 
            staff.observacoes, 
            staff.photo,             
           );
    }


    selectAll(){

        let staff = Staff.getStaffsStorage();

        staff.forEach(dataStaff=>{

            let staff = new Staff();

            staff.loadFromJSON(dataStaff);

            this.addLine(staff);

        });

    }

    addLine(dataStaff){

        let tr = this.getTr(dataStaff);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataStaff, tr = null){

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.staff = JSON.stringify(dataStaff);

        tr.innerHTML = `
    
            <td><img src="${dataStaff.photo}" alt="Cinque Terre" style="width: 45px" class="img-roundedimg-sm"></td>
            <td>${dataStaff.name}</td>
            <td>${dataStaff.celular}</td>
            <td>${dataStaff.email}</td>
            <td>${dataStaff.nome_rede}</td>   
            <td>${dataStaff.cidade}</td>
            <td>${dataStaff.estado}</td>
            <td>${dataStaff.estado_ativo}</td>
            <td>${Utils.dateFormat(dataStaff.register)}</td>
            
            
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

                let staff = new Staff();

                staff.loadFromJSON(JSON.parse(tr.dataset.staff));

                staff.remove();

                tr.remove();

                this.updateCount();
            }

        });   
            
        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.staff);

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

    /*showListStaffs(){

        document.querySelector("#box-staff-list").style.display = "block";
        document.querySelector("#box-staff-create").style.display = "none";
        document.querySelector("#box-staff-update").style.display = "none";
        

    }*/

    showPanelCreate(){

       // document.querySelector("#box-staff-list").style.display = "none";
        document.querySelector("#box-staff-create").style.display = "block";
        document.querySelector("#box-staff-update").style.display = "none";

    }

    showPanelUpdate(){

        //document.querySelector("#box-staff-list").style.display = "none";
        document.querySelector("#box-staff-create").style.display = "none";
        document.querySelector("#box-staff-update").style.display = "block";

    }

    updateCount(){

        let numberStaffs = 0;

        let numberLojas = 0;

        let numberUsers = 0;

        [...this.tableEl.children].forEach(tr=>{

            numberStaffs++;
            //numberStaffs++;
           // numberUsers++;
            //let lojas = JSON.parse(tr.dataset.staff);

           //if (staff._cnpj) numberLojas++;

            
        });

        document.querySelector("#number-staff").innerHTML = numberStaffs;
        //document.querySelector("#number-lojas").innerHTML = numberLojas;
       // document.querySelector("#number-users").innerHTML = numberUsers;
    }

};