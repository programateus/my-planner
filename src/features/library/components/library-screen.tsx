import { router, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  Files,
  Folder,
  FolderPlus,
  Pencil,
  Plus,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Modal, TextInput } from "react-native";

import { Box } from "@/components/gluestack/box";
import { Button, ButtonIcon, ButtonText } from "@/components/gluestack/button";
import { Pressable } from "@/components/gluestack/pressable";
import { SafeAreaView } from "@/components/gluestack/safe-area-view";
import { Text } from "@/components/gluestack/text";
import type { LibraryEntry } from "../domain/library-repository";
import { libraryRepository } from "../services/library-repository";

type NamePrompt = { kind: LibraryEntry["kind"]; entry?: LibraryEntry };

export function LibraryScreen({
  folderId = null,
}: {
  folderId?: string | null;
}) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [folder, setFolder] = useState<LibraryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<NamePrompt | null>(null);
  const [name, setName] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [gridWidth, setGridWidth] = useState(0);
  const gridColumns = Math.max(2, Math.floor((gridWidth - 20) / 172));

  const load = useCallback(async () => {
    setError(null);
    try {
      const [items, parent] = await Promise.all([
        libraryRepository.list(folderId),
        folderId ? libraryRepository.getEntry(folderId) : Promise.resolve(null),
      ]);
      if (folderId && parent?.kind !== "folder")
        throw new Error("Pasta não encontrada.");
      setEntries(items);
      setFolder(parent);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível carregar os arquivos.",
      );
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const open = (entry: LibraryEntry) => {
    router.push({
      pathname: entry.kind === "folder" ? "/folders/[id]" : "/files/[id]",
      params: { id: entry.id },
    });
  };
  const showPrompt = (value: NamePrompt) => {
    setName(value.entry?.name ?? "");
    setPromptError(null);
    setPrompt(value);
  };
  const submit = async () => {
    if (!prompt || busy) return;
    setBusy(true);
    setPromptError(null);
    try {
      if (prompt.entry) {
        await libraryRepository.rename(prompt.entry, name);
        setPrompt(null);
        await load();
      } else {
        const entry = await libraryRepository.create(
          prompt.kind,
          name,
          folderId,
        );
        setPrompt(null);
        await load();
        if (entry.kind === "file") open(entry);
      }
    } catch (cause) {
      setPromptError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box className="flex-1 bg-background">
      <SafeAreaView style={{ flex: 1 }}>
        <Box className="p-4 gap-4 border-b border-border">
          <Box className="flex-row items-center gap-2">
            {folderId && (
              <Button
                variant="ghost"
                className="min-h-12 min-w-12 px-2"
                accessibilityLabel="Voltar à pasta anterior"
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace("/")
                }
              >
                <ButtonIcon as={ArrowLeft} />
              </Button>
            )}
            <Box className="flex-1 gap-1">
              <Text
                className="text-2xl font-bold text-foreground"
                numberOfLines={1}
              >
                {folder?.name ?? (folderId ? "Pasta" : "Meus arquivos")}
              </Text>
            </Box>
          </Box>
          <Box className="flex-row flex-wrap gap-3">
            <Button
              className="min-h-12"
              isDisabled={loading || !!error}
              onPress={() => showPrompt({ kind: "file" })}
            >
              <ButtonIcon as={Plus} />
              <ButtonText>Novo arquivo</ButtonText>
            </Button>
            <Button
              variant="outline"
              className="min-h-12"
              isDisabled={loading || !!error}
              onPress={() => showPrompt({ kind: "folder" })}
            >
              <ButtonIcon as={FolderPlus} />
              <ButtonText>Nova pasta</ButtonText>
            </Button>
          </Box>
        </Box>
        {loading ? (
          <ActivityIndicator
            style={{ marginTop: 48 }}
            accessibilityLabel="Carregando arquivos"
          />
        ) : error ? (
          <Box className="p-6 items-center gap-4">
            <Text className="text-destructive text-center">{error}</Text>
            <Button variant="outline" onPress={() => void load()}>
              <ButtonText>Tentar novamente</ButtonText>
            </Button>
          </Box>
        ) : (
          <FlatList
            key={gridColumns}
            data={entries}
            numColumns={gridColumns}
            onLayout={({ nativeEvent }) =>
              setGridWidth(nativeEvent.layout.width)
            }
            keyExtractor={(entry) => entry.id}
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingVertical: 16,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              <Box className="flex-1 items-center justify-center gap-3 px-6 py-12">
                <Folder size={42} color="#8A94A6" />
                <Text className="text-lg font-semibold text-foreground">
                  {folderId
                    ? "Esta pasta está vazia"
                    : "Seu próximo plano começa aqui"}
                </Text>
                <Text className="text-muted-foreground text-center">
                  Crie um arquivo para desenhar ou uma pasta para organizar seus
                  planos.
                </Text>
              </Box>
            }
            renderItem={({ item }) => (
              <Box
                className="px-1.5 mb-5"
                style={{ width: `${100 / gridColumns}%` }}
              >
                <Pressable
                  className="gap-3"
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${item.kind === "folder" ? "pasta" : "arquivo"} ${item.name}`}
                  onPress={() => open(item)}
                >
                  <Box
                    className={`items-center justify-center rounded-3xl border border-border ${item.kind === "folder" ? "bg-primary/10" : "bg-card"}`}
                    style={{ aspectRatio: 1 }}
                  >
                    {item.kind === "folder" ? (
                      <Folder size={52} color="#208AEF" strokeWidth={1.5} />
                    ) : (
                      <Files size={52} color="#8A94A6" strokeWidth={1.5} />
                    )}
                  </Box>
                  <Box className="gap-1 px-1">
                    <Text
                      className="font-semibold text-foreground leading-5 min-h-10"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="text-xs text-muted-foreground"
                      numberOfLines={1}
                    >
                      {item.kind === "folder"
                        ? "Pasta"
                        : `Editado em ${new Date(item.updatedAt).toLocaleDateString("pt-BR")}`}
                    </Text>
                  </Box>
                </Pressable>
                <Button
                  variant="ghost"
                  className="absolute top-1 right-2.5 min-h-12 min-w-12 px-2 rounded-full"
                  accessibilityLabel={`Renomear ${item.name}`}
                  onPress={() => showPrompt({ kind: item.kind, entry: item })}
                >
                  <ButtonIcon as={Pencil} />
                </Button>
              </Box>
            )}
          />
        )}
        <Modal
          visible={prompt !== null}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!busy) setPrompt(null);
          }}
        >
          <Box className="flex-1 justify-center bg-black/50 px-6">
            <Box className="rounded-2xl bg-background p-6 gap-4">
              <Text className="text-xl font-bold text-foreground">
                {prompt?.entry
                  ? "Renomear"
                  : prompt?.kind === "folder"
                    ? "Nova pasta"
                    : "Novo arquivo"}
              </Text>
              <TextInput
                autoFocus
                value={name}
                onChangeText={setName}
                maxLength={120}
                editable={!busy}
                accessibilityLabel="Nome"
                placeholder="Digite o nome"
                placeholderTextColor="#8A94A6"
                returnKeyType="done"
                onSubmitEditing={() => void submit()}
                style={{
                  borderWidth: 1,
                  borderColor: "#AAB2C0",
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 16,
                  backgroundColor: "#FFFFFF",
                  color: "#171717",
                }}
              />
              {promptError && (
                <Text className="text-destructive">{promptError}</Text>
              )}
              <Box className="flex-row justify-end gap-3">
                <Button
                  variant="ghost"
                  isDisabled={busy}
                  onPress={() => setPrompt(null)}
                >
                  <ButtonText>Cancelar</ButtonText>
                </Button>
                <Button
                  isDisabled={busy || !name.trim()}
                  onPress={() => void submit()}
                >
                  <ButtonText>
                    {busy ? "Salvando…" : prompt?.entry ? "Salvar" : "Criar"}
                  </ButtonText>
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      </SafeAreaView>
    </Box>
  );
}
