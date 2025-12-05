

const vscode = require("vscode");

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand("colorPicker.insert", () => {
            openColorPicker();
        })
    );
}

function openColorPicker() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const panel = vscode.window.createWebviewPanel(
        "colorPicker",
        vscode.ViewColumn.Active,
        { enableScripts: true }
    );

    panel.webview.html = getHtml();

    panel.webview.onDidReceiveMessage(msg => {
        if (msg.command === "insert") {
            let color = msg.color;
            let format = msg.format;

            if (format === "RGB") {
                color = hexToRgb(color);
                color = `rgb(${color.r}, ${color.g}, ${color.b})`;
            }

            editor.edit(edit => edit.insert(editor.selection.active, color));
            panel.dispose();
        }
        if (msg.command === "cancel") panel.dispose();
    });
}

function hexToRgb(hex) {
    const m = /^#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(hex);
    return {
        r: parseInt(m[1], 16),
        g: parseInt(m[2], 16),
        b: parseInt(m[3], 16)
    };
}

function getHtml() {
    return `
<!DOCTYPE html>
<html>


<h3>Выберите формат и цвет</h3>

<select id="format">
  <option value="HEX">HEX</option>
  <option value="RGB">RGB</option>
</select>

<input type="color" id="colorPicker" value="#0f0533ff">


<button id="ok">Вставить</button>

<script>
const vscode = acquireVsCodeApi();

document.getElementById("ok").onclick = () => {
    vscode.postMessage({
        command: "insert",
        format: document.getElementById("format").value,
        color: document.getElementById("colorPicker").value
    });
};
</script>

</html>
`;
}

exports.activate = activate;
exports.deactivate = () => {};