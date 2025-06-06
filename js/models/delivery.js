class Delivery {

    constructor(matricula, cnpj, razaoSocial, nome_rede, filial, estado_ativo, cep, endereco, numero, complemento, bairro, cidade, 
        estado, pais, taxa_min_pedido, horario_inicio_entrega, horario_termino_entrega, custo_km, tempo_medio_entrega, primeira_taxa_custo, 
        primeira_taxa_km, segunda_taxa_custo, segunda_taxa_km, terceira_taxa_custo, terceira_taxa_km, observacoes, photo){
        
        this._id;    
        this._matricula = matricula;
        this._cnpj = cnpj;
        this._razaoSocial = razaoSocial;
        this._nome_rede = nome_rede;
        this._filial = filial; 
        this._estado_ativo = estado_ativo; 
        this._cep = cep;
        this._endereco = endereco;
        this._numero = numero;
        this._complemento = complemento;
        this._bairro = bairro;
        this._cidade = cidade;
        this._estado = estado;
        this._pais = pais; 
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
        this._observacoes = observacoes;
        this._photo = photo;          
        this._register = new Date();
    }

    get id(){

        return this._id;
    }

    get matricula(){
    
        return this._matricula;
    
    }

    get cnpj(){
    
        return this._cnpj;
    
    }

    get razaoSocial(){
    
        return this._razaoSocial;
    
    }

    get nome_rede(){
    
        return this._nome_rede;
    
    }

    get filial(){
    
        return this._filial;
    
    }

    get estado_ativo(){
    
        return this._estado_ativo;
    
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

    static getDeliverysStorage(){
        
        let deliverys = [];

        if (localStorage.getItem("deliverys")) {

            deliverys = JSON.parse(localStorage.getItem("deliverys"));

        }

        return deliverys;
    }

    getNewID(){

        let deliveryID = parseInt(localStorage.getItem("deliveryID"));

        if (!deliveryID) deliveryID = 0;

        deliveryID++;

        localStorage.setItem("deliveryID", deliveryID);

        return deliveryID;

    }

    save(){

        let deliverys = Delivery.getDeliverysStorage();

        if (this.id > 0){

            deliverys.map(u => {
                
                if (u._id == this.id){

                    Object.assign(u, this);

                }

                return u;

            });

        } else {

            this._id = this.getNewID();

            deliverys.push(this);

            
        } 

        localStorage.setItem("deliverys", JSON.stringify(deliverys));

    }

    remove(){

        let deliverys = Delivery.getDeliverysStorage();

        deliverys.forEach((deliveryData, index)=>{

            if (this.id == deliveryData._id){

                deliverys.splice(index, 1);

            }
        });

        localStorage.setItem("deliverys", JSON.stringify(deliverys));

    }
}