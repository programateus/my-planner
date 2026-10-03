# Planner App

O Planner App é um aplicativo de planejamento e anotações à mão livre. Ele funciona como um caderno digital: você cria arquivos, organiza tudo em pastas e usa páginas em branco ou modelos de planner para registrar planos, tarefas e ideias.

O projeto é desenvolvido com Expo SDK 57, React Native e TypeScript, com foco em dispositivos móveis e código para Android, iOS e web.

## Funcionalidades

- Criação e renomeação de arquivos e pastas, incluindo pastas aninhadas.
- Desenho com caneta, marca-texto e borracha, com seleção de cores e espessuras.
- Modelos de página para planejamento diário, semanal e mensal.
- Múltiplas páginas, zoom e navegação pelo caderno.
- Desfazer e refazer durante a sessão de edição.
- Salvamento automático e manual, com indicação do estado de salvamento.
- Tema claro ou escuro conforme a configuração do dispositivo.

Os dados ficam no próprio dispositivo: SQLite no Android e iOS e IndexedDB no navegador. Atualmente, não há sincronização entre dispositivos nem exportação dos documentos.

## Como rodar

### Pré-requisitos

- Node.js 22.13 ou superior, conforme os [requisitos do Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/).
- npm, que acompanha a instalação do Node.js. O projeto usa `package-lock.json`.
- Para testar no celular, Expo Go compatível com o SDK 57.
- Para testar em emulador Android, Android Studio com um dispositivo virtual configurado. O simulador iOS exige macOS e Xcode.

### Instalar e iniciar

Na pasta do projeto, instale as dependências:

```bash
npm ci
```

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Com o servidor aberto:

- **Celular:** conecte o computador e o celular à mesma rede Wi-Fi e abra o QR code no Expo Go. No Android, use o leitor do Expo Go; no iOS, use a câmera. Em um iPhone físico, entre na mesma conta Expo no aplicativo e na CLI (`npx expo login`).
- **Android:** com o emulador configurado e aberto, pressione `a` no terminal.
- **iOS:** no macOS, com o simulador configurado, pressione `i`.
- **Web:** pressione `w` para abrir no navegador.

Esses passos seguem o [guia de execução do Expo](https://docs.expo.dev/get-started/start-developing/). O Expo Go inclui apenas os módulos nativos disponibilizados por ele; ao adicionar um módulo não incluído, será necessário um [development build](https://docs.expo.dev/get-started/set-up-your-environment/).

Também é possível iniciar diretamente para uma plataforma:

```bash
npm run android
npm run ios
npm run web
```

Se o celular não conseguir acessar o servidor pela rede local, tente:

```bash
npx expo start --tunnel
```

No Windows, caso o PowerShell bloqueie os scripts `npm.ps1` ou `npx.ps1`, use `npm.cmd` e `npx.cmd` nos comandos acima.

## Primeiros passos no aplicativo

1. Na tela **Meus arquivos**, escolha **Novo arquivo** e dê um nome ao documento.
2. Use a barra de ferramentas para escolher a caneta, o marca-texto ou a borracha e ajustar a cor e a espessura.
3. Se desejar, aplique um modelo diário, semanal ou mensal à página.
4. As alterações são salvas automaticamente. O botão **Salvar** permite solicitar o salvamento manualmente.
5. Volte à biblioteca para criar pastas e organizar outros documentos. O ícone de lápis permite renomear arquivos e pastas.

## Tecnologias e estrutura

- **Expo Router:** navegação baseada em arquivos em `src/app/`.
- **React Native Skia:** renderização do desenho e dos modelos de planner.
- **React Native Gesture Handler e Reanimated:** gestos e animações do editor.
- **gluestack-ui, UniWind e Tailwind CSS 4:** componentes, estilos e tema.
- **expo-sqlite e IndexedDB:** persistência local dos arquivos e desenhos.

```text
src/
  app/                  Rotas e layout de navegação
  features/
    drawing/            Canvas, ferramentas, modelos e histórico de desenho
    library/            Biblioteca de arquivos, pastas e persistência
  components/
    gluestack/          Componentes de interface
  global.css            Estilos e tokens de tema
assets/                 Fontes, ícones e imagens
app.json                Configuração do Expo
```

## Verificações de desenvolvimento

```bash
npm run lint
npm run typecheck
```

Para adicionar dependências, use `npx expo install <pacote>` para resolver versões compatíveis com o SDK. Consulte a [documentação do Expo CLI](https://docs.expo.dev/more/expo-cli/) para os comandos disponíveis.
