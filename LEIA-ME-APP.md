# Mapas Mentais — app (PWA)

Esta pasta já é um app web instalável. Falta só publicá-la num endereço HTTPS.
O caminho mais simples e gratuito é o GitHub Pages.

## Passo a passo (uma vez só, ~10 minutos)

### 1. Criar o repositório
Em <https://github.com/new>:

- **Repository name:** `mapas` (ou o nome que preferir)
- **Visibilidade:** `Private` funciona, mas **o GitHub Pages em repositório privado exige
  conta paga**. Em conta gratuita, use `Public`.
- Não marque nada em "Initialize this repository with".

### 2. Enviar os arquivos

Abra o **PowerShell** e entre na pasta (as aspas são obrigatórias — o nome tem espaço e ponto):

```powershell
cd "C:\Users\renan\OneDrive\Estudos\concursos\geral\27. Resumos"
```

Confira se o Git está instalado:

```powershell
git --version
```

Se der erro, instale e **feche e reabra o PowerShell**:

```powershell
winget install --id Git.Git -e --source winget
```

Se for a primeira vez que usa Git nesta máquina, identifique-se (uma vez só, vale para sempre):

```powershell
git config --global user.name "Renan Monteiro"
git config --global user.email "renandrm@gmail.com"
```

Agora o envio:

```powershell
git init -b main
git add .
```

**Confira antes de commitar** — tem que dar por volta de 40 arquivos. Se der centenas,
o `.gitignore` não pegou, e aí pare e verifique:

```powershell
git ls-files | Measure-Object -Line
```

Estando certo:

```powershell
git commit -m "Mapas mentais como PWA"
git remote add origin https://github.com/SEU-USUARIO/mapas.git
git push -u origin main
```

No `git push` vai abrir uma janela do navegador pedindo login no GitHub — é o
Git Credential Manager. Autorize uma vez e ele guarda a credencial.

### 3. Ligar o GitHub Pages
No repositório: **Settings → Pages**

- **Source:** `Deploy from a branch`
- **Branch:** `main` / `/ (root)` → **Save**

Em um ou dois minutos o endereço aparece na própria página:
`https://SEU-USUARIO.github.io/mapas/`

### 4. Instalar no celular
1. Abra esse endereço no **Chrome** do Android.
2. Toque em **"⬇ Instalar app"** na barra de ferramentas do índice.
   (Se o botão não aparecer: menu ⋮ → *Adicionar à tela inicial*.)
3. Abra o app pelo ícone e toque em **"⤓ Baixar tudo para offline"**.
   São ~40 MB — faça no Wi-Fi. A partir daí funciona sem internet.

## Atualizar um mapa

Edite o `.html` normalmente nesta pasta e rode, na mesma pasta:

```powershell
git add .
git commit -m "atualiza mapa de ciencia de dados"
git push
```

O app pega a versão nova sozinho na próxima vez que abrir com internet.

## Arquivos do app

| Arquivo | Para que serve |
|---|---|
| `index.html` | índice com busca, filtros e os botões de instalar/baixar |
| `manifest.webmanifest` | nome, ícone, cores e modo de exibição do app |
| `sw.js` | service worker: cache e funcionamento offline |
| `icons/` | ícones 192, 512, maskable e Apple |
| `.nojekyll` | impede o GitHub de processar a pasta como site Jekyll |
| `.gitignore` | mantém backups e PDFs fora do repositório |

## Atenção: esta pasta está dentro do OneDrive

O Git funciona aqui, mas o OneDrive vai tentar sincronizar também a pasta oculta `.git`.
Em uma máquina só o risco é baixo; se você usar o OneDrive em dois computadores, pode
dar conflito e corromper o repositório. Para evitar, depois do `git init` rode:

```powershell
attrib +U -P .git /s /d
```

Isso marca o `.git` como "disponível apenas online/ignorado" para o OneDrive.

## Se precisar forçar uma atualização do app

Troque `const VERSAO = 'v1';` por `'v2'` no `sw.js` e dê push. Isso descarta os
caches antigos e baixa tudo de novo.
