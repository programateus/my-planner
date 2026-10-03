import {
  Canvas,
  Group,
  Picture,
  Rect,
  type SkPicture,
} from "@shopify/react-native-skia";
import { Check, LayoutTemplate, X } from "lucide-react-native";
import { useState } from "react";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { Box } from "@/components/gluestack/box";
import { Button, ButtonIcon } from "@/components/gluestack/button";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@/components/gluestack/modal";
import { Pressable } from "@/components/gluestack/pressable";
import { Text } from "@/components/gluestack/text";

import { useDrawingSession } from "@/features/drawing/contexts/drawing-session-context";
import { usePlannerTemplate } from "@/features/drawing/contexts/planner-template-context";
import { PLANNER_TEMPLATES } from "@/features/drawing/domain/planner-template";
import { PAGE_HEIGHT, PAGE_WIDTH } from "@/features/drawing/geometry/notebook-geometry";

const PREVIEW_WIDTH = 64;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH * PAGE_HEIGHT) / PAGE_WIDTH;

function TemplatePreview({
  picture,
  dark,
}: {
  picture?: SkPicture;
  dark: boolean;
}) {
  return (
    <Box
      pointerEvents="none"
      className="overflow-hidden rounded border border-border"
    >
      <Canvas style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}>
        <Rect
          x={0}
          y={0}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
          color={dark ? "#25272D" : "#FFFFFF"}
        />
        {picture && (
          <Group transform={[{ scale: PREVIEW_WIDTH / PAGE_WIDTH }]}>
            <Picture picture={picture} />
          </Group>
        )}
      </Canvas>
    </Box>
  );
}

export function PageTemplateSelectorButton() {
  const { currentPage } = useDrawingSession();
  const { templates, applyTemplate, pictures, error, dark } =
    usePlannerTemplate();
  const [visiblePage, setVisiblePage] = useState(0);
  const [targetPage, setTargetPage] = useState<number | null>(null);
  useAnimatedReaction(
    () => currentPage.get(),
    (next, previous) => {
      if (next !== previous) scheduleOnRN(setVisiblePage, next);
    },
  );
  const selectedTemplate =
    targetPage === null ? null : (templates[targetPage] ?? null);
  const close = () => setTargetPage(null);
  const options = [
    ...PLANNER_TEMPLATES,
    {
      id: null,
      label: "Em branco",
      description: "Uma folha livre para suas ideias.",
    },
  ];

  return (
    <>
      <Box>
        <Button
          variant="outline"
          className="min-h-12 gap-2"
          accessibilityLabel={`Escolher modelo da folha ${visiblePage + 1}`}
          onPress={() => setTargetPage(currentPage.get())}
        >
          <ButtonIcon as={LayoutTemplate} className="h-5 w-5" />
        </Button>
      </Box>
      <Modal isOpen={targetPage !== null} onClose={close} size="lg">
        <ModalBackdrop />
        <ModalContent
          accessibilityLabel={`Modelos da folha ${(targetPage ?? 0) + 1}`}
          className="max-w-[500px] p-4"
          style={{ maxHeight: "85%" }}
        >
          <ModalHeader>
            <Text className="text-lg font-semibold text-foreground">
              Modelo da folha {(targetPage ?? 0) + 1}
            </Text>
            <Button
              variant="ghost"
              className="min-h-12 min-w-12 px-2"
              accessibilityLabel="Fechar modelos"
              onPress={close}
            >
              <ButtonIcon as={X} className="h-5 w-5" />
            </Button>
          </ModalHeader>
          <Text className="mt-1 text-sm text-muted-foreground">
            Escolha o fundo desta folha. Seus desenhos continuam no lugar.
          </Text>
          {!pictures && (
            <Text
              accessibilityRole="alert"
              className="mt-2 text-sm text-muted-foreground"
            >
              {error
                ? "Não foi possível carregar os modelos. Reabra o app para tentar novamente."
                : "Carregando modelos…"}
            </Text>
          )}
          <ModalBody
            scrollEnabled
            className="mb-0 mt-4"
            contentContainerStyle={{ gap: 10 }}
          >
            {options.map(({ id, label, description }) => {
              const selected = selectedTemplate === id;
              const disabled = id !== null && !pictures;
              return (
                <Pressable
                  key={id ?? "blank"}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}. ${description}`}
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  className={`flex-row items-center gap-3 rounded-lg border p-3 ${selected ? "border-primary bg-muted" : "border-border bg-background"} ${disabled ? "opacity-50" : ""}`}
                  onPress={() => {
                    if (targetPage === null) return;
                    applyTemplate(targetPage, id);
                    close();
                  }}
                >
                  <TemplatePreview
                    picture={id === null ? undefined : pictures?.[id]}
                    dark={dark}
                  />
                  <Box className="flex-1 gap-1">
                    <Text className="font-semibold text-foreground">
                      {label}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {description}
                    </Text>
                  </Box>
                  {selected && (
                    <Check size={20} color={dark ? "#DDE2E8" : "#334155"} />
                  )}
                </Pressable>
              );
            })}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
