import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "px-to-rem.convert",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "Open a file first to convert px to rem!"
        );
        return;
      }

      const doc = editor.document;
      const selection = editor.selection;
      const baseFontSize =
        vscode.workspace
          .getConfiguration("px-to-rem")
          .get<number>("baseFontSize") || 16;

      let textToConvert = "";

      if (!selection.isEmpty) {
        textToConvert = doc.getText(selection);
      } else {
        // No selection = convert whole file
        textToConvert = doc.getText();
      }

      // Regex to match px values: numbers with optional decimals followed by px
      const pxRegex = /(\d+(\.\d+)?)px/g;

      if (!pxRegex.test(textToConvert)) {
        vscode.window.showInformationMessage("No px values found to convert.");
        return;
      }

      const replacedText = textToConvert.replace(pxRegex, (_, pxValue) => {
        const remValue = (parseFloat(pxValue) / baseFontSize).toFixed(4);
        return `${remValue}rem`;
      });

      await editor.edit((editBuilder) => {
        if (!selection.isEmpty) {
          editBuilder.replace(selection, replacedText);
        } else {
          // Replace whole document text
          const firstLine = doc.lineAt(0);
          const lastLine = doc.lineAt(doc.lineCount - 1);
          const textRange = new vscode.Range(
            firstLine.range.start,
            lastLine.range.end
          );
          editBuilder.replace(textRange, replacedText);
        }
      });

      vscode.window.showInformationMessage(
        `Converted px to rem with base font size ${baseFontSize}px`
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
