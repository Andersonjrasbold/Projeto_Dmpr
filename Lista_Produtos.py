import Acesso

def get_produtos():
    # Abre a conexão
    con = Acesso.get_connection()
    cur = con.cursor()
    p = ""

    # Define a query
    query = """
SELECT 
        COD_PRODUTO,
        CODBARRA_PRODUTO,
        NOME_PRODUTO,
        C.NOME_CLASSE,
        c2.NOME_CATEGORIA,
        EMPROMOCAO AS PROMOCAO,
        CASE
			WHEN EMPROMOCAO = 'N' THEN NULL
			ELSE DTFINALPROMOCAO_PRODUTO
		END AS DATA_FIM_PROMOCAO,
		CASE
			WHEN EMPROMOCAO = 'N' THEN NULL
			ELSE DESCPROMOCAO_PRODUTO
		END AS DESCONTO,
        PRVENDA_PRODUTO,
        CASE
	        WHEN EMPROMOCAO = 'N' THEN PRVENDA_PRODUTO
	        ELSE PRVENDA_PRODUTO * (1-DESCPROMOCAO_PRODUTO/50) 
	        END AS PRECO_DESCONTO
        
        
FROM PRODUTOS P
LEFT JOIN CLASSES c ON P.CODCLASSE_PRODUTO = C.COD_CLASSE
LEFT JOIN CATEGORIAS c2 ON P.CATEGORIA_PRODUTO  = c2.COD_CATEGORIA

WHERE STATUS_PRODUTO = 1
	AND CATEGORIA_PRODUTO NOT IN ('26','13','29','14')
    AND COD_PRODUTO <= 50
    AND COD_CLASSE NOT IN (4,5,6,7,9,10)
    --AND ESTOQUE_PRODUTO > 0
ORDER BY NOME_PRODUTO
    """

    # Executa a consulta
    cur.execute(query)

    # Colunas da consulta
    colunas = [desc[0] for desc in cur.description]

    # Converte resultados para lista de dicionários
    produtos = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    # Fecha a conexão
    cur.close()
    con.close()

    return produtos

# Teste para rodar direto no terminal
if __name__ == '__main__':
    produtos = get_produtos()
    for p in produtos:
        print(p)
