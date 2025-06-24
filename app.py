from flask import Flask, render_template, redirect, url_for, request, jsonify, session, send_from_directory, make_response
import pandas as pd
from io import BytesIO
import Acesso
import AcessoOutroBanco
import Lista_Produtos
from Lista_Produtos import get_produtos_promocao, get_laboratorios
import clientes
from clientes import get_cliente_por_id
from pedidos import get_pedidos_por_cliente
from financeiro import get_financeiro_por_cliente
from devolucoes import get_devolucoes_por_cliente
from flask import Flask, make_response
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_segura'

# Página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Login GET
@app.route('/login')
def pagina_login():
    lista_clientes = clientes.get_clientes()
    return render_template('login.html', clientes=lista_clientes)

# Login POST
@app.route('/login', methods=['POST'])
def login_post():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    con = Acesso.get_connection()
    cur = con.cursor()
    cur.execute("""
        SELECT COD_CLIENTE, NOME_CLIENTE, CGC_CLIENTE
        FROM CLIENTES
        WHERE CGC_CLIENTE = ? AND SENHAEPED_CLIENTE = ?
    """, (username, password))
    cliente = cur.fetchone()
    cur.close()
    con.close()

    if cliente:
        session['cliente_id'] = cliente[0]
        session['cliente_nome'] = cliente[1]
        session['cliente_cnpj'] = cliente[2]
        return jsonify(status='ok', cnpj=cliente[2])
    else:
        return jsonify(status='erro', mensagem='Credenciais inválidas')

# Loja
@app.route('/loja')
def loja():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))
    produtos = Lista_Produtos.get_produtos()
    return render_template('loja.html', produtos=produtos)

@app.route('/boleto/<int:numero>')
def gerar_boleto(numero):
    try:
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Margens
        left_margin = 20 * mm
        top_margin = height - 20 * mm

        # Cabeçalho
        p.setFont("Helvetica-Bold", 16)
        p.drawString(left_margin, top_margin, "BOLETO BANCÁRIO")

        # Dados do cliente
        p.setFont("Helvetica", 12)
        p.drawString(left_margin, top_margin - 20, f"Número do Boleto: {numero}")
        p.drawString(left_margin, top_margin - 40, "Beneficiário: Empresa Exemplo Ltda")
        p.drawString(left_margin, top_margin - 60, "Pagador: Cliente Exemplo")
        p.drawString(left_margin, top_margin - 80, "Valor: R$ 150,00")
        p.drawString(left_margin, top_margin - 100, "Vencimento: 25/06/2025")

        # Linha digitável (código de barras em texto)
        p.setFont("Courier-Bold", 14)
        p.drawString(left_margin, top_margin - 140, "34191.79001 01043.510047 91020.150008 7 12345678900015")

        # Faixa de recorte
        p.setStrokeColorRGB(0, 0, 0)
        p.line(left_margin, top_margin - 150, width - left_margin, top_margin - 150)

        # Rodapé
        p.setFont("Helvetica-Oblique", 8)
        p.drawString(left_margin, 20 * mm, "Este boleto é apenas um exemplo gerado por Flask + ReportLab.")

        p.showPage()
        p.save()

        pdf = buffer.getvalue()
        buffer.close()

        response = make_response(pdf)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'inline; filename=boleto_{numero}.pdf'

        return response

    except Exception as e:
        return f"Erro ao gerar boleto: {e}", 500

# Produtos
@app.route('/produtos')
def produtos():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))
    filtro = request.args.get('laboratorio')
    produtos = Lista_Produtos.get_produtos(filtro_laboratorio=filtro)
    laboratorios = get_laboratorios()
    return render_template('produtos.html', produtos=produtos, laboratorios=laboratorios)

# Promoções
@app.route('/promocoes')
def promocoes():
    produtos = get_produtos_promocao()
    return render_template('promocoes.html', produtos=produtos)

# Conta
@app.route('/conta')
def conta():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))
    cliente = get_cliente_por_id(session['cliente_id'])
    if not cliente:
        return "Cliente não encontrado", 404
    return render_template('conta.html', cliente=cliente)

# Histórico de pedidos
@app.route('/historico')
def historico_pedidos():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))
    pedidos = get_pedidos_por_cliente(session['cliente_id'])
    return render_template('historico.html', pedidos=pedidos)

# Financeiro
@app.route('/financeiro')
def financeiro():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))
    financeiro = get_financeiro_por_cliente(session['cliente_id'])
    return render_template('financeiro.html', financeiro=financeiro)

# Dashboard
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# Chamado
@app.route('/chamado')
def chamado():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))
    pedidos = get_pedidos_por_cliente(session['cliente_id'])
    return render_template('chamado.html', pedidos=pedidos)

# Devoluções por cliente
@app.route('/devolucoes')
def listar_devolucoes():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))
    devolucoes = get_devolucoes_por_cliente(session['cliente_id'])
    return render_template('devolucoes.html', devolucoes=devolucoes)

