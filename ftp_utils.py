import os, io, csv, datetime, posixpath, tempfile
from contextlib import contextmanager

# ---------- SFTP (via Paramiko) ----------
def sftp_upload(fileobj: io.BufferedReader, remote_dir: str, remote_name: str):
    import paramiko
    host = os.getenv("FTP_HOST"); user = os.getenv("FTP_USER")
    pwd  = os.getenv("FTP_PASS"); port = int(os.getenv("FTP_PORT", "22"))

    transport = paramiko.Transport((host, port))
    transport.connect(username=user, password=pwd)
    sftp = paramiko.SFTPClient.from_transport(transport)

    try:
        # garante diretório remoto (cria recursivo)
        _sftp_mkdirs(sftp, remote_dir)
        remote_path = posixpath.join(remote_dir, remote_name)
        fileobj.seek(0)
        sftp.putfo(fileobj, remote_path)
    finally:
        sftp.close()
        transport.close()

def _sftp_mkdirs(sftp, remote_dir: str):
    parts = [p for p in remote_dir.split('/') if p]
    path = ''
    for p in parts:
        path += '/' + p
        try:
            sftp.stat(path)
        except IOError:
            sftp.mkdir(path)

# ---------- FTPS (FTP + TLS) ----------
def ftps_upload(fileobj: io.BufferedReader, remote_dir: str, remote_name: str):
    from ftplib import FTP_TLS, error_perm
    host = os.getenv("FTP_HOST"); user = os.getenv("FTP_USER")
    pwd  = os.getenv("FTP_PASS"); port = int(os.getenv("FTP_PORT", "21"))

    ftps = FTP_TLS()
    ftps.connect(host, port)
    ftps.auth()       # inicia TLS
    ftps.prot_p()     # protege dados
    ftps.login(user, pwd)
    ftps.set_pasv(True)

    try:
        _ftp_cwd_mkdirs(ftps, remote_dir)
        ftps.cwd(remote_dir)
        fileobj.seek(0)
        ftps.storbinary(f"STOR {remote_name}", fileobj)
    finally:
        ftps.quit()

# ---------- FTP “puro” (inseguro) ----------
def ftp_upload(fileobj: io.BufferedReader, remote_dir: str, remote_name: str):
    from ftplib import FTP
    host = os.getenv("FTP_HOST"); user = os.getenv("FTP_USER")
    pwd  = os.getenv("FTP_PASS"); port = int(os.getenv("FTP_PORT", "21"))

    ftp = FTP()
    ftp.connect(host, port)
    ftp.login(user, pwd)
    ftp.set_pasv(True)

    try:
        _ftp_cwd_mkdirs(ftp, remote_dir)
        ftp.cwd(remote_dir)
        fileobj.seek(0)
        ftp.storbinary(f"STOR {remote_name}", fileobj)
    finally:
        ftp.quit()

def _ftp_cwd_mkdirs(ftp, remote_dir: str):
    # cria diretórios recursivamente se não existirem
    for part in [p for p in remote_dir.split('/') if p]:
        try:
            ftp.mkd(part)
        except Exception:
            pass
        ftp.cwd(part)

# ---------- Roteador por protocolo ----------
def upload_bytes(data: bytes, remote_dir: str, remote_name: str):
    proto = os.getenv("FTP_PROTOCOL", "sftp").lower()
    buf = io.BytesIO(data)
    if proto == "sftp":
        return sftp_upload(buf, remote_dir, remote_name)
    elif proto == "ftps":
        return ftps_upload(buf, remote_dir, remote_name)
    elif proto == "ftp":
        return ftp_upload(buf, remote_dir, remote_name)
    else:
        raise ValueError(f"Protocolo desconhecido: {proto}")
