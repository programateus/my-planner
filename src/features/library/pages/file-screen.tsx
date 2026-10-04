import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import goBack from "@/app/utils/go-back";
import { Box } from "@/components/gluestack/box";
import { Button, ButtonIcon, ButtonText } from "@/components/gluestack/button";
import { SafeAreaView } from "@/components/gluestack/safe-area-view";
import { Text } from "@/components/gluestack/text";

import type { DocumentData } from "@/features/drawing/domain/document-data";
import type { LibraryEntry } from "@/features/library/domain/library-repository";
import { libraryRepository } from "@/features/library/services/library-repository";

import { FileEditor } from "../components/file-editor";

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
