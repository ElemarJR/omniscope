'use client'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  ListsToggle,
  InsertThematicBreak,
  linkPlugin,
  linkDialogPlugin,
} from "@mdxeditor/editor";
import '@mdxeditor/editor/style.css';

export default function ComposerPage() {
  return (
    <div className="p-4">
      <MDXEditor
        markdown="# Hello world"
        contentEditableClassName="prose max-w-none prose-headings:mt-4 prose-headings:mb-2"
        className="prose dark:prose-invert"
        plugins={[
          headingsPlugin({
            allowedHeadingLevels: [1, 2, 3, 4, 5, 6]
          }),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <CreateLink />
                <ListsToggle />
                <InsertThematicBreak />
              </>
            )
          })
        ]}
      />
    </div>
  );
}
