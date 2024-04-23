import "./index.css";
import kitaampel from "/kitaampelv3.svg";
import { Canvg, presets } from "canvg";

type Stufe = "rot" | "orange" | "gelb" | "dgruen" | "gruen";

type Tag = {
  count: number;
  stufe: Stufe;
};

const preset = presets.offscreen();

let svgDoc: Document | undefined = undefined;

document
  .querySelector<HTMLButtonElement>("#erstellenButton")
  ?.addEventListener("click", genGraphik);
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#version")!.innerHTML = `v${__APP_VERSION__}`;

  let svgAnchor = document.querySelector("#svganchor");
  svgAnchor!.innerHTML = `
    <iframe
      id="svgObject"
      src="${kitaampel}"
      style="display: none"
    >
      SVG-Grafik konnte nicht geladen werden!
    </iframe>
  `;

  let svgObject = document.querySelector<HTMLIFrameElement>("#svgObject");
  console.log(svgObject);

  if (svgObject == null) {
    throw new Error("Not acceptable");
  }
  svgObject?.addEventListener("load", () => {
    svgDoc = svgObject!.contentDocument!;

    console.log(svgDoc);

    document
      .querySelector<HTMLButtonElement>("#erstellenButton")
      ?.removeAttribute("disabled");
  });
});

async function genGraphik() {
  const tage = readTage();
  modifySvg(tage);
  if (svgDoc == undefined) {
    throw new Error("Illegal state");
  }
  const url = await toPng(svgDoc as Document, 1708, 903);

  const current = new Date();
  const datestring =
    current.getFullYear().toString() +
    (current.getMonth() + 1).toString().padStart(2, "0") +
    current.getDate().toString().padStart(2, "0");
  download(`ampel_${datestring}.png`, url);
}

function readTage(): Tag[] {
  const tage: Tag[] = [];
  for (let i = 1; i < 6; i++) {
    const countId = `#mangel_${i}`;
    const stufeId = `#stufe_${i}`;

    const count =
      document.querySelector<HTMLInputElement>(countId)!.valueAsNumber;
    const stufe = document.querySelector<HTMLSelectElement>(stufeId)!.value;

    tage.push({ count: count, stufe: stufe as Stufe });
  }
  return tage;
}

function modifySvg(tage: Tag[]) {
  for (let i = 0; i < tage.length; i++) {
    const { stufe, count } = tage[i];
    const id = `#m_${i + 1}_${stufe}`;
    console.log(id);

    const textE = svgDoc?.querySelector(id);
    textE?.classList.remove("hidden");
    textE!.children.item(0)!.innerHTML = count.toString();
  }
}

async function toPng(
  svg: Document,
  width: number,
  height: number
): Promise<string> {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const v = new Canvg(ctx!, svg, preset);

  await v.render();

  const blob = await canvas.convertToBlob();
  const pngUrl = URL.createObjectURL(blob);

  return pngUrl;
}

function download(filename: string, url: string) {
  let element = document.createElement("a");
  element.setAttribute("href", url);
  element.setAttribute("download", filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
