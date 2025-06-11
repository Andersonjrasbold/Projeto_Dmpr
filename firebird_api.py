from flask import Flask, jsonify
import fdb

app = Flask(__name__)

# Configuração do banco
config = {
    'host': '10.251.100.2',
    'port': 3051,
    'database': 'C:/MEDICON/DB/DATABASE.FDB',
    'user': 'USER_READ',
    'password': 'USRREAD',
    'charset': 'UTF8'
}

@app.route('/clientes', methods=['GET'])
def get_clientes():
    try:
        con = fdb.connect(**config)
        cur = con.cursor()
        cur.execute("SELECT FIRST 5 * FROM clientes")
        columns = [desc[0] for desc in cur.description]
        data = [dict(zip(columns, row)) for row in cur.fetchall()]
        cur.close()
        con.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
