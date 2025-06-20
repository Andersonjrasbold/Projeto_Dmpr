import Acesso

def get_devolucoes_por_cliente(cliente_id):
    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        c.COD_CLIENTE,
		c.NOME_CLIENTE,
      	CAST(v.DATA_VENDA AS DATE) AS DATA_VENDA,
        CAST(D.DATA_DEVOLUCAO AS DATE) AS DATA_DEVOLUCAO,
        CASE
	        WHEN d.STATUS_DEVOLUCAO = 1 THEN 'ATIVO'
	        WHEN d.STATUS_DEVOLUCAO = 0 THEN 'CANCELADO'
	        ELSE 'ESTORNO' END AS STATUS,
        D.OBS_DEVOLUCAO AS MOTIVO_DEVOLUCAO,
        V.CODNOTA_VENDA AS NOTA_VENDA,
        D.CODNOTA_DEVOLUCAO AS NOTA_DEVOLUCAO,
        P.COD_PRODUTO,
        P.NOME_PRODUTO,
        SUM(QNT_DEVOLUCAO) AS QTD_DEVOLUCAO,
        SUM(SUBTOTAL_DEVOLUCAO) AS VLR_DEVOLUCAO,							--VALOR SEM ST
        SUM(SUBTOTAL_DEVOLUCAO) + SUM(ST_DEVOLUCAO) AS VLR_DEVOLUCAO_ST  	--VALOR COM ST
        
    FROM DEVOLUCOES d 
    LEFT JOIN VENDAS v 		ON D.CODVENDA_DEVOLUCAO = v.COD_VENDA
    LEFT JOIN CLIENTES c	ON v.CODCLIENTE_VENDA = c.COD_CLIENTE
    LEFT JOIN PRODUTOS P	ON D.CODPRODUTO_DEVOLUCAO = P.COD_PRODUTO
    
    WHERE c.COD_CLIENTE = ?
    
    GROUP BY
    	C.COD_CLIENTE,
		C.NOME_CLIENTE,
      	CAST(V.DATA_VENDA AS DATE),
        CAST(D.DATA_DEVOLUCAO AS DATE),
        D.STATUS_DEVOLUCAO,
        D.OBS_DEVOLUCAO,
        V.CODNOTA_VENDA,
        D.CODNOTA_DEVOLUCAO,
        P.COD_PRODUTO,
        P.NOME_PRODUTO
    """

    try:
        cur.execute(query, (cliente_id,))
        colunas = [desc[0] for desc in cur.description]
        devolucoes = [dict(zip(colunas, linha)) for linha in cur.fetchall()]
        print(f"Total de devoluções para o cliente {cliente_id}: {len(devolucoes)}")
        return devolucoes
    except Exception as e:
        print(f"Erro ao buscar devoluções: {e}")
        return []
    finally:
        cur.close()
        con.close()

