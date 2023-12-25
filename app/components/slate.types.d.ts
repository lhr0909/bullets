import type { Descendant, BaseEditor, BaseRange, Range, Element } from "slate";
import type { ReactEditor } from "slate-react";
import type { HistoryEditor } from "slate-history";

export type CustomElement = {
  level: number;
  children: Descendant[];
};

export type CustomText = {
  text: string;
};

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>;
  };

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}
