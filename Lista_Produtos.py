import Acesso

def get_produtos(filtro_laboratorio=None):
    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        COD_PRODUTO,
        CODBARRA_PRODUTO,
        NOME_PRODUTO,
        L.NOME_LABORATORIO,
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
            ELSE PRVENDA_PRODUTO * (1 - DESCPROMOCAO_PRODUTO / 100)
        END AS PRECO_DESCONTO
    FROM PRODUTOS P
    LEFT JOIN CLASSES c ON P.CODCLASSE_PRODUTO = C.COD_CLASSE
    LEFT JOIN CATEGORIAS c2 ON P.CATEGORIA_PRODUTO = c2.COD_CATEGORIA
    LEFT JOIN LABORATORIOS L ON P.CODFABRICANTE_PRODUTO = L.COD_LABORATORIO
    WHERE STATUS_PRODUTO = 1
        AND CATEGORIA_PRODUTO NOT IN ('26','13','29','14')
        AND COD_CLASSE NOT IN (4,5,6,7,9,10)
        AND ESTOQUE_PRODUTO > 0
        --AND COD_PRODUTO <= 100
    """

    params = []

    if filtro_laboratorio:
        query += " AND L.NOME_LABORATORIO = ?"
        params.append(filtro_laboratorio)

    query += " ORDER BY NOME_PRODUTO"

    cur.execute(query, params)
    colunas = [desc[0] for desc in cur.description]
    produtos = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    cur.close()
    con.close()

    return produtos

def get_produtos_promocao():
    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        COD_PRODUTO,
        CODBARRA_PRODUTO,
        NOME_PRODUTO,
        L.NOME_LABORATORIO,
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
            ELSE PRVENDA_PRODUTO * (1 - DESCPROMOCAO_PRODUTO / 100)
        END AS PRECO_DESCONTO
    FROM PRODUTOS P
    LEFT JOIN CLASSES c ON P.CODCLASSE_PRODUTO = C.COD_CLASSE
    LEFT JOIN CATEGORIAS c2 ON P.CATEGORIA_PRODUTO = c2.COD_CATEGORIA
    LEFT JOIN LABORATORIOS L ON P.CODFABRICANTE_PRODUTO = L.COD_LABORATORIO
    WHERE STATUS_PRODUTO = 1
        AND EMPROMOCAO <> 'N'
        AND CATEGORIA_PRODUTO NOT IN ('26','13','29','14')
        AND COD_CLASSE NOT IN (4,5,6,7,9,10)
        AND ESTOQUE_PRODUTO > 0
        AND COD_PRODUTO <= 100
    ORDER BY NOME_PRODUTO
    """

    cur.execute(query)
    colunas = [desc[0] for desc in cur.description]
    produtos = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    cur.close()
    con.close()

    return produtos

def get_laboratorios():
    con = Acesso.get_connection()
    cur = con.cursor()

    query = "SELECT DISTINCT NOME_LABORATORIO FROM LABORATORIOS ORDER BY NOME_LABORATORIO"

    cur.execute(query)
    laboratorios = [linha[0] for linha in cur.fetchall()]

    cur.close()
    con.close()

    return laboratorios
