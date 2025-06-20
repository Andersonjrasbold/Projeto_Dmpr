import Acesso

def get_pedidos_por_cliente(cliente_id):
    try:
        cliente_id = int(cliente_id)
    except Exception as e:
        print(f"Erro ao converter cliente_id para inteiro: {e}")
        return []

    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        COD_VENDA, 
        DATA_VENDA, 
        CODVENDEDOR_VENDA, 
        CODCLIENTE_VENDA,
        CODCONTA_VENDA,
        CODTRANSP_VENDA,
        ICMSSUBST_VENDA, 
        ICMSTRIBUTADO_VENDA,
        CASE
	        WHEN STATUS_VENDA = 1 THEN 'FATURADO' ELSE 'CANCELADO' END AS STATUS_VENDA,
        CODCONTACOMISSAO_VENDA,
        TOTAL_VENDA, 
        HORA_VENDA,
        CODCONVENIO_VENDA,
        CASE
	        WHEN TIPOOPERACAO = 1 THEN 'VENDA' ELSE 'BONIFICAÇÃO' END AS OPERACAO,

        TOTALDEVOLVIDO_VENDA,
        CODNOTA_VENDA,
        QUANTVOL_VENDA, 
        TIPO_VENDA, 
        SALDOVENDA_VENDA, 
        CODTELEOP_VENDA, 
        DTUPDATE_VENDA
    FROM VENDAS
    WHERE 1=1 
    AND CODCLIENTE_VENDA = ?
    ORDER BY DATA_VENDA DESC
    """

    try:
        cur.execute(query, (cliente_id,))
        colunas = [desc[0] for desc in cur.description]
        pedidos = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

        print(f"\n--- Lista de pedidos para cliente {cliente_id} ---")
        for pedido in pedidos:
            print(pedido)
        print(f"--- Total de pedidos: {len(pedidos)} ---\n")

        return pedidos

    except Exception as e:
        print(f"Erro ao buscar pedidos no banco: {e}")
        return []

    finally:
        cur.close()
        con.close()


# ✅ TESTE DIRETO (se rodar python pedidos.py no terminal)
if __name__ == '__main__':
    
    cliente_teste = 2551  # Coloque o código de cliente que você quer testar
    get_pedidos_por_cliente(cliente_teste)
