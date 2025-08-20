from flask import Flask, render_template, redirect, url_for, request, jsonify, session, send_from_directory, make_response
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from werkzeug.utils import secure_filename
import os
import pandas as pd
from io import BytesIO
import Acesso
import AcessoOutroBanco
import Lista_Produtos
from Lista_Produtos import get_produtos
from Lista_Produtos import get_produtos_promocao, get_laboratorios
import clientes
from clientes import get_cliente_por_id
from pedidos import get_pedidos_por_cliente
from financeiro import get_financeiro_por_cliente
from devolucoes import get_devolucoes_por_cliente
from flask import make_response
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from io import BytesIO
from flask import request, jsonify, session
import mysql.connector
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from functools import wraps
from flask import session, redirect, url_for, request 
import re
from lista_precos import get_lista_precos_por_cliente
from flask import Flask
import re
from flask import Blueprint, request, jsonify
import pandas as pd
import io
from flask import request, jsonify
import os, io, csv, datetime
from ftp_utils import upload_bytes
from dotenv import load_dotenv
load_dotenv()


bp = Blueprint('importacao', __name__)

def _csv_pedido_bytes(cnpj: str, prazo: str, itens: list) -> bytes:
    """
    Gera CSV (UTF-8 BOM) com colunas:
    CNPJ, Prazo, EAN, Nome, Quantidade, Preco, Total
    """
    output = io.StringIO(newline='')
    writer = csv.writer(output, delimiter=';', lineterminator='\n')
    writer.writerow(["CNPJ", "Prazo", "EAN", "Nome", "Quantidade", "Preco", "Total"])

    for it in itens:
      ean  = str(it.get("codBarra") or "").strip()
      nome = (it.get("nome") or "").strip()
      qtd  = int(it.get("quantidade") or 0)
      preco= float(it.get("preco") or 0.0)
      tot  = float(it.get("total") or (qtd * preco))
      writer.writerow([cnpj, prazo, ean, nome, qtd, f"{preco:.2f}", f"{tot:.2f}"])

    # Excel-friendly: UTF-8 com BOM
    csv_text = output.getvalue()
    return ("\ufeff" + csv_text).encode("utf-8")



@bp.route('/api/importar_pedido', methods=['POST'])
def importar_pedido():
    if 'arquivo' not in request.files:
        return jsonify({'erro': 'Arquivo não enviado.'}), 400
    f = request.files['arquivo']
    try:
        df = pd.read_excel(io.BytesIO(f.read()))
        def norm(s): 
            return str(s or '').strip().lower()
        registros = []
        for _, row in df.iterrows():
            cnpj = ''.join(ch for ch in str(row.get('CNPJ', '') ) if ch.isdigit())
            ean = str(row.get('EAN', '')).strip() or str(row.get('CODBARRA','')).strip()
            qtd = float(str(row.get('Quantidade', row.get('QTD', 0))).replace(',','.')) if row.get('Quantidade', None) is not None else 0
            desc = str(row.get('Descricao', row.get('Produto',''))).strip()
            preco = float(str(row.get('Preco', row.get('Valor', 0))).replace(',','.') or 0)
            if cnpj and ean and qtd > 0:
                registros.append({'cnpj': cnpj, 'ean': ean, 'quantidade': qtd, 'descricao': desc, 'preco': preco})
        return jsonify({'itens': registros})
    except Exception as e:
        return jsonify({'erro': f'Falha ao processar: {e}'}), 400

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'cliente_id' not in session:
            return redirect(url_for('pagina_login', next=request.path))
        return f(*args, **kwargs)
    return decorated_function


app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_segura'

# Config upload
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Rotas principais...

@app.template_filter('formatar_cnpj')
def formatar_cnpj(cnpj):
    """Formata CNPJ no padrão 00.000.000/0000-00"""
    cnpj = re.sub(r'\D', '', str(cnpj))  # remove tudo que não for número
    if len(cnpj) != 14:
        return cnpj  # retorna como está, se inválido
    return f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cadastro')
def pagina_cadastro():
    return render_template('cadastro.html')

@app.route('/login_usuario')
def pagina_login_usuario():
    return render_template('acesso.html')

