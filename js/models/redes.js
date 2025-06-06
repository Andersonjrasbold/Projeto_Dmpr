class Rede {

    constructor(matricula, nome_rede, filial, grupo_economico, numero_lojas, estado_ativo, cnpj, ie, imunicipal, razaoSocial, nomeFantasia, ddd_farmacia, 
        celular_farmacia, ddd_fixo_farmacia,  fone_fixo_farmacia, contato, funcao, cep, endereco, numero, complemento, bairro, cidade, estado,
        pais, email_xml, nome_socio_principal, sobrenome_socio_principal, ddd_socio_principal, celular_socio_principal, email_socio_principal, nome_socio_secundario, sobrenome_socio_secundario, ddd_socio_secundario,
        celular_socio_secundario, email_socio_secundario, horario_abertura_loja, horario_fechamento_loja, observacoes, taxa_min_pedido, horario_inicio_entrega, horario_termino_entrega, custo_km, tempo_medio_entrega, primeira_taxa_custo, 
        primeira_taxa_km, segunda_taxa_custo, segunda_taxa_km, terceira_taxa_custo, terceira_taxa_km,
         photo){
        
        this._id;    
        this._matricula = matricula;
        this._nome_rede = nome_rede;
        this._filial = filial; 
        this._grupo_economico = grupo_economico;
        this._numero_lojas = numero_lojas; 
        this._estado_ativo = estado_ativo; 
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
        this._funcao = funcao;
        this._cep = cep;
        this._endereco = endereco;
        this._numero = numero;
        this._complemento = complemento;
        this._bairro = bairro;
        this._cidade = cidade;
        this._estado = estado;
        this._pais = pais; 
        this._email_xml = email_xml; 
        this._nome_socio_principal = nome_socio_principal;
        this._sobrenome_socio_principal = sobrenome_socio_principal;
        this._ddd_socio_principal = ddd_socio_principal;
        this._celular_socio_principal = celular_socio_principal;
        this._email_socio_principal = email_socio_principal;
        this._nome_socio_secundario = nome_socio_secundario;
        this._sobrenome_socio_secundario = sobrenome_socio_secundario;
        this._ddd_socio_secundario = ddd_socio_secundario;
        this._celular_socio_secundario = celular_socio_secundario;
        this._email_socio_secundario = email_socio_secundario;  
        this._horario_abertura_loja = horario_abertura_loja;
        this._horario_fechamento_loja = horario_fechamento_loja;
        this._observacoes = observacoes;
        this._taxa_min_pedido = taxa_min_pedido;
        this._horario_inicio_entrega = horario_inicio_entrega;
        this._horario_termino_entrega = horario_termino_entrega;
        this._custo_km = custo_km;
        this._tempo_medio_entrega = tempo_medio_entrega;
        this._primeira_taxa_custo = primeira_taxa_custo;
        this._primeira_taxa_km = primeira_taxa_km;
        this._segunda_taxa_custo = segunda_taxa_custo;
        this._segunda_taxa_km = segunda_taxa_km;  
        this._terceira_taxa_custo = terceira_taxa_custo;
        this._terceira_taxa_km = terceira_taxa_km;
        this._photo = photo;          
        this._register = new Date();
    }

    get id(){

        return this._id;
    }

    get matricula(){
    
        return this._matricula;
    
    }

    get nome_rede(){
    
        return this._nome_rede;
    
    }

    get filial(){
    
        return this._filial;
    
    }

    get grupo_economico(){
    
        return this._grupo_economico;
    
    }

    get numero_lojas(){
    
        return this._numero_lojas;
    
    }
    get estado_ativo(){
    
        return this._estado_ativo;
    
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

    get funcao(){
    
        return this._funcao;
    
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

    get email_xml(){
    
        return this._email_xml;
    
    }

    get nome_socio_principal(){
    
        return this._nome_socio_principal;
    
    }

    get sobrenome_socio_principal(){
    
        return this._sobrenome_socio_principal;
    
    }

    get ddd_socio_principal(){
    
        return this._ddd_socio_principal;
    
    }

    get celular_socio_principal(){
    
        return this._celular_socio_principal;
    
    }

    get email_socio_principal(){
    
        return this._email_socio_principal;
    
    }

    get nome_socio_secundario(){
    
        return this._nome_socio_secundario;
    
    }

    get sobrenome_socio_secundario(){
    
        return this._sobrenome_socio_secundario;
    
    }

    get ddd_socio_secundario(){
    
        return this._ddd_socio_secundario;
    
    }

    get celular_socio_secundario(){
    
        return this._celular_socio_secundario;
    
    }

    get email_socio_secundario(){
    
        return this._email_socio_secundario;
    
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

    get taxa_min_pedido(){
    
        return this._taxa_min_pedido;
    
    }

    get horario_inicio_entrega(){
    
        return this._horario_inicio_entrega;
    
    }

    get horario_termino_entrega(){
    
        return this._horario_termino_entrega;
    
    }

    get custo_km(){
    
        return this._custo_km;
    
    }

    get tempo_medio_entrega(){
    
        return this._tempo_medio_entrega;
    
    }

    get primeira_taxa_custo(){
    
        return this._primeira_taxa_custo;
    
    }

    get primeira_taxa_km(){
    
        return this._primeira_taxa_km;
    
    }

    get segunda_taxa_custo(){
    
        return this._segunda_taxa_custo;
    
    }

    get segunda_taxa_km(){
    
        return this._segunda_taxa_km;
    
    }

    get terceira_taxa_custo(){
    
        return this._terceira_taxa_custo;
    
    }

    get terceira_taxa_km(){
    
        return this._terceira_taxa_km;
    
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

    static getRedesStorage(){
        
        let redes = [];

        if (localStorage.getItem("redes")) {

            redes = JSON.parse(localStorage.getItem("redes"));

        }

        return redes;
    }

    getNewID(){

        let redesID = parseInt(localStorage.getItem("redesID"));

        if (!redesID) redesID = 0;

        redesID++;

        localStorage.setItem("redesID", redesID);

        return redesID;

    }

    save(){

        let redes = Rede.getRedesStorage();

        if (this.id > 0){

            redes.map(u => {
                
                if (u._id == this.id){

                    Object.assign(u, this);

                }

                return u;

            });

        } else {

            this._id = this.getNewID();

            redes.push(this);

            
        } 

        localStorage.setItem("redes", JSON.stringify(redes));

    }

    remove(){

        let redes = Rede.getRedesStorage();

        redes.forEach((redeData, index)=>{

            if (this.id == redeData._id){

                redes.splice(index, 1);

            }
        });

        localStorage.setItem("redes", JSON.stringify(redes));

    }
}