import { useLocalSearchParams } from "expo-router";
import { LibraryScreen } from "@/features/library/components/library-screen";

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LibraryScreen key={id} folderId={id} />;
}