@app.route('/dashboard')
def dashboard():
    if 'usuario_id' not in session:
        return redirect(url_for('pagina_login_usuario'))
    return render_template('dashboard.html')



@app.route('/minhas_lojas_json')
def minhas_lojas_json():
    cliente_id = session.get('cliente_id')  # ou outro identificador do cliente logado
    if not cliente_id:
        return jsonify({'status': 'erro', 'mensagem': 'Cliente não autenticado'})

    conn = Acesso.get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT C.NOME_CLIENTE, C.CGC_CLIENTE, G.NOME_GRUPOCLI
            FROM CLIENTES C
            LEFT JOIN GRUPOCLI G ON C.COD_GRUPOCLI = G.COD_GRUPOCLI
            WHERE C.COD_GRUPOCLI = (
                SELECT COD_GRUPOCLI FROM CLIENTES WHERE COD_CLIENTE = ?
            )
        """, (cliente_id,))
        linhas = cursor.fetchall()

        lojas = []
        for row in linhas:
            lojas.append({
                'nome': row[0],
                'cnpj': row[1],
                'grupo': row[2] or 'Sem grupo'
            })

        return jsonify({'status': 'ok', 'lojas': lojas})
    except Exception as e:
        print("Erro ao buscar lojas:", e)
        return jsonify({'status': 'erro', 'mensagem': 'Erro ao consultar lojas'})
    finally:
        cursor.close()
        conn.close()


@app.route('/minhas_lojas')
def minhas_lojas():
    if 'cliente_id' not in session:
        return redirect(url_for('pagina_login'))

    cliente_id = session['cliente_id']
    lojas = get_lojas_do_cliente(cliente_id)  # <-- nome corrigido
    return render_template('minhas_lojas.html', lojas=lojas)  # <-- nome coerente com o HTML



def get_lojas_do_cliente(cliente_id):
    con = Acesso.get_connection()
    cur = con.cursor()

    # Primeiro, pegar o código do grupo do cliente
    cur.execute("SELECT CODGRUPO_CLIENTE FROM CLIENTES WHERE COD_CLIENTE = ?", (cliente_id,))
    grupo = cur.fetchone()

    if not grupo or not grupo[0]:
        cur.close()
        con.close()
        return []

    cod_grupo = grupo[0]

    # Agora buscar todas as lojas que pertencem a esse grupo
    query = """
    SELECT 
        CGC_CLIENTE,
        COD_CLIENTE,
        NOME_CLIENTE,
        CODGRUPO_CLIENTE,
        NOME_GRUPOCLI
    FROM CLIENTES c
    LEFT JOIN GRUPO_CLIENTE gc ON c.CODGRUPO_CLIENTE = gc.COD_GRUPOCLI
    WHERE c.CODGRUPO_CLIENTE = ?
    ORDER BY NOME_CLIENTE
    """

    cur.execute(query, (cod_grupo,))
    colunas = [desc[0] for desc in cur.description]
    resultado = [dict(zip(colunas, row)) for row in cur.fetchall()]

    cur.close()
    con.close()
    return resultado



@app.route('/cadastrar_usuario', methods=['POST'])
def cadastrar_usuario():
    try:
        data = request.get_json()
        nome = data.get('nome')
        email = data.get('email')
        senha = data.get('senha')

        if not nome or not email or not senha:
            return jsonify(status='erro', mensagem='Campos obrigatórios não preenchidos')

        senha_hash = generate_password_hash(senha)

        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor()
        cur.execute("""
            INSERT INTO usuarios (nome, email, senha)
            VALUES (%s, %s, %s)
        """, (nome, email, senha_hash))
        con.commit()
        cur.close()
        con.close()

        return jsonify(status='ok', mensagem='Usuário cadastrado com sucesso')

    except Exception as e:
        print("Erro ao cadastrar usuário:", e)
        return jsonify(status='erro', mensagem='Erro ao cadastrar usuário')



def get_mysql_connection():
    return mysql.connector.connect(
        host='localhost',
        user='seu_usuario',
        password='sua_senha',
        database='seu_banco'
    )

from werkzeug.security import check_password_hash

@app.route('/acesso', methods=['POST'])
def acesso():
    try:
        data = request.get_json()
        email = data.get('email')
        senha = data.get('senha')

        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor(dictionary=True)
        cur.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        user = cur.fetchone()

        cur.close()
        con.close()

        if user and check_password_hash(user['senha'], senha):
            session['usuario_id'] = user['id']
            session['usuario_nome'] = user['nome']
            return jsonify(status='ok', nome=user['nome'])
        else:
            return jsonify(status='erro', mensagem='Usuário ou senha inválidos.')

    except Exception as e:
        print("Erro ao autenticar:", e)
        return jsonify(status='erro', mensagem='Erro interno no servidor.')



@app.route('/boleto/<int:numero>')
def gerar_boleto(numero):
    try:
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Margens
        left_margin = 20 * mm
        top_margin = height - 20 * mm

        # Cabeçalho do boleto
        p.setFont("Helvetica-Bold", 16)
        p.drawString(left_margin, top_margin, "BOLETO BANCÁRIO")

        # Dados do boleto
        p.setFont("Helvetica", 12)
        p.drawString(left_margin, top_margin - 20, f"Número do Boleto: {numero}")
        p.drawString(left_margin, top_margin - 40, "Beneficiário: Empresa Exemplo Ltda")
        p.drawString(left_margin, top_margin - 60, "Pagador: Cliente Exemplo")
        p.drawString(left_margin, top_margin - 80, "Valor: R$ 150,00")
        p.drawString(left_margin, top_margin - 100, "Vencimento: 25/06/2025")

        # Linha digitável (código de barras em texto)
        p.setFont("Courier-Bold", 14)
        p.drawString(left_margin, top_margin - 140, "34191.79001 01043.510047 91020.150008 7 12345678900015")

        # Linha separadora
        p.line(left_margin, top_margin - 150, width - left_margin, top_margin - 150)

        # Rodapé
        p.setFont("Helvetica-Oblique", 8)
        p.drawString(left_margin, 20 * mm, "Este boleto é apenas um exemplo gerado com Flask + ReportLab.")

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


@app.route('/login')
def pagina_login():
    next_url = request.args.get('next')
    lista_clientes = clientes.get_clientes()
    return render_template('login.html', clientes=lista_clientes, next_url=next_url)


@app.route('/login', methods=['POST'])
def login_post():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    next_url = data.get('next')

    con = Acesso.get_connection()
    cur = con.cursor()

    # Consulta o cliente com login/senha
    cur.execute("""
        SELECT COD_CLIENTE, NOME_CLIENTE, CGC_CLIENTE, CODGRUPO_CLIENTE
        FROM CLIENTES
        WHERE CGC_CLIENTE = ? AND SENHAEPED_CLIENTE = ?
    """, (username, password))
    cliente = cur.fetchone()

    if not cliente:
        cur.close()
        con.close()
        return jsonify(status='erro', mensagem='Credenciais inválidas')

    cliente_id, nome, cnpj, grupo_id = cliente
    session['cliente_id'] = cliente_id
    session['cliente_nome'] = nome
    session['cliente_cnpj'] = cnpj

    # Verifica quantas lojas existem no mesmo grupo
    redirecionar_para = '/loja'  # padrão

    if grupo_id:
        cur.execute("""
            SELECT COUNT(*) FROM CLIENTES WHERE CODGRUPO_CLIENTE = ?
        """, (grupo_id,))
        total_lojas = cur.fetchone()[0]
        if total_lojas > 1:
            redirecionar_para = '/multi'

    cur.close()
    con.close()

    return jsonify(status='ok', redirect_url=next_url or redirecionar_para)

    

@app.route("/loja")
def loja():
    if 'cliente_id' not in session:
        return redirect(url_for('login'))

    cliente_id = session['cliente_id']
    cliente = get_cliente_por_id(cliente_id)
    produtos = get_lista_precos_por_cliente(cliente_id)

    return render_template("loja.html", produtos=produtos, cliente=cliente)



@app.route("/multi")
@login_required
def multi():
    cliente_logado = session.get("cliente_cnpj")

    # Limpa qualquer caractere não numérico (CNPJ limpo)
    if cliente_logado:
        cliente_logado = re.sub(r"\D", "", cliente_logado)

    conn = Acesso.get_connection()
    cursor = conn.cursor()

    print("cliente_logado:", cliente_logado)

    cursor.execute("SELECT CODGRUPO_CLIENTE FROM CLIENTES WHERE CGC_CLIENTE = ?", (cliente_logado,))
    row = cursor.fetchone()
    grupo = row[0] if row else None

    print("Grupo encontrado:", grupo)

    lojas = []
    if grupo:
        cursor.execute("""
            SELECT 
                c.NOME_CLIENTE, 
                c.CGC_CLIENTE, 
                gc.NOME_GRUPOCLI
            FROM CLIENTES c
            LEFT JOIN GRUPO_CLIENTE gc ON c.CODGRUPO_CLIENTE = gc.COD_GRUPOCLI
            WHERE c.CODGRUPO_CLIENTE = ?
            ORDER BY c.NOME_CLIENTE
        """, (grupo,))
        lojas = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]

    print("Lojas carregadas:", lojas)

    produtos = get_produtos()
    return render_template("multi.html", lojas=lojas, produtos=produtos)




@app.route('/upload_nf_devolucao', methods=['POST'])
def upload_nf_devolucao():
    try:
        chamado_id = request.form.get('chamado_id')
        file = request.files.get('arquivo_nf')

        if not chamado_id or not file or file.filename == '':
            return "ID do chamado ou arquivo inválido", 400

        if allowed_file(file.filename):
            filename = secure_filename(file.filename)
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(save_path)

            con = AcessoOutroBanco.get_mysql_connection()
            cur = con.cursor()

            query = """
            UPDATE solicitacoes_devolucao
            SET arquivo_nf = %s, status = %s
            WHERE id = %s
            """
            cur.execute(query, (filename, 'NF Recebida', chamado_id))
            con.commit()
            cur.close()
            con.close()

            print(f"Arquivo '{filename}' salvo para chamado {chamado_id}")
            return redirect(url_for('acompanhar_devolucoes'))

        else:
            return "Extensão de arquivo não permitida", 400

    except Exception as e:
        print(f"Erro no upload da NF: {e}")
        return f"Erro no upload: {e}", 500

@app.route('/download_nf/<int:chamado_id>')
def download_nf(chamado_id):
    try:
        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor(dictionary=True)

        query = "SELECT arquivo_nf FROM solicitacoes_devolucao WHERE id = %s"
        cur.execute(query, (chamado_id,))
        resultado = cur.fetchone()

        cur.close()
        con.close()

        if not resultado or not resultado['arquivo_nf']:
            return "Arquivo não encontrado.", 404

        nome_arquivo = resultado['arquivo_nf']
        caminho_uploads = app.config['UPLOAD_FOLDER']

        return send_from_directory(caminho_uploads, nome_arquivo, as_attachment=True)

    except Exception as e:
        print(f"Erro ao fazer download: {e}")
        return f"Erro no download: {e}", 500
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
        ordem_coleta = request.form.get('ordem_coleta')  # pode vir vazio

        if not chamado_id or not acao:
            return "Dados incompletos", 400

        # Define o novo status baseado na ação
        if acao == 'finalizar':
            novo_status = 'Concluído'
        elif acao == 'Aceitar_solicitar':
            novo_status = 'Enviar NF de Devolução'
        elif acao == 'Recusar':
            novo_status = 'Cancelado'
        elif acao == 'Outra Ação':
            novo_status = 'Em análise'
        else:
            novo_status = acao  # fallback genérico

        # Conexão com o banco
        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor()

        # Atualização com ou sem ordem de coleta
        if ordem_coleta:
            query = """
            UPDATE solicitacoes_devolucao
            SET status = %s, ordem_coleta = %s
            WHERE id = %s
            """
            cur.execute(query, (novo_status, ordem_coleta, chamado_id))
        else:
            query = """
            UPDATE solicitacoes_devolucao
            SET status = %s
            WHERE id = %s
            """
            cur.execute(query, (novo_status, chamado_id))

        con.commit()
        cur.close()
        con.close()

        return redirect(url_for('listar_chamados_devolucao'))

    except Exception as e:
        print(f"Erro ao atualizar chamado: {e}")
        return f"Erro ao atualizar chamado: {e}", 500
    
@app.route('/resumo_devolucoes')
def resumo_devolucoes():
    estatisticas = buscar_estatisticas_devolucoes()
    return render_template('resumo.html', estatisticas=estatisticas)


def buscar_estatisticas_devolucoes():
    try:
        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor(dictionary=True)

        cur.execute("""
            SELECT
                COUNT(*) AS total_devolucoes,
                SUM(valor) AS total_valor,
                SUM(CASE WHEN status = 'Concluído' THEN 1 ELSE 0 END) AS finalizadas,
                SUM(CASE WHEN status = 'Pendente' THEN 1 ELSE 0 END) AS pendentes,
                SUM(CASE WHEN status = 'Enviar NF de Devolução' THEN 1 ELSE 0 END) AS nf_recebidas
            FROM solicitacoes_devolucao
        """)
        dados = cur.fetchone()
        cur.close()
        con.close()

        return dados
    except Exception as e:
        print("Erro:", e)
        return {}



# ✅ Nova Rota: Chamados de Devolução (MySQL)
@app.route('/devolucoes_chamados')
def listar_chamados_devolucao():
    try:
        con = AcessoOutroBanco.get_mysql_connection()
        cur = con.cursor(dictionary=True)

        query = """
        SELECT id, cliente_id, data_solicitacao, valor, status, motivo, numero_nf, ordem_coleta, arquivo_nf
        FROM solicitacoes_devolucao
        ORDER BY data_solicitacao DESC
        """
        cur.execute(query)
        chamados = cur.fetchall()
        cur.close()
        con.close()

        # Nome do cliente
        for chamado in chamados:
            cliente_id = chamado.get('cliente_id')
            cliente = get_cliente_por_id(cliente_id)
            chamado['cliente'] = cliente['NOME_CLIENTE'] if cliente else 'Cliente não encontrado'

        # Estatísticas para os cards
        estatisticas = {
            "total_valor": sum(c['valor'] or 0 for c in chamados),
            "finalizadas": sum(1 for c in chamados if c['status'] == 'Concluído'),
            "pendentes": sum(1 for c in chamados if c['status'] == 'PENDENTE'),
            "com_nf": sum(1 for c in chamados if c['status'] == 'NF Recebida')

        }

        return render_template('devolucoes_chamados.html', chamados=chamados, estatisticas=estatisticas)

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
        SELECT id, numero_nf, motivo, tipo_devolucao, status, data_solicitacao, ordem_coleta
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
        cur.execute(query, (numero_nota, motivo, tipo_devolucao, 'Em análise', cliente_id, valor))
        con.commit()

        cur.close()
        con.close()

        print(f"Devolução cadastrada: Nota {numero_nota}, Cliente {cliente_id}, Valor {valor}")
        return redirect(url_for('loja'))

    except Exception as e:
        print(f"Erro ao enviar devolução: {e}")
        return f"Erro ao enviar devolução: {e}", 500



# ✅ Defina a função primeiro
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

@app.route('/importar_excel_para_carrinho', methods=['POST'])
def importar_excel_para_carrinho():
    try:
        file = request.files.get('file')
        if not file:
            print("⚠️ Nenhum arquivo enviado.")
            return jsonify({"status": "erro", "mensagem": "Nenhum arquivo enviado"}), 400

        # Leitura e padronização de colunas
        df = pd.read_excel(BytesIO(file.read()), engine='openpyxl')
        df.columns = df.columns.str.strip().str.upper()
        print("📄 Colunas encontradas:", df.columns.tolist())

        if 'EAN' not in df.columns or 'QUANTIDADE' not in df.columns:
            return jsonify({"status": "erro", "mensagem": "Arquivo precisa ter colunas 'EAN' e 'Quantidade'"}), 400

        df = df.dropna(subset=['EAN'])
        print("📦 Linhas após remover EANs vazios:", len(df))

        lista_eans = df['EAN'].astype(str).tolist()
        quantidade_map = dict(zip(df['EAN'].astype(str), df['QUANTIDADE'].astype(int)))
        print("🔍 EANs lidos:", lista_eans)
        print("🧮 Quantidades:", quantidade_map)

        # Buscar produtos no banco
        produtos = buscar_produtos_por_eans(lista_eans)
        print("✅ Produtos encontrados:", produtos)

        # Comparar EANs encontrados
        eans_encontrados = {str(p['CODBARRA_PRODUTO']) for p in produtos}
        eans_nao_encontrados = [ean for ean in lista_eans if ean not in eans_encontrados]
        print("❌ EANs não encontrados:", eans_nao_encontrados)

        # Carrinho
        carrinho = session.get('carrinho', {})

        for produto in produtos:
            cod = str(produto['COD_PRODUTO'])
            ean = str(produto['CODBARRA_PRODUTO'])
            qtd = quantidade_map.get(ean, 1)

            if cod not in carrinho:
                carrinho[cod] = {
                    "nome": produto['NOME_PRODUTO'],
                    "ean": produto['CODBARRA_PRODUTO'],
                    "preco": float(produto['PRVENDA_PRODUTO']),
                    "quantidade": 0
                }

            carrinho[cod]['quantidade'] += qtd

        session['carrinho'] = carrinho

        return jsonify({
            "status": "ok",
            "mensagem": "Produtos adicionados ao carrinho",
            "carrinho": carrinho,
            "ean_nao_encontrado": eans_nao_encontrados
        })

    except Exception as e:
        import traceback
        print("❗ ERRO ao importar Excel:")
        traceback.print_exc()
        return jsonify({"status": "erro", "mensagem": "Erro desconhecido. Verifique o servidor para mais detalhes."}), 500


# ✅ Depois defina a rota
@app.route('/importar-produtos', methods=['POST'])
def importar_produtos():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"status": "erro", "mensagem": "Nenhum arquivo enviado"}), 400

        df = pd.read_excel(BytesIO(file.read()), engine='openpyxl')
        df.columns = df.columns.str.strip().str.upper()

        for col in ['EAN', 'QUANTIDADE', 'CNPJ']:
            if col not in df.columns:
                return jsonify({"status": "erro", "mensagem": f"Coluna obrigatória '{col}' não encontrada"}), 400

        df = df.dropna(subset=['EAN', 'CNPJ'])

        try:
            df['QUANTIDADE'] = df['QUANTIDADE'].astype(int)
        except Exception:
            return jsonify({"status": "erro", "mensagem": "Coluna 'Quantidade' contém valores inválidos."}), 400

        # Agrupar os dados por CNPJ
        pedidos_por_cnpj = {}
        todos_eans = set()

        for _, row in df.iterrows():
            cnpj = str(row['CNPJ']).strip()
            ean = str(row['EAN']).strip()
            quantidade = int(row['QUANTIDADE'])

            if cnpj not in pedidos_por_cnpj:
                pedidos_por_cnpj[cnpj] = []

            pedidos_por_cnpj[cnpj].append({"ean": ean, "quantidade": quantidade})
            todos_eans.add(ean)

        # Buscar todos os produtos de uma vez só
        produtos = buscar_produtos_por_eans(list(todos_eans))
        produtos_por_ean = {str(p['CODBARRA_PRODUTO']): p for p in produtos}

        # Montar estrutura final por CNPJ
        pedidos_final = {}

        for cnpj, itens in pedidos_por_cnpj.items():
            pedidos_final[cnpj] = []
            for item in itens:
                produto_info = produtos_por_ean.get(item['ean'])
                if produto_info:
                    pedidos_final[cnpj].append({
                        "ean": item['ean'],
                        "quantidade": item['quantidade'],
                        "nome": produto_info['NOME_PRODUTO'],
                        "preco": float(produto_info['PRVENDA_PRODUTO']),
                        "imagem": f"/static/fotos/{produto_info['COD_PRODUTO']}.jpg"
                    })

        return jsonify({"status": "ok", "pedidos": pedidos_final})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "erro", "mensagem": "Erro desconhecido."}), 500

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





if __name__ == '__main__':
    app.run(debug=True)