@app.route('/atualizar_status_chamado', methods=['POST'])
def atualizar_status_chamado():
    try:
        chamado_id = request.form.get('chamado_id')
        acao = request.form.get('acao')

        # Mapear as ações para status
        mapa_status = {
            'finalizar': 'Concluído',
            'Recusar': 'Cancelado',
            'Aceitar_solicitar': 'Enviar NF de Devolução',
            'Outra Ação': 'Em análise'  # Exemplo, você pode definir como quiser
        }

        novo_status = mapa_status.get(acao)

        if not novo_status:
            return f"Ação inválida: {acao}", 400

        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor()

        query = """
        UPDATE solicitacoes_devolucao
        SET status = %s
        WHERE id = %s
        """
        cur.execute(query, (novo_status, chamado_id))
        con.commit()

        cur.close()
        con.close()

        print(f"Chamado {chamado_id} atualizado para status: {novo_status}")
        return redirect(url_for('listar_chamados_devolucao'))

    except Exception as e:
        print(f"Erro ao atualizar status do chamado: {e}")
        return f"Erro ao atualizar chamado: {e}", 500


# ✅ Nova Rota: Chamados de Devolução (MySQL)
@app.route('/devolucoes_chamados')
def listar_chamados_devolucao():
    try:
        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor(dictionary=True)

        query = """
        SELECT id, cliente_id, data_solicitacao, valor, status, motivo, numero_nf
        FROM solicitacoes_devolucao
        ORDER BY data_solicitacao DESC
        """
        cur.execute(query)
        chamados = cur.fetchall()

        cur.close()
        con.close()

        # Agora busca o nome de cada cliente no Firebird
        for chamado in chamados:
            cliente_id = chamado.get('cliente_id')
            cliente = get_cliente_por_id(cliente_id)
            if cliente:
                chamado['cliente'] = cliente['NOME_CLIENTE']
            else:
                chamado['cliente'] = 'Cliente não encontrado'

        return render_template('devolucoes_chamados.html', chamados=chamados)

    except Exception as e:
        print(f"Erro ao buscar chamados de devolução: {e}")
        return f"Erro ao buscar chamados: {e}", 500


@app.route('/acompanhar_devolucoes')
def acompanhar_devolucoes():
    try:
        cliente_id = session.get('cliente_id')

        if not cliente_id:
            return redirect(url_for('pagina_login'))

        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor(dictionary=True)

        query = """
        SELECT id, numero_nf, motivo, tipo_devolucao, status, data_solicitacao
        FROM solicitacoes_devolucao
        WHERE cliente_id = %s
        ORDER BY data_solicitacao DESC
        """
        cur.execute(query, (cliente_id,))
        devolucoes = cur.fetchall()

        cur.close()
        con.close()

        return render_template('acompanhar_devolucoes.html', devolucoes=devolucoes)

    except Exception as e:
        print(f"Erro ao buscar devoluções do cliente: {e}")
        return f"Erro ao buscar devoluções: {e}", 500



# Enviar nova devolução
@app.route('/enviar_devolucao', methods=['POST'])
def enviar_devolucao():
    try:
        numero_nota = request.form.get('numero_nota')
        motivo = request.form.get('motivo')
        tipo_devolucao = request.form.get('tipo_devolucao')
        valor = request.form.get('valor')  # <-- Novo campo valor vindo do formulário
        cliente_id = session.get('cliente_id')

        if not cliente_id:
            return redirect(url_for('pagina_login'))

        # Se o valor vier vazio, força para 0
        if not valor:
            valor = 0

        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor()

        query = """
        INSERT INTO solicitacoes_devolucao (numero_nf, motivo, tipo_devolucao, status, cliente_id, valor)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cur.execute(query, (numero_nota, motivo, tipo_devolucao, 'PENDENTE', cliente_id, valor))
        con.commit()

        cur.close()
        con.close()

        print(f"Devolução cadastrada: Nota {numero_nota}, Cliente {cliente_id}, Valor {valor}")
        return redirect(url_for('loja'))

    except Exception as e:
        print(f"Erro ao enviar devolução: {e}")
        return f"Erro ao enviar devolução: {e}", 500



# Importação de produtos via Excel
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
        produtos = buscar_produtos_por_eans(lista_eans)

        return jsonify({"status": "ok", "produtos": produtos})

    except Exception as e:
        print(f"Erro na importação: {e}")
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

def buscar_produtos_por_eans(lista_eans):
    con = Acesso.get_connection()
    cur = con.cursor()
    placeholders = ",".join(["?" for _ in lista_eans])

    query = f"""
    SELECT COD_PRODUTO, CODBARRA_PRODUTO, NOME_PRODUTO, PRVENDA_PRODUTO
    FROM PRODUTOS
    WHERE CODBARRA_PRODUTO IN ({placeholders})
    """
    cur.execute(query, lista_eans)
    colunas = [desc[0] for desc in cur.description]
    produtos = [dict(zip(colunas, linha)) for linha in cur.fetchall()]
    cur.close()
    con.close()
    return produtos

# PDF Viewer
@app.route('/pdf/<nome_arquivo>')
def visualizar_pdf(nome_arquivo):
    try:
        return send_from_directory('static/pdf', nome_arquivo, mimetype='application/pdf')
    except Exception as e:
        return f"Erro ao carregar o PDF: {e}", 404

# Debug session
@app.route('/debug_session')
def debug_session():
    return jsonify(dict(session))

# Logout
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('pagina_login'))

# Cache Headers
@app.after_request
def add_header(response):
    if request.path.startswith('/static/fotos/'):
        response.headers['Cache-Control'] = 'public, max-age=31536000'
    return response

# Iniciar o Flask
if __name__ == '__main__':
    app.run(debug=True)
