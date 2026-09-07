# Pesquisa funcional — 2026-09-07

Fontes primárias consultadas antes da implementação. Implementação independente; nenhuma leitura de código fechado, assets ou endpoints privados.

## Figma
- [Manifest](https://developers.figma.com/docs/plugins/manifest/): ID atribuído pelo Figma; documentAccess dynamic-page obrigatório; allowlist de rede. Design, Slides e Buzz são editorTypes possíveis, mas a declaração não garante compatibilidade.
- [Quickstart](https://developers.figma.com/docs/plugins/plugin-quickstart-guide/): desenvolvimento e teste por import de manifest no Desktop.
- [showUI](https://developers.figma.com/docs/plugins/api/properties/figma-showui/): iframe e resize; tema via themeColors.
- [postMessage](https://developers.figma.com/docs/plugins/api/properties/figma-ui-postmessage/): ponte explícita UI/sandbox. Validar comandos e payloads.
- [Plugin data](https://developers.figma.com/docs/plugins/api/properties/nodes-setplugindata/): limite 100 kB por entrada; não é cofre. Guardar metadados por nó e não imagens.
- [clientStorage](https://developers.figma.com/docs/plugins/api/figma-clientStorage/): 5 MB, local, ligado ao plugin ID. Preferências apenas.
- [exportAsync](https://developers.figma.com/docs/plugins/api/properties/nodes-exportasync/): SVG, PNG, PDF e outros formatos documentados. Usar fallback por layer e manter texto editável quando viável.
- [Texto](https://developers.figma.com/docs/plugins/working-with-text/): carregar fonte antes de criar/alterar texto.
- [Variáveis](https://developers.figma.com/docs/plugins/working-with-variables/): bindings requerem resolução; export começa pelo valor visual resolvido.
- [SlideNode](https://developers.figma.com/docs/plugins/api/SlideNode/): Slides dentro de SlideRow, tamanho fixo 1920×1080; não supor top-level frames.
- [Rede](https://developers.figma.com/docs/plugins/making-network-requests/): CORS continua aplicável; allowlist não substitui política do servidor.
- [OAuth](https://developers.figma.com/docs/plugins/oauth-with-plugins/): Desktop abre browser externo sem opener; usar servidor público, state e PKCE, não fluxo baseado apenas em popup postMessage.

## Pitchdeck — comportamento público
|Recurso|Comportamento|Proposta independente|
|---|---|---|
|Slides|Frames/components/instances na página|Adaptador incremental com IDs|
|Ordenação|Layers, nome, posição e drag|Funções puras e ordem persistida|
|Animação|Presets, timeline e copiar/colar; web|Web Animations API e schema próprio|
|Keyframes|X/Y, escala, rotação, opacidade e easing|Keyframes declarativos validados|
|PPTX|Texto/shapes editáveis e fallback; sem animações/iframes|PptxGenJS com relatório de perdas|
|PDF|Links internos/externos e senha|pdf-lib; criptografia requer motor adicional|
|Remoto|Janela secundária e QR|BroadcastChannel local e Realtime protegido|
|Publicação|URL e senha|Auth, versões imutáveis e senha com hash|
|Analytics|Sessões, duração e conclusão|Eventos mínimos agregados|
|HTML|Wrapper iframe do deck hospedado|Distinguir wrapper de export autônomo|

Fontes: [Slides](https://docs.hypermatic.com/pitchdeck/design/slides), [Sort](https://docs.hypermatic.com/pitchdeck/workflow/sort), [Animations](https://docs.hypermatic.com/pitchdeck/design/animations), [Keyframes](https://docs.hypermatic.com/pitchdeck/design/keyframes), [PPTX](https://docs.hypermatic.com/pitchdeck/export/powerpoint), [PDF](https://docs.hypermatic.com/pitchdeck/export/pdf), [Remote](https://docs.hypermatic.com/pitchdeck/web/remote), [Upload](https://docs.hypermatic.com/pitchdeck/web/upload), [Analytics](https://docs.hypermatic.com/pitchdeck/web/analytics), [Embed](https://docs.hypermatic.com/pitchdeck/web/embed), [Overview](https://docs.hypermatic.com/pitchdeck/overview/quickstart).

## Limites da pesquisa
Confirmados os contratos essenciais de execução local. Buzz, import avançado, OAuth, segurança cloud e fidelidade de cada destino precisam de verificação específica na fase correspondente. Não inferimos a arquitetura interna do concorrente. Pesquisa parou após evidência suficiente para a primeira implementação local; funcionalidades restantes continuam TODO.
