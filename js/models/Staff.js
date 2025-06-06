class Staff{

    constructor(nome_rede, filial, matricula, funcao, estado_ativo, cpf, rg, name, sobrenome, gender, ddd, celular, ddd_fixo, 
        telFixo, data_nascimento, data_admissao, data_demissao, email, password, permissoes, horario_inicio_acesso, horario_termino_acesso, 
        cep, endereco, numero, complemento, bairro, cidade, estado, pais, cnpj, ie, imunicipal, razaoSocial, nomeFantasia, ddd_farmacia,
        celular_farmacia, ddd_fixo_farmacia, fone_fixo_farmacia, contato, funcao_contato, horario_abertura_loja, horario_fechamento_loja,
        observacoes, photo){
        
        this._id;   
        this._nome_rede = nome_rede; 
        this._filial = filial;
        this._matricula = matricula;
        this._funcao = funcao;
        this._estado_ativo = estado_ativo;
        this._cpf = cpf;
        this._rg = rg;
        this._name = name;
        this._sobrenome = sobrenome;
        this._gender = gender;
        this._ddd = ddd;
        this._celular = celular;
        this._ddd_fixo = ddd_fixo;
        this._telFixo = telFixo;
        this._data_nascimento = data_nascimento;
        this._data_admissao = data_admissao;
        this._data_demissao = data_demissao;
        this._email = email;
        this._password = password;
        this._permissoes = permissoes;
        this._horario_inicio_acesso = horario_inicio_acesso;
        this._horario_termino_acesso = horario_termino_acesso;
        this._cep = cep;
        this._endereco = endereco;
        this._numero = numero;
        this._complemento = complemento;
        this._bairro = bairro;
        this._cidade = cidade;
        this._estado = estado;
        this._pais = pais; 
        this._cnpj = cnpj;
        this._ie = ie;
        this._imunicipal = imunicipal;
        this._razaoSocial = razaoSocial;
        this._nomeFantasia = nomeFantasia;
        this._ddd_farmacia = ddd_farmacia;
        this._celular_farmacia = celular_farmacia;
        this._ddd_fixo_farmacia = ddd_fixo_farmacia;
        this._fone_fixo_farmacia = fone_fixo_farmacia;
        this._contato = contato;
        this._funcao_contato = funcao_contato;
        this._horario_abertura_loja = horario_abertura_loja;
        this._horario_fechamento_loja = horario_fechamento_loja;
        this._observacoes = observacoes; 
        this._photo = photo;          
        this._register = new Date();
    }

    get id(){

        return this._id;
    }

    get nome_rede(){
    
        return this._nome_rede;
    
    }

    get filial(){
    
        return this._filial;
    
    }
    
    get matricula(){
    
        return this._matricula;
    
    }

    get funcao(){
    
        return this._funcao;
    
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

    get name(){
    
        return this._name;
    
    }

    get sobrenome(){
    
        return this._sobrenome;
    
    }

    get gender(){
    
        return this._gender;
    
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

    get data_admissao(){
    
        return this._data_admissao;
    
    }

    get data_demissao(){
    
        return this._data_demissao;
    
    }

    get email(){
    
        return this._email;
    
    }

    get password(){
    
        return this._password;
    
    }

    get permissoes(){
    
        return this._permissoes;
    
    }

    get horario_inicio_acesso(){
    
        return this._horario_inicio_acesso;
    
    }

    get horario_termino_acesso(){
    
        return this._horario_termino_acesso;
    
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

    get cnpj(){
    
        return this._cnpj;
    
    }

    get ie(){
    
        return this._ie;
    
    }

    get imunicipal(){
    
        return this._imunicipal;
    
    }

    get razaoSocial(){
    
        return this._razaoSocial;
    
    }

    get nomeFantasia(){
    
        return this._nomeFantasia;
    
    }

    get ddd_farmacia(){
    
        return this._ddd_farmacia;
    
    }

    get celular_farmacia(){
    
        return this._celular_farmacia;
    
    }

    get ddd_fixo_farmacia(){
    
        return this._ddd_fixo_farmacia;
    
    }

    get fone_fixo_farmacia(){
    
        return this._fone_fixo_farmacia;
    
    }

    get contato(){
    
        return this._contato;
    
    }

    get funcao_contato(){
    
        return this.funcao_contato;
    
    }

    get horario_abertura_loja(){
    
        return this._horario_abertura_loja;
    
    }

    get horario_fechamento_loja(){
    
        return this._horario_fechamento_loja;
    
    }

    get observacoes(){
    
        return this._observacoes;
    
    }

    get photo(){
    
        return this._photo;
    
    }

    get register(){
    
        return this._register;
    
    }

    set  photo(value){

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

    

    static getStaffsStorage(){
        
        let staffs = [];

        if (localStorage.getItem("staffs")) {

            staffs = JSON.parse(localStorage.getItem("staffs"));

        }

        return staffs;
    }

    getNewID(){

        let staffsID = parseInt(localStorage.getItem("staffsID"));

        if (!staffsID) staffsID = 0;

        staffsID++;

        localStorage.setItem("staffsID", staffsID);

        return staffsID;

    }

    getNewMatricula(){

        let staffsMatricula = parseInt(localStorage.getItem("staffsMatricula"));

        if (!staffsMatricula) staffsMatricula = 10;

        staffsMatricula++;

        localStorage.setItem("staffsMatricula", staffsMatricula);

        return staffsMatricula;

    }

    getNewFilial(){

        let staffsFilial = parseInt(localStorage.getItem("staffsFilial"));

        if (!staffsFilial) staffsFilial = 0;

        staffsFilial++;

        localStorage.setItem("staffsFilial", staffsFilial);

        return staffsFilial;

    }

    save(){

        let staffs = Staff.getStaffsStorage();

        if (this.id > 0){

            staffs.map(u => {
                
                if (u._id == this.id){

                    Object.assign(u, this);

                }

                return u;

            });

        } else {

            this._id = this.getNewID();
            this._matricula = this.getNewMatricula();
            this._filial = this.getNewFilial();
            staffs.push(this);

            
        } 

        localStorage.setItem("staffs", JSON.stringify(staffs));

    }

    remove(){

        let staffs = Staff.getStaffsStorage();

        staffs.forEach((staffData, index)=>{

            if (this.id == staffData._id){

                staffs.splice(index, 1);

            }
        });

        localStorage.setItem("staffs", JSON.stringify(staffs));

    }
}