import { useCallback, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import type { RenderElementProps } from "slate-react";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  createEditor,
  Element as SlateElement,
  Editor,
  Transforms,
} from "slate";
import type { Descendant, NodeEntry, Operation } from "slate";
import { nanoid } from "nanoid";

import type { CustomElement } from "~/components/slate.types";

export const meta: MetaFunction = () => {
  return [
    { title: "Bullets" },
    { name: "description", content: "Self-hosted Workflowy Alternative" },
  ];
};

const Element = ({ attributes, children, element }: RenderElementProps) => {
  return (
    <p
      style={{
        marginLeft: 16 * (element.level - 1),
      }}
      {...{
        ...attributes,
        "data-level": element.level,
      }}
    >
      {children}
    </p>
  );
};

const withBullets = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (
    entry: NodeEntry,
    options?: {
      operation?: Operation;
    }
  ) => {
    const [node, path] = entry;

    if (SlateElement.isElement(node) && (!node.level || node.level < 1)) {
      Transforms.setNodes(editor, { level: 1 }, { at: path });
      return;
    }

    normalizeNode(entry);
  };

  return editor;
};

export default function EditIndex() {
  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  // Create a Slate editor object that won't change across renders.
  const [editor] = useState(() =>
    withBullets(withHistory(withReact(createEditor())))
  );

  const [value, setValue] = useState<Descendant[]>([
    {
      level: 1,
      children: [{ text: "Start writing here." }],
    },
  ]);

  return (
    <main className="bg-stone-100">
      <Slate
        editor={editor}
        initialValue={value}
        onChange={(val) => {
          const isAstChange = editor.operations.some(
            (op) => "set_selection" !== op.type
          );
          if (isAstChange) {
            // Serialize the value and save the string value to Local Storage.
            setValue(val);
          }
        }}
      >
        <Editable
          renderElement={renderElement}
          disableDefaultStyles
          style={{
            position: "relative",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            outline: "unset",
          }}
          className="p-4 shadow-2xl min-h-screen bg-white prose prose-stone max-w-3xl mx-auto dark:prose-invert"
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              event.preventDefault();

              const direction = event.shiftKey ? -1 : 1;

              const nodeEntry = Editor.above(editor, {
                at: editor.selection?.anchor.path ?? [],
              });

              if (!nodeEntry) {
                return;
              }

              const [node, path] = nodeEntry;

              Transforms.setNodes(
                editor,
                { level: (node as CustomElement).level + direction },
                {
                  at: path,
                }
              );
              return;
            }

            if (event.key === "s" && event.metaKey) {
              event.preventDefault();
              console.log("save");
              console.log(value);
            }
          }}
        />
      </Slate>
    </main>
  );
}
