# Gerador de Convites de Orador – Congregação Bagueira

Aplicação web estática para criar cartas de convite de discurso público da **Congregação Bagueira – Linhares, ES**. Funciona no celular, tablet e computador, sem backend, login ou armazenamento de dados no servidor.

## Executar localmente

1. Clone ou copie esta pasta para o seu computador.
2. Abra o arquivo `index.html` no navegador **ou** use um servidor local simples (recomendado para testar PDF e CDN):

   **Python 3:**

   ```bash
   cd Speaker_Control
   python -m http.server 8080
   ```

   Acesse: `http://localhost:8080`

   **Node (npx):**

   ```bash
   npx --yes serve .
   ```

3. Preencha o formulário, use **Visualizar** e **Gerar convite**.

> Enquanto a lista em `js/discursos.js` estiver vazia, o aviso amarelo aparecerá e os botões de gerar/visualizar ficarão desabilitados.

## Publicar no GitHub

1. Crie um repositório no GitHub (por exemplo: `gerador-convite-bagueira`).
2. Envie os arquivos do projeto:

   ```bash
   git init
   git add .
   git commit -m "Gerador de convites Congregação Bagueira"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

## Ativar GitHub Pages

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Build and deployment** → **Source**, escolha **Deploy from a branch**.
3. Branch: **main**, pasta: **/ (root)**.
4. Salve. Em alguns minutos o site estará em:

   `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`

Não é necessária configuração extra (sem Node, PHP ou build). Todos os caminhos são relativos.

## Onde alterar a lista de discursos

Edite **`js/discursos.js`**:

```javascript
const discursos = [
  { numero: 1, tema: "Tema do discurso" },
  { numero: 2, tema: "Outro tema" },
];
```

A aplicação ordena automaticamente pelo número, preenche o tema ao selecionar o discurso e exibe `número — tema` no seletor.

## Onde alterar os dados fixos da congregação

Edite **`js/congregacao.js`** (nome, endereço, telefone, coordenador, e-mail, horário da reunião).

## Onde alterar o texto da carta

Edite a função **`buildCartaHtml`** em **`js/carta.js`**. Mantenha os placeholders dinâmicos (`congregacao`, `orador`, `numero`, `tema`, `data`) conforme o modelo oficial.

## Onde alterar o visual

| O quê | Arquivo |
|--------|---------|
| Interface (formulário, botões, cores) | `css/style.css` |
| Tipografia e layout da carta na prévia | `css/style.css` (classes `.carta-*` e `.folha-a4`) |
| Compactação da carta só no PDF | `css/style.css` (`#pdf-source`) |

## Estrutura do projeto

```text
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js           # Formulário, validação, PDF, compartilhar
│   ├── carta.js         # HTML da carta
│   ├── congregacao.js   # Dados fixos Bagueira
│   └── discursos.js     # Lista oficial de discursos
├── vendor/
│   └── html2pdf.bundle.min.js
└── README.md
```

## Biblioteca PDF

A geração de PDF usa **html2pdf.js** (v0.10.1), incluída em **`vendor/html2pdf.bundle.min.js`**, para funcionar offline e sem depender de CDN.

## Privacidade

Os dados preenchidos são processados apenas no navegador. Nada é enviado a servidores da aplicação.

## Compartilhar PDF no celular

Após gerar o convite, se o navegador suportar **Web Share API** com arquivos, aparece **Compartilhar PDF** (WhatsApp, e-mail, etc.). Caso contrário, use **Abrir PDF** ou **Baixar PDF**.
