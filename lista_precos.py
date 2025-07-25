import Acesso
from clientes import get_cliente_por_id

def get_lista_precos_por_cliente(cliente_id):
    cliente = get_cliente_por_id(cliente_id)
    if not cliente:
        print("Cliente não encontrado.")
        return []

    id_lista = cliente.get("COD_LISTA_PRECO")
    if not id_lista:
        print("Cliente não possui lista de preço definida.")
        return []

    print(f"Buscando lista de preços com ID = {id_lista}")  # Debug

    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT DISTINCT
            CODLISTAPR_CLIV AS ID,
            LISTA.CODPROD AS COD_PRODUTO,
            P.CODBARRA_PRODUTO,
            P.NOME_PRODUTO,
            CASE
                WHEN F.NOME_FORMULA = 'P. Ativo Não Informado' 
                THEN C.NOME_CLASSE 
                ELSE F.NOME_FORMULA END AS PRINCIPIO_ATIVO,
                
            L.NOME_LABORATORIO,
            C.NOME_CLASSE,
            c2.NOME_CATEGORIA,
            EMPROMOCAO AS PROMOCAO,
            LISTA.PRVENDA,
            LISTA.PRVENDA_COM_DESC
        FROM LISTA_PRECOS_atual LISTA
        LEFT JOIN CLI_VENDEDORES CLIV 	ON LISTA.ID = CODLISTAPR_CLIV
        LEFT JOIN PRODUTOS P 			ON LISTA.CODPROD = P.COD_PRODUTO
        LEFT JOIN CLASSES c 			ON P.CODCLASSE_PRODUTO = C.COD_CLASSE
        LEFT JOIN CATEGORIAS c2 		ON P.CATEGORIA_PRODUTO = c2.COD_CATEGORIA
        LEFT JOIN LABORATORIOS L 		ON P.CODFABRICANTE_PRODUTO = L.COD_LABORATORIO
        LEFT JOIN FORMULAS F			ON P.CODFORMULA_PRODUTO = F.COD_FORMULA
        
        WHERE CLIV.POSICAO_CLIV = 1
        AND STATUS_PRODUTO = 1
        AND CATEGORIA_PRODUTO NOT IN ('26','13','29','14')
        AND COD_CLASSE NOT IN (4,5,6,7,9,10)
        AND ESTOQUE_PRODUTO > 0
        AND COD_PRODUTO <= 100
        AND LISTA.ID = ?
        
        ORDER BY P.NOME_PRODUTO
        
    """

    try:
        cur.execute(query, (id_lista,))
        colunas = [desc[0] for desc in cur.description]
        precos = [dict(zip(colunas, row)) for row in cur.fetchall()]
        print(f"{len(precos)} preços encontrados.")  # Debug
        return precos

    except Exception as e:
        print(f"Erro ao buscar lista de preços: {e}")
        return []

    finally:
        cur.close()
        con.close()
