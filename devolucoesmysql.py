from AcessoOutroBanco import get_mysql_connection

def get_devolucoes():
    con = get_mysql_connection()
    cur = con.cursor()

    query = """
    SELECT id, numero_nf, motivo, tipo_devolucao, status, data_solicitacao
    FROM solicitacoes_devolucao
    ORDER BY data_solicitacao DESC
    """

    cur.execute(query)
    colunas = [desc[0] for desc in cur.description]
    devolucoes = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    cur.close()
    con.close()

    return devolucoes