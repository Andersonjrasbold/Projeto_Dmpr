import Acesso

def get_clientes():
    con = Acesso.get_connection()
    cur = con.cursor()

    query = """SELECT COD_CLIENTE, NOME_CLIENTE, SENHAEPED_CLIENTE, CGC_CLIENTE AS CNPJ_CLIENTE FROM CLIENTES """

    cur.execute(query)
    colunas = [desc[0] for desc in cur.description]
    clientes = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    cur.close()
    con.close()

    return clientes


# Teste direto no terminal
if __name__ == '__main__':
    clientes = get_clientes()
    for cliente in clientes:
        print(cliente)