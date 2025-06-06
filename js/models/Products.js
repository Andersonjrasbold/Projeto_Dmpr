class Product{
    constructor (codigo_produto, codigo_barras, nome_comercial, dosagem, unidade_medida, conteudo, tipo, estado_ativo, principio_ativo, 
        fabricante, caixa_padrao, ipi, icms, pis_cofins, pf, pmc, categoria, subcategorias, classe_terapeutica, indicacao, tipo_desconto, 
        controlado, desconto, lucro, tipo_item, estoque, lote, comissão, validade, ultima_venda, observacoes, photo){

        this._id;    
        this._codigo_produto = codigo_produto;
        this._codigo_barras = codigo_barras;
        this._nome_comercial = nome_comercial;
        this._dosagem = dosagem;
        this._unidade_medida = unidade_medida;
        this._conteudo = conteudo;
        this._tipo = tipo;
        this._estado_ativo = estado_ativo;
        this._principio_ativo = principio_ativo;
        this._fabricante = fabricante;
        this._caixa_padrao = caixa_padrao;
        this._ipi = ipi;
        this._icms = icms;
        this._pis_cofins = pis_cofins;
        this._pf = pf;
        this._pmc = pmc;
        this._categoria = categoria;
        this._subcategorias = subcategorias;
        this._classe_terapeutica = classe_terapeutica;
        this._indicacao = indicacao;
        this._tipo_desconto = tipo_desconto;
        this._controlado = controlado; 
        this._desconto = desconto;
        this._lucro = lucro;
        this._tipo_item = tipo_item;
        this._estoque = estoque;
        this._lote = lote;
        this._comissão = comissão;
        this._validade = validade;
        this._ultima_venda = ultima_venda;
        this._observacoes = observacoes;
        this._photo = photo;
        this._register = new Date();
    };

    get id(){

        return this._id;
    }

     get codigo_produto(){
    
        return this._codigo_produto;
    
    }

    get codigo_barras(){
    
        return this._codigo_barras;
    
    }

    get nome_comercial(){
    
        return this._nome_comercial;
    
    }

    get dosagem(){
    
        return this._dosagem;
    
    }

    get unidade_medida(){
    
        return this._unidade_medida;
    
    }

    get conteudo(){
    
        return this._conteudo;
    
    }

    get tipo(){
    
        return this._tipo;
    
    }

    get estado_ativo(){
    
        return this._estado_ativo;
    
    }

    get principio_ativo(){
    
        return this._principio_ativo;
    
    }

    get fabricante(){
    
        return this._fabricante;
    
    }

    get caixa_padrao(){

        return this._caixa_padrao;
        
    }

    get ipi(){

        return this._ipi;
        
    }
    get icms(){

        return this._icms;
        
    }

    get pis_cofins(){

        return this._pis_cofins;
        
    }

    get pf(){
    
        return this._pf;
    
    }

    get pmc(){
    
        return this._pmc;
    
    }

    get categoria(){
    
        return this._categoria;
    
    }

    get subcategorias(){
    
        return this._subcategorias;
    
    }
    
    get classe_terapeutica(){
    
        return this._classe_terapeutica;
    
    }

    get indicacao(){
    
        return this._indicacao;
    
    }

    get tipo_desconto(){
    
        return this._tipo_desconto;
    
    }

    get controlado(){
    
        return this._controlado;
    
    }

    get desconto(){
    
        return this._desconto;
    
    }

    get lucro(){
    
        return this._lucro;
    
    }

    get tipo_item(){
    
        return this._tipo_item;
    
    }

    get estoque(){
    
        return this._estoque;
    
    }

    get lote(){
    
        return this._lote;
    
    }

    get comissão(){
    
        return this._comissão;
    
    }

    get validade(){
    
        return this._validade;
    
    }

    get ultima_venda(){
    
        return this._ultima_venda;
    
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

    

    static getProductsStorage(){
        
        let products = [];

        if (localStorage.getItem("products")) {

            products = JSON.parse(localStorage.getItem("products"));

        }

        return products;
    }

    getNewID(){

        let productsID = parseInt(localStorage.getItem("productsID"));

        if (!productsID) productsID = 0;

        productsID++;

        localStorage.setItem("productsID", productsID);

        return productsID;

    }

    

    save(){

        let products = Product.getProductsStorage();

        if (this.id > 0){

            products.map(u => {
                
                if (u._id == this.id){

                    Object.assign(u, this);

                }

                return u;

            });

        } else {

            this._id = this.getNewID();

            products.push(this);

            
        } 

        localStorage.setItem("products", JSON.stringify(products));

    }

    remove(){

        let products = Product.getProductsStorage();

        products.forEach((productData, index)=>{

            if (this.id == productData._id){

                products.splice(index, 1);

            }
        });

        localStorage.setItem("products", JSON.stringify(products));

    }

};

