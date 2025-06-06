class User{
    constructor (name, sobrenome, estado_ativo, cpf, rg, ddd, celular, ddd_fixo, telFixo, data_nascimento, gender,  email, password,   
        validation_password,  cep, endereco, numero, complemento, bairro, cidade, estado, pais, observacoes, permissoes,  photo){

        this._id;    
        this._name = name;
        this._sobrenome = sobrenome;
        this._estado_ativo = estado_ativo;
        this._cpf = cpf;
        this._rg = rg;
        this._ddd = ddd;
        this._celular = celular;
        this._ddd_fixo = ddd_fixo;
        this._telFixo = telFixo;
        this._data_nascimento = data_nascimento;
        this._gender = gender;
        this._email = email;
        this._password = password;
        this._validation_password = validation_password;
        this._cep = cep;
        this._endereco = endereco;
        this._numero = numero;
        this._complemento = complemento;
        this._bairro = bairro;
        this._cidade = cidade;
        this._estado = estado;
        this._pais = pais; 
        this._observacoes = observacoes;
        this._permissoes = permissoes;
        this._photo = photo;
        this._register = new Date();
    };

    get id(){

        return this._id;
    }

     get name(){
    
        return this._name;
    
    }

    get sobrenome(){
    
        return this._sobrenome;
    
    }

    get estado_ativo(){
    
        return this._estado_ativo;
    
    }

    get cpf(){
    
        return this._cpf;
    
    }

    get rg(){
    
        return this._rg;
    
    }

    get ddd(){
    
        return this._ddd;
    
    }

    get celular(){
    
        return this._celular;
    
    }

    get ddd_fixo(){
    
        return this._ddd_fixo;
    
    }

    get telFixo(){
    
        return this._telFixo;
    
    }

    get data_nascimento(){
    
        return this._data_nascimento;
    
    }

    get gender(){

        return this._gender;
        
    }

    get email(){

        return this._email;
        
    }
    get password(){

        return this._password;
        
    }

    get validation_password(){

        return this._validation_password;
        
    }

    get cep(){
    
        return this._cep;
    
    }

    get endereco(){
    
        return this._endereco;
    
    }

    get numero(){
    
        return this._numero;
    
    }

    get complemento(){
    
        return this._complemento;
    
    }
    
    get bairro(){
    
        return this._bairro;
    
    }

    get cidade(){
    
        return this._cidade;
    
    }

    get estado(){
    
        return this._estado;
    
    }

    get pais(){
    
        return this._pais;
    
    }

    get observacoes(){
    
        return this._observacoes;
    
    }
    
    get permissoes(){

        return this._permissoes;
        
    }
    
   
    get photo(){

        return this._photo;
        
    }
    
    get register(){

        return this._register;
        
    }

    set photo(value){
        this._photo = value;
    }

    loadFromJSON(json){

        for (let name in json){

            switch(name){

                case '_register':
                    this[name] = new Date(json[name]);
                break;
                default:
                    this[name] = json[name];

                
            }

            
        }
    }

    

    static getUsersStorage(){
        
        let users = [];

        if (localStorage.getItem("users")) {

            users = JSON.parse(localStorage.getItem("users"));

        }

        return users;
    }

    getNewID(){

        let usersID = parseInt(localStorage.getItem("usersID"));

        if (!usersID) usersID = 0;

        usersID++;

        localStorage.setItem("usersID", usersID);

        return usersID;

    }

    

    save(){

        let users = User.getUsersStorage();

        if (this.id > 0){

            users.map(u => {
                
                if (u._id == this.id){

                    Object.assign(u, this);

                }

                return u;

            });

        } else {

            this._id = this.getNewID();

            users.push(this);

            
        } 

        localStorage.setItem("users", JSON.stringify(users));

    }

    remove(){

        let users = User.getUsersStorage();

        users.forEach((userData, index)=>{

            if (this.id == userData._id){

                users.splice(index, 1);

            }
        });

        localStorage.setItem("users", JSON.stringify(users));

    }

};

