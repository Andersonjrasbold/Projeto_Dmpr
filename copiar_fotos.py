import os
import shutil
import Acesso

# Caminho de origem e destino
origem = r"\\10.251.100.2\medicon$\EPED\Fotos"
destino = r"C:\Users\Usuario\OneDrive\Área de Trabalho\Projeto site\static\fotos"

# Se destino não existir, cria
if not os.path.exists(destino):
    os.makedirs(destino)

# Conecta no banco
con = Acesso.get_connection()
cur = con.cursor()

# Consulta os códigos de produto que você precisa copiar
query = """
SELECT COD_PRODUTO FROM PRODUTOS
WHERE STATUS_PRODUTO = 1
AND CATEGORIA_PRODUTO NOT IN ('26','13','29','14')
--AND COD_PRODUTO <= 100
AND ESTOQUE_PRODUTO > 0
"""

cur.execute(query)
codigos = [str(row[0]) for row in cur.fetchall()]

# Fecha conexão
cur.close()
con.close()

# Copia as imagens
for codigo in codigos:
    arquivo_origem = os.path.join(origem, f"{codigo}.jpg")
    arquivo_destino = os.path.join(destino, f"{codigo}.jpg")
    
    if os.path.exists(arquivo_origem):
        shutil.copy2(arquivo_origem, arquivo_destino)
        print(f"Imagem {codigo}.jpg copiada com sucesso.")
    else:
        print(f"Imagem {codigo}.jpg não encontrada no diretório de origem.")

print("Cópia finalizada.")
