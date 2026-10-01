# Planner App

Aplicativo Expo SDK 57 com React Native e Expo Router. As rotas ficam em `src/app/`.

## Desenvolvimento

```bash
npm ci
npx expo start
npx expo lint
npm run typecheck
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

React Native Web fica fixado em `0.21.2` para evitar o [import circular do UniWind 1.12.1 com React Native Web 0.21.3](https://github.com/uni-stack/uniwind/issues/704). Essa versão passa na verificação de compatibilidade do Expo.
