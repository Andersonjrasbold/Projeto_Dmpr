import Acesso

def get_clientes():
    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        COD_CLIENTE, 
        ENDER_CLIENTE, 
        BAIRRO_CLIENTE, 
        FONER_CLIENTE, 
        CELULAR_CLIENTE, 
        CEP_CLIENTE, 
        CREDITO_CLIENTE,
        EMAIL_CLIENTE, 
        INSCRICAO_CLIENTE, 
        SALDODEVOLUCAO_CLIENTE,
        VLCOMPRA_CLIENTE,
        CODCONVENIO_CLIENTE,
        ENDERECO_COMPLETO, 
        EMAILNFE_CLIENTE, 
        NOME_CLIENTE, 
        SENHAEPED_CLIENTE, 
        CGC_CLIENTE AS CNPJ_CLIENTE
    FROM CLIENTES
    """

    print("Executando busca de TODOS os clientes...")  # Debug

    cur.execute(query)
    colunas = [desc[0] for desc in cur.description]
    clientes = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    print(f"Total de clientes encontrados: {len(clientes)}")  # Debug

    cur.close()
    con.close()

    return clientes

def get_cliente_por_id(cliente_id):
    try:
        cliente_id = int(cliente_id)  # Forçando o tipo inteiro
    except Exception as e:
        print(f"Erro convertendo cliente_id para int: {e}")
        return None

    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        COD_CLIENTE, 
        ENDER_CLIENTE, 
        BAIRRO_CLIENTE, 
        FONER_CLIENTE, 
        CELULAR_CLIENTE, 
        CEP_CLIENTE, 
        CREDITO_CLIENTE,
        EMAIL_CLIENTE, 
        INSCRICAO_CLIENTE, 
        SALDODEVOLUCAO_CLIENTE,
        VLCOMPRA_CLIENTE,
        CODCONVENIO_CLIENTE,
        ENDERECO_COMPLETO, 
        EMAILNFE_CLIENTE, 
        NOME_CLIENTE, 
        SENHAEPED_CLIENTE, 
        COALESCE(CLIV.CODLISTAPREPED_CLIV,CLIV.CODLISTAPR_CLIV) COD_LISTA_PRECO,
        CGC_CLIENTE AS CNPJ_CLIENTE
    FROM CLIENTES
    LEFT JOIN CLI_VENDEDORES CLIV ON COD_CLIENTE = CLIV.CODCLI_CLIV AND POSICAO_CLIV = 1
    WHERE COD_CLIENTE = ?
    """

    print(f"Buscando cliente no banco com ID: {cliente_id}")  # Debug

    try:
        cur.execute(query, (cliente_id,))
        linha = cur.fetchone()

        if linha:
            colunas = [desc[0] for desc in cur.description]
            cliente = dict(zip(colunas, linha))
            print("Cliente encontrado:", cliente)  # Debug
            return cliente
        else:
            print(f"Nenhum cliente encontrado no banco para o ID: {cliente_id}")
            return None

    except Exception as e:
        print(f"Erro ao buscar cliente no banco: {e}")
        return None

    finally:
        cur.close()
        con.close()
