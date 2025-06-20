import mysql.connector

def get_mysql_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='Dmparan@',    # Sua senha
        database='dmpr',        # Nome real do seu banco
        auth_plugin='mysql_native_password'  # Caso seu MySQL precise disso
    )
if __name__ == "__main__":
    try:
        conn = get_mysql_connection()
        print("Conexão MySQL realizada com sucesso!")
        conn.close()
    except Exception as e:
        print(f"Erro ao conectar ao MySQL: {e}")
