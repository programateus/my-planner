import { useLocalSearchParams } from "expo-router";
import { FileScreen } from "@/features/library/components/file-screen";

export default function DrawingFileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FileScreen key={id} id={id} />;
}
