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
                   ""// buildImg(layer);
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
    for (; layer.parent; ) {
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
    return type
        ? char[folder][type][img].assets[0]
        : char[folder][img].assets[0];
}

function buildImg(layer) {
    var imgElement = document.createElement("img");
    lay = layer;
    imgElement.src = layer.toPng().src;
    imgElement.setAttribute("data-x", layer.left);
    imgElement.setAttribute("data-y", layer.top);
    imgElement.setAttribute("data-hierarchy", getParentHierarchy(layer));
    debug && document.body.appendChild(imgElement);
    var hierarchy = getParentHierarchy(layer);
    assetsByHierarchy.has(hierarchy) || assetsByHierarchy.set(hierarchy, []);
    assetsByHierarchy.get(hierarchy).push(imgElement);
};;;