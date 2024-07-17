"use client";

import CustomCodeRenderer from "@/components/renderers/CustomCodeRenderer";
import CustomImageRenderer from "@/components/renderers/CustomImageRenderer";
import { FC } from "react";
import dynamic from "next/dynamic";

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false }
);

interface EditorOutputProps {
  content: any; // Replace `any` with your content type
}

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
  // Add custom renderers for other block types if necessary
};

const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  // Function to remove blocks with empty content arrays
  const removeEmptyContentBlocks = (blocks: any) => {
    return blocks.filter((block: any) => {
      // Assume a block is empty if its content array is empty
      // This could be adjusted based on the structure of your blocks
      return !(
        block.type === "table" &&
        Array.isArray(block.data.content) &&
        block.data.content.length === 0
      );
    });
  };

  // Check if content is available and has blocks
  if (content && Array.isArray(content.blocks)) {
    content.blocks = removeEmptyContentBlocks(content.blocks);
  }

  return (
    <Output
      style={style}
      className="text-sm"
      renderers={renderers}
      data={content}
    />
  );
};

export default EditorOutput;
