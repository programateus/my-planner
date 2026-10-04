import { useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/build/react-navigation";
import { ArrowLeft, Save } from "lucide-react-native";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import goBack from "@/app/utils/go-back";
import { Box } from "@/components/gluestack/box";
import { Button, ButtonIcon, ButtonText } from "@/components/gluestack/button";
import { Text } from "@/components/gluestack/text";
import { Toast, ToastTitle, useToast } from "@/components/gluestack/toast";
import { DrawingCanvas } from "@/features/drawing/components/drawing-canvas";
import { Toolbar } from "@/features/drawing/components/toolbar";
import { DrawingProvider } from "@/features/drawing/contexts/drawing-provider";
import { DocumentData } from "@/features/drawing/domain/document-data";
import { SkiaCanvasDocument } from "@/features/drawing/services/skia-canvas-document";
import { DocumentSaver } from "@/features/library/services/document-saver";

import { LibraryEntry } from "../domain/library-repository";
import { libraryRepository } from "../services/library-repository";

export function FileEditor({
  entry,
  data,
}: {
  entry: LibraryEntry;
  data: DocumentData;
}) {
  const [document] = useState(() => new SkiaCanvasDocument(data));
  const [saver] = useState(
    () =>
      new DocumentSaver((snapshot) =>
        libraryRepository.saveDocument(entry.id, snapshot),
      ),
  );
  const status = useSyncExternalStore(
    saver.subscribe,
    saver.getStatus,
    saver.getStatus,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const navigation = useNavigation();
  const toast = useToast();

  const flush = useCallback(async () => {
    setSaveError(null);
    try {
      await saver.flush();
      return true;
    } catch {
      setSaveError("Não foi possível salvar. Tente novamente antes de sair.");
      return false;
    }
  }, [saver]);

  const handleSave = async () => {
    if (!(await flush())) return;
    const toastId = `file-saved-${entry.id}`;
    if (toast.isActive(toastId)) return;
    toast.show({
      id: toastId,
      placement: "bottom",
      duration: 3000,
      render: ({ id }) => (
        <Toast nativeID={id} action="success" variant="solid">
          <ToastTitle className="text-foreground">Arquivo salvo</ToastTitle>
        </Toast>
      ),
    });
  };

  usePreventRemove(status !== "saved", ({ data: actionData }) => {
    void flush().then((success) => {
      if (success) navigation.dispatch(actionData.action);
    });
  });

  useLayoutEffect(
    () => document.subscribe(() => saver.save(document.snapshot())),
    [document, saver],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") void saver.flush().catch(() => {});
    });
    return () => {
      subscription.remove();
      void saver.flush().catch(() => {});
    };
  }, [saver]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.addEventListener !== "function"
    )
      return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (saver.getStatus() === "saved") return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [saver]);

  return (
    <DrawingProvider document={document}>
      <Box className="flex-1 bg-background">
        <SafeAreaView style={{ flex: 1 }}>
          <Box className="flex-row items-center gap-2 px-3 py-2 border-b border-border">
            <Button
              variant="ghost"
              className="min-h-12 min-w-12 px-2"
              accessibilityLabel="Salvar e voltar aos arquivos"
              onPress={() => {
                void flush().then((success) => {
                  if (success) goBack();
                });
              }}
            >
              <ButtonIcon as={ArrowLeft} />
            </Button>
            <Box className="flex-1 gap-1">
              <Text className="font-semibold text-foreground" numberOfLines={1}>
                {entry.name}
              </Text>
              <Text
                className={`text-xs ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
                accessibilityLiveRegion="polite"
              >
                {status === "saved"
                  ? "Salvo neste dispositivo"
                  : status === "saving"
                    ? "Salvando…"
                    : "Falha ao salvar"}
              </Text>
            </Box>
            <Button
              variant="outline"
              className="min-h-12"
              isDisabled={status === "saving"}
              onPress={() => void handleSave()}
            >
              <ButtonIcon as={Save} />
              <ButtonText>
                {status === "error" ? "Tentar salvar" : "Salvar"}
              </ButtonText>
            </Button>
          </Box>
          {saveError && (
            <Text
              className="text-destructive px-4 py-2"
              accessibilityLiveRegion="polite"
            >
              {saveError}
            </Text>
          )}
          <Toolbar />
          <DrawingCanvas />
        </SafeAreaView>
      </Box>
    </DrawingProvider>
  );
}
