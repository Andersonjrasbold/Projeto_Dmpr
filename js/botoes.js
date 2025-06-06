class UsuarioCadastro{
    constructor (nome, sobrenome, cpf, email, ddd, celular, funcao, login, senhaPadrao, permissoesAcesso){
        this.nome = nome
        this.sobrenome = sobrenome
        this.cpf = cpf
        this.email = email
        this.ddd = ddd
        this.celular = celular
        this.funcao = funcao
        this.login = login
        this.senhaPadrao = senhaPadrao
        this.permissoesAcesso = permissoesAcesso
    }
}

function userCadastroOferta(){
    let nome = document.getElementById('nome')
    let sobrenome = document.getElementById('sobrenome')
    let cpf = document.getElementById('cpf')
    let email = document.getElementById('email')
    let ddd = document.getElementById('ddd')
    let celular = document.getElementById('celular')
    let funcao = document.getElementById('funcao')
    let login = document.getElementById('login')
    let senhaPadrao = document.getElementById('senhaPadrao')
    let permissoesAcesso = document.getElementById('permissoesAcesso')

    let userCadastroOferta = new UsuarioCadastro(
        nome.value,
        sobrenome.value,
        cpf.value,
        email.value,
        ddd.value,
        celular.value,
        funcao.value,
        login.value,
        senhaPadrao.value,
        permissoesAcesso.value,
    )
    console.log(userCadastroOferta)
}



function cadastrarUserOferta(){
    alert("ola")
}

function pesquisarOfertasCadastradas(){
    alert("ola");
}

class cadastrarOferta{
    constructor (codigo_barras, nome_comercial, principio_ativo, dosagem, unidade_medida, conteudo, tipo, fabricante, categoria, subcategorias, classe_terapeutica, indicacao, preco_atual, desconto, novo_preco, publicar_em, valido_ate){
        this.codigo_barras = codigo_barras
        this.nome_comercial = nome_comercial
        this.principio_ativo = principio_ativo
        this.dosagem = dosagem
        this.unidade_medida = unidade_medida
        this.conteudo = conteudo
        this.tipo = tipo
        this.fabricante = fabricante
        this.categoria = categoria
        this.subcategorias = subcategorias
        this.classe_terapeutica = classe_terapeutica
        this.indicacao = indicacao
        this.preco_atual = preco_atual
        this.desconto = desconto
        this.novo_preco = novo_preco
        this.publicar_em = publicar_em
        this.valido_ate = valido_ate
    }
}

function salvarOferta(){
    let codigo_barras = document.getElementById('codigo_barras')
    let nome_comercial = document.getElementById('nome_comercial')
    let principio_ativo = document.getElementById('principio_ativo')
    let dosagem = document.getElementById('dosagem')
    let unidade_medida = document.getElementById('unidade_medida')
    let conteudo = document.getElementById('conteudo')
    let tipo = document.getElementById('codigo_barras')
    let fabricante = document.getElementById('fabricante')
    let categoria = document.getElementById('categoria')
    let subcategorias = document.getElementById('subcategorias')
    let classe_terapeutica = document.getElementById('classe_terapeutica')
    let indicacao = document.getElementById('indicacao')
    let preco_atual = document.getElementById('preco_atual')
    let desconto = document.getElementById('desconto')
    let novo_preco = document.getElementById('novo_preco')
    let publicar_em = document.getElementById('publicar_em')
    let valido_ate = document.getElementById('valido_ate')

    let salvarOferta = new cadastrarOferta(
        codigo_barras.value,
        nome_comercial.value,
        principio_ativo.value,
        dosagem.value,
        unidade_medida.value,
        conteudo.value,
        tipo.value,
        fabricante.value,
        categoria.value,
        subcategorias.value,
        classe_terapeutica.value,
        indicacao.value,
        preco_atual.value,
        desconto.value,
        novo_preco.value,
        publicar_em.value,
        valido_ate.value,
        
    )
    console.log(salvarOferta)
    
}

function publicarOferta(){
    alert("Sua oferta foi Publicada com Sucesso!");
}

function checkoutCadastrados(){
    alert("ola");
    
}

class cadastrarUserCheckout{
    constructor(nome, sobrenome, endereco, foto_perfil, cpf, email, funcao, ddd, celular, permissoesAcesso, horario_inicio_acesso, horario_termino_acesso, login, senha_padrao){
        this.nome = nome
        this.sobrenome = sobrenome
        this.endereco = endereco
        this.foto_perfil = foto_perfil
        this.cpf = cpf
        this.email = email
        this.funcao = funcao
        this.ddd = ddd
        this.celular = celular
        this.permissoesAcesso = permissoesAcesso
        this.horario_inicio_acesso = horario_inicio_acesso
        this.horario_termino_acesso = horario_termino_acesso
        this.login = login
        this.senha_padrao = senha_padrao
    }
}

