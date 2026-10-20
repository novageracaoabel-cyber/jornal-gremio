# Jornal do Grêmio — portal editorial

Um site estático para o jornal digital do grêmio estudantil, hospedado gratuitamente no GitHub Pages. O portal tem notícias contínuas, edições em formato de revista e arquivo de edições anteriores.

## O que já vem pronto
- Página inicial com notícias recentes e edição em destaque.
- Arquivo de edições, com capa, descrição e matérias.
- Página individual para cada notícia/matéria.
- Conteúdo separado do código do site.
- Modelo de notícia e de edição para copiar.
- Verificação automática de campos obrigatórios.
- Publicação automática no GitHub Pages a cada atualização da branch `main`.

## 1. Criar o repositório
1. Entre na conta oficial do grêmio no GitHub.
2. Crie um repositório chamado `jornal-gremio` (ou outro nome).
3. De preferência, deixe-o público para facilitar a hospedagem gratuita no GitHub Pages.
4. Envie todos os arquivos e pastas deste projeto para a raiz do repositório.

## 2. Ativar a publicação automática
1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Abra **Actions** e confirme que o fluxo `Publicar site no GitHub Pages` executou.
4. Quando terminar, o GitHub mostrará o endereço do site em **Settings → Pages**.
5. Se o repositório se chamar `jornal-gremio`, o endereço geralmente será `https://NOME-DA-CONTA.github.io/jornal-gremio/`.

O site será reconstruído automaticamente quando novos conteúdos forem enviados à branch `main`.

## 3. Publicar uma notícia avulsa
1. Copie `modelos/noticia-modelo.md` para `conteudo/noticias/`.
2. Dê um nome simples ao arquivo, por exemplo `campeonato-escolar.md`.
3. Edite os campos entre os separadores `---` e o texto abaixo deles.
4. Coloque as imagens na mesma pasta da notícia, se houver, e indique o caminho em `imagem`.
5. Envie a alteração para o repositório oficial do grêmio.

Exemplo:
```text
conteudo/
└── noticias/
    ├── campeonato-escolar.md
    ├── campeonato-escolar.jpg
    └── feira-de-ciencias.md
```

Em `imagem`, use `campeonato-escolar.jpg`. Se não houver imagem, deixe `imagem:` vazio.

## 4. Criar uma nova edição de revista
1. Copie a pasta `modelos/edicao-modelo/`.
2. Cole dentro de `edicoes/` e renomeie para `edicao-002`, `edicao-003` etc.
3. Edite `edicao.json` com o título, número, data e descrição.
4. Substitua `capa.svg` por uma capa própria (por exemplo `capa.jpg`) e atualize o campo `capa` em `edicao.json`.
5. Copie `materias/materia-modelo.md` para cada nova matéria e edite os campos e o texto.
6. Coloque as imagens da matéria dentro da pasta `materias/` e indique o nome no campo `imagem`.
7. Envie a pasta inteira ao repositório oficial do grêmio.

Exemplo:
```text
edicoes/
└── edicao-002/
    ├── edicao.json
    ├── capa.jpg
    └── materias/
        ├── campeonato.md
        ├── campeonato.jpg
        ├── entrevista.md
        └── entrevista.jpg
```

O portal encontra as edições e matérias pelas pastas e arquivos. **Não é necessário editar o código do site nem cadastrar a edição em uma lista manual.**

## 5. Formato dos arquivos Markdown
Markdown é texto simples com alguns símbolos de formatação. Os campos entre `---` são metadados; o texto abaixo deles é a matéria.

```markdown
---
titulo: Campeonato Escolar começa em novembro
categoria: Esportes
data: 2026-11-01
autor: Redação do Grêmio
resumo: Veja as datas e como participar.
imagem: campeonato.jpg
---

# Campeonato Escolar 2026

A escola realizará um campeonato esportivo em novembro.

## Como participar?

Procure a organização do grêmio para conferir as regras.

**Data:** 15 de novembro de 2026.
```

Use datas no formato `AAAA-MM-DD`. O campo `imagem` é opcional.

## 6. Como funciona a aprovação
O ideal é que colaboradores preparem notícias e matérias, mas a publicação final seja feita pela conta oficial do grêmio. Não compartilhem a senha da conta. Os colaboradores podem entregar os arquivos a um responsável ou enviar uma proposta de alteração (*pull request*), se tiverem acesso ao repositório.

## 7. Personalização
- Nome do jornal, descrição e sigla: `site/js/config.js`
- Cores e aparência: `site/css/style.css`
- Estrutura das páginas: arquivos HTML dentro de `site/`

O projeto vem com o nome provisório **Jornal do Grêmio** e uma cor de destaque laranja queimado. Você pode alterar isso depois.

## Observações
- Não coloque dados pessoais, telefones particulares, endereços, fotos ou informações de estudantes sem a autorização adequada.
- Revise nomes, datas, créditos de imagens e autorização de publicação antes de publicar.
- GitHub Pages hospeda um site estático: este projeto não tem login próprio nem editor visual. A publicação é feita por alterações no repositório.
