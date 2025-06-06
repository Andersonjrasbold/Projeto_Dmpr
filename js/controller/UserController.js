
class UserController{
    constructor(formIdCreate, formIdUpdate, tableId ){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            
            this.showPanelCreate();
        
        });

        this.formUpdateEl.addEventListener("submit", event=>{

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIdex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

             this.getPhoto(this.formUpdateEl).then((content) => {

                if (!values.photo) {

                    result._photo = userOld._photo;

                } else {

                    result._photo = content;

                }
                
                let user = new User();

                user.loadFromJSON(result);

                user.save();

                this.getTr(user, tr);

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

        document.querySelector("#box-user-list .btn-list").addEventListener("click", e=>{
            
            this.showListUser();
        
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

        let user = {};

        let isValid = true;

        [...formEl.elements].forEach(function(field, index){

            if (['nome_user'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            user[field.name] = field.value;
           
           });

           if (!isValid){
               return false;
           }
    
           return new User( 
            user.name, 
            user.sobrenome,
            user.estado_ativo,
            user.cpf, 
            user.rg,
            user.ddd, 
            user.celular,
            user.ddd_fixo, 
            user.telFixo,
            user.data_nascimento,
            user.gender, 
            user.email, 
            user.password, 
            user.validation_password, 
            user.cep, 
            user.endereco, 
            user.numero, 
            user.complemento, 
            user.bairro, 
            user.cidade, 
            user.estado, 
            user.pais, 
            user.observacoes,
            user.permissoes, 
            user.photo,              
           );
    }
    

    selectAll(){

        let user = User.getUsersStorage();

        user.forEach(dataUser=>{

            let user = new User();

            user.loadFromJSON(dataUser);

            this.addLine(user);

        });

    }

    addLine(dataUser){

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataUser, tr = null){

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
    
            <td><img src="${dataUser.photo}" alt="Cinque Terre" style="width: 45px" class="img-roundedimg-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.celular}</td>
            <td>${dataUser.email}</td>  
            <td>${dataUser.cidade}</td>
            <td>${dataUser.permissoes}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>${dataUser.estado_ativo}</td>
            
            
            
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

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();

                this.updateCount();
            }

        });   
            
        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.user);

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

    /*showListUsers(){

        document.querySelector("#box-user-list").style.display = "block";
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "none";
        

    }*/

    showPanelCreate(){

       // document.querySelector("#box-user-list").style.display = "none";
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";

    }

    showPanelUpdate(){

        //document.querySelector("#box-user-list").style.display = "none";
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";

    }

    updateCount(){

        let numberUsers = 0;

        let numberLojas = 0;

        

        [...this.tableEl.children].forEach(tr=>{

            numberUsers++;
            //numberUsers++;
           // numberUsers++;
            //let lojas = JSON.parse(tr.dataset.user);

           //if (user._cnpj) numberLojas++;

            
        });

        document.querySelector("#number-user").innerHTML = numberUsers;
        //document.querySelector("#number-lojas").innerHTML = numberLojas;
       // document.querySelector("#number-users").innerHTML = numberUsers;
    }
}

