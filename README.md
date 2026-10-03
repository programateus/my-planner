# Planner App

Aplicativo Expo SDK 57 com React Native e Expo Router. As rotas ficam em `src/app/`.

## Desenvolvimento

```bash
npm ci
npx expo start
npx expo lint
npm run typecheck
npm test
```

## Interface e tema

O projeto usa [gluestack-ui v5](https://gluestack.io/ui/docs/home/getting-started/installation) com [UniWind](https://docs.uniwind.dev/quickstart) e Tailwind CSS 4 para Android, iOS e web.

- `src/components/ui/`: catálogo completo de 59 módulos gluestack. Veja a [lista e exemplo de uso](src/components/ui/README.md).
- `src/global.css`: tokens dos modos claro e escuro, cores e tipografia.
- `src/app/_layout.tsx`: importação do CSS e provider com `mode="system"`, seguindo o tema do dispositivo.
- `metro.config.js`: integração do UniWind e geração de `src/uniwind-types.d.ts`.

Use classes semânticas para que as cores acompanhem o modo ativo:

```tsx
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

<Box className="flex-1 bg-background p-4">
  <Text size="lg" bold className="text-foreground">Planner</Text>
  <Text className="text-muted-foreground">Organize suas notas.</Text>
</Box>
```

Para componentes que recebem cores por props, como o canvas Skia, use `useResolveClassNames('text-foreground')` do UniWind. Para forçar um modo, altere o `mode` do provider para `light` ou `dark`.

Dependências novas devem ser instaladas com `npx expo install` para manter a compatibilidade com o SDK.

## Arquivos e persistência

A tela inicial lista arquivos e pastas. Crie pastas dentro de outras pastas, dê um nome ao arquivo e abra-o para desenhar. O botão de lápis ao lado de cada item permite renomeá-lo.

No Android e iOS, `expo-sqlite` guarda os metadados em `folders` e `files` no banco local `planner.db`. O campo `parentId` permite pastas aninhadas; o conteúdo de cada arquivo é um JSON versionado na coluna `files.data`. A listagem consulta apenas metadados e carrega os traços quando o arquivo é aberto. Na web, o repositório usa IndexedDB, com metadados e desenhos em stores separados.

`Stroke` contém somente `id`, `pageIndex`, pontos `{ x, y, width }` e estilo `{ color, width, tool }`. A largura por ponto preserva a pressão aplicada durante o desenho. `SkPath` e `SkPaint` pertencem à camada de renderização e são reconstruídos ao abrir o arquivo. O documento também guarda a quantidade de páginas, inclusive páginas vazias, e os modelos de cada página.

Traços concluídos, desfazer/refazer, modelos e novas páginas disparam salvamento automático. `DocumentSaver` serializa as gravações, mantém a versão mais recente na fila e conserva alterações após falhas para tentar novamente. O editor mostra o estado de salvamento, oferece salvamento manual e aguarda a gravação antes de voltar. O histórico de desfazer/refazer é mantido apenas durante a sessão aberta.

Os arquivos ficam no armazenamento local do app ou navegador. Esta implementação não exporta arquivos `.json` nem sincroniza dados entre dispositivos. Para um development build existente, gere um novo build após instalar `expo-sqlite`.

`npm test` verifica serialização, reconstrução da geometria dos traços, histórico, fila de salvamento, recuperação de falhas e consultas do repositório em um SQLite real usando Node 24.

React Native Web fica fixado em `0.21.2` para evitar o [import circular do UniWind 1.12.1 com React Native Web 0.21.3](https://github.com/uni-stack/uniwind/issues/704). Essa versão passa na verificação de compatibilidade do Expo.
