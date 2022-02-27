// This file holds the main code for the plugin. It has access to the *document*.
// You can access browser APIs such as the network by creating a UI which contains
// a full browser environment (see documentation).

// Runs this code if the plugin is run in Figma
if (figma.editorType === "figma") {
  async function main() {
    const icons = await getIcons();
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
  }

  main();
} else {
}

async function getIcons() {
  const Icons = figma.currentPage.children.find(
    (li) => li.name === "ICONS"
  ) as FrameNode;
  if (!Icons.children) return;

  const filtered = Icons.children
    .filter((d) => {
      const [_, flag] = d.name.split(" ");
      return flag === "Icons";
    })
    .find((d) => d.name === "System Icons") as FrameNode;

  const basic = filtered.children.find(
    (d) => d.name === "SYSTEM /basic"
  ) as FrameNode;

  return { basic: await getSvgFileList(basic.children) };
}

async function getIconMap(Nodes: readonly SceneNode[]) {
  return await Nodes.reduce(async (prevPromise, cur) => {
    const icons = (cur as ComponentNode).children;
    if (!icons) return;
    const result = await prevPromise.then();
    const files = await getSvgFileList(icons);
    result[cur.name] = files;
    return result;
  }, Promise.resolve({} as { [x: string]: { name: string; file: string }[] }));
}

async function getSvgFileList(Nodes: readonly SceneNode[]) {
  return Promise.all(Nodes.map(getSvgFile));
}

async function getSvgFile(Node: SceneNode) {
  const svg = await Node.exportAsync({ format: "SVG" }).then((buf) =>
    String.fromCharCode.apply(null, buf)
  );
  return { name: Node.name, file: `${svg}` };
}
