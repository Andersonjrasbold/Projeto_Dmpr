import fdb
import pandas as pd

# Carrega a DLL do Firebird Client
fdb.load_api(r'C:\Users\renat\OneDrive - dmparana.com.br\BI - DM Paraná\Arquivos DM\GDS32.DLL')

# Função de conexão ao banco
def get_connection():
    con = fdb.connect(
        dsn=r'10.251.0.128/3051:C:\MEDICON\DB\DATABASE.FDB',
        user='USER_READ',
        password='USRREAD',
        charset='NONE'
    )
    return con

# Teste opcional se rodar esse arquivo diretamente
if __name__ == '__main__':
    try:
        con = get_connection()
        print("Conexão realizada com sucesso!")
        con.close()
    except Exception as e:
        print(f"Erro na conexão: {e}")
