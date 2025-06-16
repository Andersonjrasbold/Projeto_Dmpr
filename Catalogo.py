from flask import Flask, request, jsonify
import pandas as pd
from io import BytesIO
from your_module import Acesso  # Ajuste o nome correto se for diferente

app = Flask(__name__)

@app.route('/importar-produtos', methods=['POST'])
def importar_produtos():
    try:
        # Lê o arquivo Excel enviado
        file = request.files.get('file')
        if not file:
            return jsonify({"status": "erro", "mensagem": "Nenhum arquivo enviado"}), 400

        df = pd.read_excel(BytesIO(file.read()))

        # Garante que temos uma coluna chamada 'EAN'
        if 'EAN' not in df.columns or 'Quantidade' not in df.columns:
            return jsonify({"status": "erro", "mensagem": "Arquivo inválido. Colunas necessárias: EAN e Quantidade"}), 400

        lista_eans = df['EAN'].dropna().astype(str).tolist()
        lista_quantidades = df[['EAN', 'Quantidade']].dropna()

        if not lista_eans:
            return jsonify({"status": "erro", "mensagem": "Nenhum EAN encontrado no arquivo"}), 400

        # Consulta os produtos no banco
        produtos_do_banco = buscar_produtos_por_eans(lista_eans)

        # Prepara o catálogo para o frontend
        catalogo = []
        for produto in produtos_do_banco:
            catalogo.append({
                "ean": str(produto['CODBARRA_PRODUTO']),
                "nome": produto['NOME_PRODUTO'],
                "preco": float(produto['PRECO_DESCONTO']),
                "imagem": f"/static/fotos/{produto['COD_PRODUTO']}.jpg"
            })

        # Lista de produtos + quantidade (para cruzar depois no JS)
        lista_produtos_quantidade = []
        for _, row in lista_quantidades.iterrows():
            lista_produtos_quantidade.append({
                "ean": str(row['EAN']),
                "quantidade": int(row['Quantidade'])
            })

        return jsonify({
            "status": "ok",
            "catalogo": catalogo,
            "lista_de_produtos": lista_produtos_quantidade
        })

    except Exception as e:
        print(e)
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


def buscar_produtos_por_eans(lista_eans):
    con = Acesso.get_connection()
    cur = con.cursor()

    formato_in = ",".join(["?" for _ in lista_eans])

    query = f"""
    SELECT 
        COD_PRODUTO,
        CODBARRA_PRODUTO,
        NOME_PRODUTO,
        PRVENDA_PRODUTO,
        CASE
            WHEN EMPROMOCAO = 'N' THEN PRVENDA_PRODUTO
            ELSE PRVENDA_PRODUTO * (1 - DESCPROMOCAO_PRODUTO / 100)
        END AS PRECO_DESCONTO
    FROM PRODUTOS
    WHERE CODBARRA_PRODUTO IN ({formato_in})
    """

    cur.execute(query, lista_eans)

    colunas = [desc[0] for desc in cur.description]
    produtos = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    cur.close()
    con.close()

    return produtos
