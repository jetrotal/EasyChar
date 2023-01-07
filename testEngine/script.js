let dummi = `data:image/png;base64,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`

let PSD = require("psd");
let assetsByHierarchy = new Map(),
    char = {},
    debug = 1,
    psdFile = "https://jetrotal.github.io/EasyChar/spriteData.psd?8273";
//lay;
async function processLayers(layers) {
    for (let layer of layers) {
        try {
            switch (!0) {
                case layer.hasChildren():
                    await processLayers(layer.children());
                    break;
                default:
                    buildImg(layer);
            }
        } catch (e) {
            console.log(layer.name);
        }
    }
}
async function main() {
    var psd = await PSD.fromURL(psdFile);
    //lay = psd;
    psd = psd.tree().children();
    await processLayers(psd);
    char = breakHierarchy(assetsByHierarchy);
    PSD = null;
}
main();

function getParentHierarchy(layer) {
    let hierarchy = layer.name;
    for (; layer.parent;) {
        (layer = layer.parent),
        (hierarchy = `${layer.name ? layer.name + "/" : ""}${hierarchy}`);
    }
    return hierarchy;
}

function breakHierarchy(assetsByHierarchy) {
    const brokenHierarchy = {};
    for (const [hierarchy, assets] of assetsByHierarchy) {
        assetsByHierarchy = hierarchy.split("/");
        let currentObject = brokenHierarchy;
        for (let i = 0; i < assetsByHierarchy.length; i++) {
            currentObject[assetsByHierarchy[i]] ||
                (currentObject[assetsByHierarchy[i]] = {}),
                (currentObject = currentObject[assetsByHierarchy[i]]);
        }
        currentObject.assets = assets;
    }
    return brokenHierarchy;
}

function charImg(folder, img, type) {
    return type ?
        char[folder][type][img].assets[0] :
        char[folder][img].assets[0];
}

function buildImg(layer) {
    var imgElement = document.createElement("img");
    lay = layer;
    imgElement.src = dummi; //layer.toPng().src;
    imgElement.setAttribute("data-x", layer.left);
    imgElement.setAttribute("data-y", layer.top);
    imgElement.setAttribute("data-hierarchy", getParentHierarchy(layer));
    debug && document.body.appendChild(imgElement);
    var hierarchy = getParentHierarchy(layer);
    assetsByHierarchy.has(hierarchy) || assetsByHierarchy.set(hierarchy, []);
    assetsByHierarchy.get(hierarchy).push(imgElement);
};;;