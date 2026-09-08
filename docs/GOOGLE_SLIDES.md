# Google Apresentações

O fluxo gera primeiro a mesma apresentação editável usada pelo PowerPoint e envia o arquivo ao Google Drive com conversão para `application/vnd.google-apps.presentation`. A resposta da API fornece o ID e o plugin apresenta o link final `https://docs.google.com/presentation/d/{id}/edit`.

## Autorização

Ative a Google Drive API em um projeto do Google Cloud e obtenha um access token OAuth 2.0 com o escopo `https://www.googleapis.com/auth/drive.file`. Cole o token no campo exibido quando o formato **Google Apresentações** estiver selecionado. O token permanece apenas na sessão do plugin quando o armazenamento do iframe está disponível.

Para publicação a usuários externos, substitua o campo de token por um fluxo OAuth hospedado com Google Identity Services. Isso exige um Client ID, tela de consentimento e domínio autorizado pertencentes ao produto; esses dados não devem ser embutidos no repositório.

## Fidelidade e edição

Textos são caixas de texto, formas simples são formas nativas e imagens permanecem imagens separadas. Vetores e ícones são transportados como SVG sempre que o Figma permite; grupos com máscaras, blur ou efeitos que não têm equivalente interoperável continuam como imagens isoladas para preservar a aparência. O PowerPoint permite converter um SVG em forma quando for necessária a edição de seus pontos.
