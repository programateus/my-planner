# Componentes gluestack-ui

Catálogo completo: 59 módulos, incluindo o provider. Importe diretamente do módulo utilizado para evitar carregar o catálogo inteiro na inicialização do aplicativo.

```tsx
import { Button, ButtonText } from '@/components/ui/button';

<Button onPress={() => console.log('Salvar')}>
  <ButtonText>Salvar</ButtonText>
</Button>
```

- `accordion`
- `actionsheet`
- `alert`
- `alert-dialog`
- `avatar`
- `badge`
- `bottomsheet`
- `box`
- `button`
- `calendar`
- `card`
- `center`
- `chat-ai`
- `checkbox`
- `date-time-picker`
- `divider`
- `drawer`
- `fab`
- `flat-list`
- `form-control`
- `gluestack-ui-provider`
- `grid`
- `heading`
- `hstack`
- `icon`
- `image`
- `image-background`
- `image-viewer`
- `input`
- `input-accessory-view`
- `keyboard-avoiding-view`
- `link`
- `liquid-glass`
- `menu`
- `modal`
- `popover`
- `portal`
- `pressable`
- `progress`
- `radio`
- `refresh-control`
- `safe-area-view`
- `scroll-view`
- `section-list`
- `select`
- `skeleton`
- `slider`
- `spinner`
- `status-bar`
- `switch`
- `table`
- `tabs`
- `text`
- `textarea`
- `toast`
- `tooltip`
- `view`
- `virtualized-list`
- `vstack`

Fonte: [starter kit oficial com UniWind](https://github.com/gluestack/gluestack-ui/tree/b712c8541c85d57becbd1a1b2ba150a369223eb6/apps/starter-kit-expo-uniwind/components/ui), adaptado ao Expo SDK 57, React 19 e às dependências instaladas. Os arquivos com sufixo `.web.tsx` são selecionados automaticamente pelo Metro.

`chat-ai` inclui os componentes de conversa, mensagens, anexos, seletor de modelos, entrada de prompts e árvore de arquivos. A integração com um serviço de IA deve ser feita pela aplicação.

Gestos, área segura, teclado, overlays e toasts têm providers no layout raiz. Se estiver usando um development build existente, gere uma nova build após a instalação das dependências nativas de teclado e seleção de data.
