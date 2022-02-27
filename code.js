// This file holds the main code for the plugin. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Runs this code if the plugin is run in Figma
if (figma.editorType === "figma") {
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            const icons = yield getIcons();
            figma.showUI(`
    <body>
      <h2>Icons</h2>
      ${Object.keys(icons)
                .map((iconName) => {
                return `
        <h3>${iconName}</h3>
        <ul>
        ${icons[iconName].map((li) => `<li>${li.name}</li>`).join("")}
        </ul>
        `;
            })
                .join("")}
        
    </body>
    <script>
      window.onmessage = async (event) => {
        console.log({event});
        if (event.data.pluginMessage.type === 'networkRequest') {
          var request = new XMLHttpRequest();
          request.open('POST', 'http://localhost:3000/api/gen-icons');
          request.setRequestHeader("Access-Control-Allow-Headers", "*");
          request.setRequestHeader("Access-Control-Allow-Headers", "*");
          const data = event.data.pluginMessage.data;
          console.log({data});
          request.send(JSON.stringify({data}));
        }
      }
    </script>
    `);
            figma.ui.postMessage({
                type: "networkRequest",
                data: icons.basic,
            });
        });
    }
    main();
}
else {
}
function getIcons() {
    return __awaiter(this, void 0, void 0, function* () {
        const Icons = figma.currentPage.children.find((li) => li.name === "ICONS");
        if (!Icons.children)
            return;
        const filtered = Icons.children
            .filter((d) => {
            const [_, flag] = d.name.split(" ");
            return flag === "Icons";
        })
            .find((d) => d.name === "System Icons");
        const basic = filtered.children.find((d) => d.name === "SYSTEM /basic");
        return { basic: yield getSvgFileList(basic.children) };
    });
}
function getIconMap(Nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Nodes.reduce((prevPromise, cur) => __awaiter(this, void 0, void 0, function* () {
            const icons = cur.children;
            if (!icons)
                return;
            const result = yield prevPromise.then();
            const files = yield getSvgFileList(icons);
            result[cur.name] = files;
            return result;
        }), Promise.resolve({}));
    });
}
function getSvgFileList(Nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all(Nodes.map(getSvgFile));
    });
}
function getSvgFile(Node) {
    return __awaiter(this, void 0, void 0, function* () {
        const svg = yield Node.exportAsync({ format: "SVG" }).then((buf) => String.fromCharCode.apply(null, buf));
        return { name: Node.name, file: `${svg}` };
    });
}
