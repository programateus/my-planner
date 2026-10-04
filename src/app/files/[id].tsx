import { FileScreen } from "@/features/library/pages/file-screen";
import { useLocalSearchParams } from "expo-router";

export default function DrawingFileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FileScreen key={id} id={id} />;
}