function cadastrarUsuarioCheckout(){
    let nome = document.getElementById('nome')
    let sobrenome = document.getElementById('sobrenome')
    let endereco = document.getElementById('endereco')
    let foto_perfil = document.getElementById('foto_perfil')
    let cpf = document.getElementById('cpf')
    let email = document.getElementById('email')
    let funcao = document.getElementById('funcao')
    let ddd = document.getElementById('ddd')
    let celular = document.getElementById('celular')
    let permissoesAcesso = document.getElementById('permissoesAcesso')
    let horario_inicio_acesso = document.getElementById('horario_inicio_acesso')
    let horario_termino_acesso = document.getElementById('horario_termino_acesso')
    let login = document.getElementById('login')
    let senhaPadrao = document.getElementById('senha_padrao')
    

    let cadastrarUsuarioCheckout = new cadastrarUserCheckout(
        nome.value,
        sobrenome.value,
        endereco.value,
        foto_perfil.value,
        cpf.value,
        email.value,
        funcao.value,
        ddd.value,
        celular.value,
        permissoesAcesso.value,
        horario_inicio_acesso.value,
        horario_termino_acesso.value,
        login.value,
        senhaPadrao.value
        
        
    )
    console.log(cadastrarUsuarioCheckout)
}

function infoLojasDelivery(){
    alert("ola");
}


class atualizarInformacoes{
    constructor(horario_inicio_entrega, horario_termino_entrega, tempo_medio_entrega, taxa_min_pedido, taxa_de_primeiro, taxa_ate_primeiro, taxa_de_segundo, taxa_ate_segundo, taxa_de_terceiro, taxa_ate_terceiro){
        this.horario_inicio_entrega = horario_inicio_entrega
        this.horario_termino_entrega = horario_termino_entrega
        this.tempo_medio_entrega = tempo_medio_entrega
        this.taxa_min_pedido = taxa_min_pedido
        this.taxa_de_primeiro = taxa_de_primeiro
        this.taxa_ate_primeiro = taxa_ate_primeiro
        this.taxa_de_segundo = taxa_de_segundo
        this.taxa_ate_segundo = taxa_ate_segundo
        this.taxa_de_terceiro = taxa_de_terceiro
        this.taxa_ate_terceiro = taxa_ate_terceiro
        
    }
}

function infoDelivery(){
    let horario_inicio_entrega = document.getElementById('horario_inicio_entrega')
    let horario_termino_entrega = document.getElementById('horario_termino_entrega')
    let tempo_medio_entrega = document.getElementById('tempo_medio_entrega')
    let taxa_min_pedido = document.getElementById('taxa_min_pedido')
    let taxa_de_primeiro = document.getElementById('taxa_de_primeiro')
    let taxa_ate_primeiro = document.getElementById('taxa_ate_primeiro')
    let taxa_de_segundo = document.getElementById('taxa_de_segundo')
    let taxa_ate_segundo = document.getElementById('taxa_ate_segundo')
    let taxa_de_terceiro = document.getElementById('taxa_de_terceiro')
    let taxa_ate_terceiro = document.getElementById('taxa_ate_terceiro')

    let infoDelivery = new atualizarInformacoes(
        horario_inicio_entrega.value,
        horario_termino_entrega.value,
        tempo_medio_entrega.value,
        taxa_min_pedido.value,
        taxa_de_primeiro.value,
        taxa_ate_primeiro.value,
        taxa_de_segundo.value,
        taxa_ate_segundo.value,
        taxa_de_terceiro.value,
        taxa_ate_terceiro.value,
        
        
        
    )
    console.log(infoDelivery)
}

function lojasCadastradas(){
    alert("ola");
}


class cadastrarNovaLoja{
    constructor(cnpj, ie, razaoSocial, nomeFantasia, horario_abertura_loja, horario_fechamento_loja, cep, endereco, numero, complemento, bairro, cidade, estado){
        this.cnpj = cnpj
        this.ie = ie
        this.razaoSocial = razaoSocial
        this.nomeFantasia = nomeFantasia
        this.horario_abertura_loja = horario_abertura_loja
        this.horario_fechamento_loja = horario_fechamento_loja
        this.cep = cep
        this.endereco = endereco
        this.numero = numero
        this.complemento = complemento
        this.bairro = bairro
        this.cidade = cidade
        this.estado = estado

    }
}

function cadastrarLoja(){
    let cnpj = document.getElementById('cnpj')
    let ie = document.getElementById('ie')
    let razaoSocial = document.getElementById('razaoSocial')
    let nomeFantasia = document.getElementById('nomeFantasia')
    let horario_abertura_loja = document.getElementById('horario_abertura_loja')
    let horario_fechamento_loja = document.getElementById('horario_fechamento_loja')
    let cep = document.getElementById('cep')
    let endereco = document.getElementById('endereco')
    let numero = document.getElementById('numero')
    let complemento = document.getElementById('complemento')
    let bairro = document.getElementById('bairro')
    let cidade = document.getElementById('cidade')
    let estado = document.getElementById('estado')

    let cadastrarLoja = new cadastrarNovaLoja(
        cnpj.value,
        ie.value,
        razaoSocial.value,
        nomeFantasia.value,
        horario_abertura_loja.value,
        horario_fechamento_loja.value,
        cep.value,
        endereco.value,
        numero.value,
        complemento.value,
        bairro.value,
        cidade.value,
        estado.value,
        
    )
    console.log(cadastrarLoja)
    alert('Loja cadastrada com Sucesso!')
}
