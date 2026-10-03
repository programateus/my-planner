import { router, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { ArrowLeft, Save } from "lucide-react-native";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { ActivityIndicator, AppState } from "react-native";

import { Box } from "@/components/gluestack/box";
import { Button, ButtonIcon, ButtonText } from "@/components/gluestack/button";
import { SafeAreaView } from "@/components/gluestack/safe-area-view";
import { Text } from "@/components/gluestack/text";
import { Toast, ToastTitle, useToast } from "@/components/gluestack/toast";
import { DrawingCanvas } from "@/features/drawing/components/drawing-canvas";
import { Toolbar } from "@/features/drawing/components/toolbar";
import { DrawingProvider } from "@/features/drawing/contexts/drawing-provider";
import type { DocumentData } from "@/features/drawing/domain/document-data";
import { SkiaCanvasDocument } from "@/features/drawing/services/skia-canvas-document";
import type { LibraryEntry } from "@/features/library/domain/library-repository";
import { DocumentSaver } from "@/features/library/services/document-saver";
import { libraryRepository } from "@/features/library/services/library-repository";

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

async function readFile(id: string) {
  const [entry, data] = await Promise.all([
    libraryRepository.getEntry(id),
    libraryRepository.loadDocument(id),
  ]);
  if (entry?.kind !== "file") throw new Error("Arquivo não encontrado.");
  return { entry, data };
}

export function FileScreen({ id }: { id: string }) {
  const [loaded, setLoaded] = useState<{
    entry: LibraryEntry;
    data: DocumentData;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void readFile(id).then(
      (value) => {
        if (active) setLoaded(value);
      },
      (cause) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível abrir o arquivo.",
          );
      },
    );
    return () => {
      active = false;
    };
  }, [id, attempt]);

  if (loaded) return <FileEditor entry={loaded.entry} data={loaded.data} />;
  return (
    <Box className="flex-1 bg-background">
      <SafeAreaView style={{ flex: 1 }}>
        <Button
          variant="ghost"
          className="self-start m-3 min-h-12"
          onPress={goBack}
        >
          <ButtonIcon as={ArrowLeft} />
          <ButtonText>Meus arquivos</ButtonText>
        </Button>
        {error ? (
          <Box className="p-6 items-center gap-4">
            <Text className="text-destructive text-center">{error}</Text>
            <Button
              variant="outline"
              onPress={() => {
                setError(null);
                setAttempt((value) => value + 1);
              }}
            >
              <ButtonText>Tentar novamente</ButtonText>
            </Button>
          </Box>
        ) : (
          <ActivityIndicator
            style={{ marginTop: 48 }}
            accessibilityLabel="Abrindo desenho"
          />
        )}
      </SafeAreaView>
    </Box>
  );
}

function FileEditor({
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
