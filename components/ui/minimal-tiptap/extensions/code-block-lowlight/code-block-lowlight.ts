import { CodeBlockLowlight as TiptapCodeBlockLowlight, type CodeBlockLowlightOptions } from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"

export const CodeBlockLowlight = TiptapCodeBlockLowlight.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      lowlight: createLowlight(common),
      defaultLanguage: null,
      languageClassPrefix: "language-",
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      enableTabIndentation: false,
      tabSize: 4,
      HTMLAttributes: {
        class: "block-node",
      },
    } as CodeBlockLowlightOptions
  },
})

export default CodeBlockLowlight
