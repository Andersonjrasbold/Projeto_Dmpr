from flask import Flask, render_template, redirect, url_for, request, jsonify, session
import Lista_Produtos
import clientes
import pandas as pd
from io import BytesIO
import Acesso

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_segura'  # Importante para a session

# Página inicial
@app.route('/')
def index():
    return redirect(url_for('loja'))

# Página de login (formulário GET)
@app.route('/login')
def pagina_login():
    lista_clientes = clientes.get_clientes()
    print(f"Total de clientes carregados: {len(lista_clientes)}")
    return render_template('login.html', clientes=lista_clientes)

# Processamento do login (POST)
@app.route('/login', methods=['POST'])
def login_post():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    con = Acesso.get_connection()
    cur = con.cursor()

    query = """
    SELECT COD_CLIENTE, NOME_CLIENTE, CGC_CLIENTE
    FROM CLIENTES
    WHERE CGC_CLIENTE = ? AND SENHAEPED_CLIENTE = ?
    """

    cur.execute(query, (username, password))
    cliente = cur.fetchone()

    cur.close()
    con.close()

    if cliente:
        session['cliente_id'] = cliente[0]
        session['cliente_nome'] = cliente[1]
        session['cliente_cnpj'] = cliente[2]

        return jsonify(status='ok', cnpj=cliente[2])  # <-- Enviando o CNPJ ao JavaScript
    else:
        return jsonify(status='erro', mensagem='Credenciais inválidas')

# Protegendo a loja (só entra logado)
@app.route('/loja')
def loja():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))

    lista_produtos = Lista_Produtos.get_produtos()
    print(f"Total de produtos carregados: {len(lista_produtos)}")
    return render_template('loja.html', produtos=lista_produtos)

# Protegendo também a lista de produtos
@app.route('/produtos')
def produtos():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))

    lista_produtos = Lista_Produtos.get_produtos()
    return render_template('produtos.html', produtos=lista_produtos)

# Rota de logout
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('pagina_login'))

# Importar produtos via Excel
@app.route('/importar-produtos', methods=['POST'])
def importar_produtos():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"status": "erro", "mensagem": "Nenhum arquivo enviado"}), 400

        df = pd.read_excel(BytesIO(file.read()))

        if 'EAN' not in df.columns or 'Quantidade' not in df.columns:
            return jsonify({"status": "erro", "mensagem": "Arquivo inválido. Precisa de colunas: EAN e Quantidade"}), 400

        lista_eans = df['EAN'].dropna().astype(str).tolist()
        produtos_do_banco = buscar_produtos_por_eans(lista_eans)

        catalogo = []
        for produto in produtos_do_banco:
            catalogo.append({
                "ean": str(produto['CODBARRA_PRODUTO']),
                "nome": produto['NOME_PRODUTO'],
                "preco": float(produto['PRECO_DESCONTO']),
                "imagem": f"/static/fotos/{produto['COD_PRODUTO']}.jpg"
            })

        lista_produtos_quantidade = []
        for _, row in df.iterrows():
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
        print("Erro na importação:", e)
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

def buscar_produtos_por_eans(lista_eans):
    con = Acesso.get_connection()
    cur = con.cursor()

    placeholders = ",".join(["?" for _ in lista_eans])

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
    WHERE CODBARRA_PRODUTO IN ({placeholders})
    """

    cur.execute(query, lista_eans)
    colunas = [desc[0] for desc in cur.description]
    produtos = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    cur.close()
    con.close()

    return produtos

if __name__ == '__main__':
    app.run(debug=True)
