import DemoLayout from "./DemoLayout.jsx";
import { useMaineCabin } from "./useMaineCabin.js";

export default function VrboScreen() {
  const experience = useMaineCabin();
  return <DemoLayout experience={experience} />;
}
