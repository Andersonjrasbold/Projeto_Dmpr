import Acesso

def get_financeiro_por_cliente(cliente_id):
    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        CLI.NOME_CLIENTE,
        PC.COD_PARCELACONTA,
        CAST(C.DATA_CONTA AS DATE) AS DATA_VENDA,
        CAST(PC.DATAVENC_PARCELACONTA AS DATE) AS DATA_VENCIMENTO,
        CASE 
            WHEN PC.SITUACAO_PARCELACONTA = 0 THEN 'PENDENTE'
            WHEN PC.SITUACAO_PARCELACONTA = 1 THEN 'QUITADA'
            ELSE 'CANCELADA'
        END AS STATUS,
        C.NNOTA_CONTA AS NOTA_FISCAL,
        F.DESCRICAO_FORMASPG,
        PC.VALOR_PARCELACONTA AS VALOR_TOTAL,
        PC.PAGO_PARCELACONTA AS VALOR_PAGO,
        PC.VALOR_PARCELACONTA - PC.PAGO_PARCELACONTA AS VALOR_PENDENTE
    FROM PARCELASCONTA PC  
    LEFT JOIN CONTAS C ON PC.CODCONTA_PARCELACONTA = C.COD_CONTA
    LEFT JOIN CLIENTES CLI ON C.CODFAVOR_CONTA = CLI.COD_CLIENTE AND C.TIPOFAVOR_CONTA = 'C'
    LEFT JOIN FORMASPG F ON C.CODFPG_CONTA = F.COD_FORMASPG
    WHERE C.TIPOFAVOR_CONTA = 'C'
      AND C.TIPO_CONTA = 1
      AND CLI.COD_CLIENTE = ?
    ORDER BY PC.DATAVENC_PARCELACONTA
    """

    try:
        cur.execute(query, (cliente_id,))
        colunas = [desc[0] for desc in cur.description]
        financeiro = [dict(zip(colunas, linha)) for linha in cur.fetchall()]
        print(f"Total de registros financeiros para cliente {cliente_id}: {len(financeiro)}")
        return financeiro
    except Exception as e:
        print(f"Erro ao buscar financeiro: {e}")
        return []
    finally:
        cur.close()
        con.close()
