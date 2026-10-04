import { LibraryScreen } from "@/features/library/pages/library-screen";
import { useLocalSearchParams } from "expo-router";

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LibraryScreen key={id} folderId={id} />;
}
