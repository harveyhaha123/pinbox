import { useEditor } from "./store";

export async function downloadLocalZip() {
  useEditor.setState({
    status: "你已经在电脑上跑校准器了。源码在 GitHub：github.com/harveyhaha123/pinbox",
  });
}
