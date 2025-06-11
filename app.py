from flask import Flask, render_template, redirect, url_for
import Lista_Produtos

# Cria a aplicação Flask
app = Flask(__name__)

# Rota para a página inicial, redireciona para /loja
@app.route('/')
def index():
    return redirect(url_for('loja'))

# Rota para a loja
@app.route('/loja')
def loja():
    lista_produtos = Lista_Produtos.get_produtos()
    print(f"Total de produtos carregados: {len(lista_produtos)}")
    return render_template('loja.html', produtos=lista_produtos)

# Rota para a lista de produtos (opcional)
@app.route('/produtos')
def produtos():
    lista_produtos = Lista_Produtos.get_produtos()
    return render_template('produtos.html', produtos=lista_produtos)

# Inicia o servidor Flask
if __name__ == '__main__':
    app.run(debug=True)
