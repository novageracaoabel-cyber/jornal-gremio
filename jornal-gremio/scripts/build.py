# Monta o site estático e cria o catálogo de notícias/edições.
from pathlib import Path
import json, re, shutil, sys

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SITE = ROOT / "site"
NEWS_DIR = ROOT / "conteudo" / "noticias"
ISSUES_DIR = ROOT / "edicoes"
ERRORS = []

def parse_markdown(path):
    raw = path.read_text(encoding="utf-8-sig")
    meta, body = {}, raw
    if raw.startswith("---"):
        parts = raw.split("---", 2)
        if len(parts) == 3:
            for line in parts[1].splitlines():
                if ":" in line:
                    key, value = line.split(":", 1)
                    meta[key.strip().lower()] = value.strip().strip('"').strip("'")
            body = parts[2].strip()
    return meta, body

def required(meta, fields, path):
    missing = [field for field in fields if not meta.get(field)]
    if missing:
        ERRORS.append(f"{path.relative_to(ROOT)}: campos obrigatórios ausentes: {', '.join(missing)}")

def clean_id(value):
    value = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip()).strip("-").lower()
    return value or "materia"

def parse_article(path, prefix="", edition=None):
    meta, body = parse_markdown(path)
    required(meta, ["titulo", "categoria", "data", "autor", "resumo"], path)
    article_id = clean_id(prefix + path.stem)
    image = meta.get("imagem", "")
    image_url = (path.parent / image).relative_to(ROOT).as_posix() if image else ""
    if image and not (path.parent / image).is_file():
        ERRORS.append(f"{path.relative_to(ROOT)}: a imagem indicada não existe: {image}")
    item = {"id":article_id,"titulo":meta.get("titulo",path.stem),"categoria":meta.get("categoria","Notícia"),
            "data":meta.get("data",""),"autor":meta.get("autor","Redação"),"resumo":meta.get("resumo",""),
            "imagem":image_url,"corpo":body,"fonte":path.relative_to(ROOT).as_posix()}
    if edition:
        item["edicaoId"] = edition["id"]
        item["edicaoTitulo"] = edition["titulo"]
    return item

def main():
    if DIST.exists(): shutil.rmtree(DIST)
    shutil.copytree(SITE, DIST)
    (DIST / "data").mkdir(parents=True, exist_ok=True)
    for folder in (ROOT / "conteudo", ROOT / "edicoes"):
        if folder.exists(): shutil.copytree(folder, DIST / folder.name, dirs_exist_ok=True)

    news = []
    if NEWS_DIR.exists():
        for path in sorted(NEWS_DIR.glob("*.md")):
            news.append(parse_article(path, "noticia-"))
    news.sort(key=lambda item: item.get("data",""), reverse=True)

    issues, all_matter = [], []
    if ISSUES_DIR.exists():
        for folder in sorted(ISSUES_DIR.iterdir()):
            if not folder.is_dir() or folder.name.startswith("."): continue
            info_path = folder / "edicao.json"
            if not info_path.exists():
                ERRORS.append(f"{folder.relative_to(ROOT)}: arquivo edicao.json não encontrado")
                continue
            try:
                info = json.loads(info_path.read_text(encoding="utf-8"))
            except Exception as exc:
                ERRORS.append(f"{info_path.relative_to(ROOT)}: JSON inválido ({exc})")
                continue
            for field in ("titulo","numero","data","descricao","capa"):
                if not info.get(field): ERRORS.append(f"{info_path.relative_to(ROOT)}: campo obrigatório ausente: {field}")
            cover = folder / info.get("capa","")
            if info.get("capa") and not cover.is_file():
                ERRORS.append(f"{info_path.relative_to(ROOT)}: capa não encontrada: {info.get('capa')}")
            issue = {"id":clean_id(folder.name),"titulo":info.get("titulo",folder.name),"numero":str(info.get("numero","")),
                     "data":info.get("data",""),"descricao":info.get("descricao",""),
                     "capa":(folder / info["capa"]).relative_to(ROOT).as_posix() if info.get("capa") and cover.is_file() else "",
                     "materias":[]}
            matter_dir = folder / "materias"
            if matter_dir.exists():
                for path in sorted(matter_dir.glob("*.md")):
                    article = parse_article(path, folder.name + "-", issue)
                    issue["materias"].append({k:article[k] for k in ("id","titulo","resumo","categoria","data","autor")})
                    all_matter.append(article)
            issues.append(issue)
    issues.sort(key=lambda item: item.get("data",""), reverse=True)
    all_matter.sort(key=lambda item: item.get("data",""), reverse=True)

    ids = [item["id"] for item in news + all_matter]
    if len(ids) != len(set(ids)):
        ERRORS.append("Há IDs de matérias repetidos. Renomeie os arquivos para que cada matéria tenha um nome único.")
    catalog = {"edicoes":issues,"noticias":news,"materias":all_matter}
    (DIST / "data" / "catalogo.json").write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding="utf-8")
    if ERRORS:
        print("ERROS DE VALIDAÇÃO:")
        for error in ERRORS: print(f" - {error}")
        sys.exit(1)
    print(f"Site gerado: {len(news)} notícias, {len(issues)} edições e {len(all_matter)} matérias de edição.")
    print("Saída: dist/")

if __name__ == "__main__":
    main()
