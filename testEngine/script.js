const seed = Math.floor(Math.random() * 1000) + 1;
let PSD = require("psd"),
    psdFile = `https://jetrotal.github.io/EasyChar/spriteData.psd?${seed}`;

let charData = {
    listOfTypes: {},
    foldersLength: {},
    assetsMap: new Map(),
    menuItems: [],
    layers: {},   
    yModifier: 0
},
    char = {};
    
let params = {};
params.default = {
    head: {
        show: true,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    "body-fix": {
        show: true,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    "body-type": {
        show: true,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    "clothes": {
        show: false,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    "clothes-b": {
        show: false,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    "eyes-pupil": {
        show: true,
        ind: "1",
        colorCheck: true,
        color: "#000055"
    },
    "eyes-shape": {
        show: true,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    "hair-back": {
        show: true,
        ind: "1",
        colorCheck: true,
        color: "#888ff8"
    },
    "hair-front": {
        show: true,
        ind: "1",
        colorCheck: true,
        color: "#888ff8"
    },
    "hair-xtra": {
        show: false,
        ind: "1",
        colorCheck: true,
        color: "#888ff8"
    },
    "xtra-body": {
        show: false,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    "xtra-head": {
        show: false,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    "bg-color": {
        show: true,
        ind: "1",
        colorCheck: false,
        color: "#532D2D"
    },
    changeSize: {
        resizer: false
    }
};

const stage = new createjs.Stage("charOutput");

const helperFunctions = (() => {
    Array.prototype.move = function(from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
    };
    Number.prototype.pad = function(n) {
        return (
            Array(n)
                .join("0")
                .slice(-1 * (n || 2)) + this
        );
    };

    window.sleep = function(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    window.getQuery = function(a, b) {
        return document.getElementById(a).querySelector(b);
    };
    
    window.recursiveAssign = function(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            recursiveAssign(target[key], source[key]);
        } else {
            Object.assign(target, { [key]: source[key] });
        }
    }
}
})();

async function preload() {
    let psd = await PSD.fromURL(psdFile);
    psd = psd.tree().children();
    await processLayers(psd);
    Object.assign(char, buildHierarchy(charData.assetsMap));
    recursiveAssign(char, charData.listOfTypes);
    PSD = null;
    charData.assetsMap = null;
    getFoldersLentgh();
    buildStage();
}
preload();

async function processLayers(layers) {
    for (let [index,layer] of layers.entries()) {
        if (layer.name == "@rules") {
            processRules(layer.children());
            continue;
        }

        if (layer.parent.name == null) {
            layer.type = layer.name;
            layer.name = index;
            char[layer.name] = { type: "" };
            charData.listOfTypes[layer.name] = { type: "" };
            charData.listOfTypes[layer.name].type = layer.type;
        }

        try {
            switch (!0) {
                case layer.hasChildren():
                    await processLayers(layer.children());
                    break;
                default:
                    buildImg(layer);
            }
        } catch (e) {

        }
    }
}
function processRules(layers) {
    for (let layer of layers) {
        window.aaa = layer.name;
        window.rules = JSON.parse(layer.name);
    }
}
function buildImg(layer) {
    var imgElement = Object.assign(
        {},
        {
            src: layer.toPng().src,
            data: {
                x: layer.left,
                y: layer.top,
                hierarchy: getParentHierarchy(layer)
            }
        }
    );
    //debug && document.body.appendChild(imgElement);
    var hierarchy = getParentHierarchy(layer);
    charData.assetsMap.has(hierarchy) || charData.assetsMap.set(hierarchy, []);
    charData.assetsMap.get(hierarchy).push(imgElement);
}
function getParentHierarchy(layer) {
    let hierarchy = layer.name;
    for (; layer.parent; ) {
        (layer = layer.parent),
            (hierarchy = `${layer.name ? layer.name + "/" : ""}${hierarchy}`);
    }
    return hierarchy.split("/");
}
function buildHierarchy(assetsByHierarchy) {
    const brokenHierarchy = {};
    for (const [hierarchy, assets] of assetsByHierarchy) {
        assetsByHierarchy = hierarchy; //hierarchy.split("/");
        let currentObject = brokenHierarchy;
        for (let i = 0; i < assetsByHierarchy.length; i++) {
            currentObject[assetsByHierarchy[i]] ||
                (currentObject[assetsByHierarchy[i]] = {}),
                (currentObject = currentObject[assetsByHierarchy[i]]);
        }
        assets[0].src
            ? ((currentObject.src = assets[0].src),
              (currentObject.data = assets[0].data))
            : (currentObject[0] = assets[0]);
    }
    return brokenHierarchy;
}
function getFoldersLentgh() {
    for (var n in char) {
        if (char[n].child) {
            if (!charData.foldersLength[char[n].type]) charData.foldersLength[char[n].type] = {};
            if (!charData.foldersLength[char[n].type].child) charData.foldersLength[char[n].type].child = 0;
            if (!charData.foldersLength[char[n].type].adult) charData.foldersLength[char[n].type].adult = 0;

            if (charData.foldersLength[char[n].type].child < Object.keys(char[n].child).length)
                charData.foldersLength[char[n].type].child = Object.keys(char[n].child).length;

            if (charData.foldersLength[char[n].type].adult < Object.keys(char[n].adult).length)
                charData.foldersLength[char[n].type].adult = Object.keys(char[n].adult).length;
        } else {
            if (!charData.foldersLength[char[n].type]) charData.foldersLength[char[n].type] = 0;
            if (charData.foldersLength[char[n].type] < Object.keys(char[n]).length - 1)
                charData.foldersLength[char[n].type] = Object.keys(char[n]).length - 1;
        }
    }
}

async function buildStage() {
	for (let i = Object.keys(char).length; i >= 1; i--) {
		if (!charData.menuItems.includes(char[i].type)) {
			charData.menuItems.push(char[i].type);
		}
		charData.layers[i] = {};
		const img = new Image();
		img.className = char[i].type;
		const bmp = new createjs.Bitmap(img);
		const bmp2 = new createjs.Bitmap(img);

		const matrix = new createjs.ColorMatrix().adjustSaturation(0);
		bmp.filters = [new createjs.ColorMatrixFilter(matrix)];
		bmp2.filters = [new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 0, 0)];
		bmp2.compositeOperation = "overlay";

		charData.layers[i].bmp = bmp;
		charData.layers[i].bmp2 = bmp2;

		stage.addChild(bmp, bmp2);
	}

	reorderMenuItems();
	buildMenu();
}
function reorderMenuItems(){
    charData.menuItems.sort((a, b) => a.localeCompare(b));
    charData.menuItems.move(charData.menuItems.indexOf("head"), 0);
    charData.menuItems.move(
        charData.menuItems.indexOf("bg-color"),
        charData.menuItems.length
    );
}
function buildMenu() {
    const assetsMenu = document.getElementById("assetsMenu");
    assetsMenu.innerHTML = 'Setup <div class="spacer"></div>';
    const updFunc = "updateSprite(this.id,this.parentNode.id), updateAll()"

    Object.keys(params.default).forEach((id, i) => {
        if (!(Object.keys(params.default).length > i + 1)) return;

        const itemParams = params.default[id];
        const display = id === "body-fix" ? "style='display:none'" : "";
        const checked = itemParams.show ? "checked" : "";
        const colorChecked = itemParams.colorCheck ? "checked" : "";
        const resizerChecked = params.default.changeSize.resizer ? "checked" : "";

        assetsMenu.innerHTML += `
        <div class="spriteSel" id="${id}" ${display}>
          <input type="checkbox" onclick="${updFunc}" id="show" class="title" ${checked}>
          <label class="title"> ${id} </label><div class="spacer"></div>
          <button class="btn" onclick="${updFunc}" id="sub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14,7L9,12L14,17V7Z"/></svg></button> 
          <input class="spriteSel" id="ind" value=${itemParams.ind} type="number" oninput="${updFunc}" onclick="this.select()">
          <button class="btn" id="add" onclick="${updFunc}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,17L15,12L10,7V17Z"/></svg></button>
          <div class="spacer"></div>
          <input id="colorCheck" class="title" onclick="${updFunc}" type="checkbox" ${colorChecked}>
          <input type="color" id='color' value="${itemParams.color}" oninput="this.parentNode.querySelector('#colorCheck').checked=1, ${updFunc}">
        </div>
        ${
            !(Object.keys(params.default).length > i + 2)
                ? `
        <div class="spacer"></div>
        <div class="spriteSel" id="changeSize">
          adult
          <label class="switch" onclick="updateAll();" id="show">
              <input type="checkbox" id="resizer" ${resizerChecked}>
              <span  class="slider round"></span>
            </label> 
            child 
        </div>
        <div class="spacer"></div>`
                : ""
        }
        `;
    });
    updateAll();
}

async function updateAll(mode = "loader", value) {
    for (var i = 0, len = charData.menuItems.length; i < len; ++i) {
        var id = charData.menuItems[i];

        await updateSprite(mode, id, value);
        await sleep(10);
    }
}

async function updateSprite(mode, target, setVal) {
	const visible = getQuery(target, "#show").checked;
	const colorVisible = getQuery(target, "#colorCheck").checked;
	const el = getQuery(target, "#ind");

	const age = document.getElementById("resizer").checked ? "child" : "adult";
	const max = (charData.foldersLength[target][age] || charData.foldersLength[target]) - 1;

	const bodyType = +getQuery("body-type", "#ind").value;
	let val = +el.value

	if (!setVal) setVal = val;


	const valueActions = { set: setVal, add: setVal + 1, sub: setVal - 1 };

    if (mode == "sub") el.value = valueActions[mode]
	else el.value = valueActions[mode] || setVal;

	if (el.value < 1) el.value = max
	if (el.value  > max) el.value = 1;
    
	switch (true) { // Modify Y depending on special cases:
		case age == "adult" && [1, 9].indexOf(bodyType) !== -1 && target == "clothes":
			charData.yModifier = -2;
			break;
		case age == "adult" && [1, 2, 9].indexOf(bodyType) !== -1 && target == "clothes-b":
			charData.yModifier = -2;
			break;
		case age == "adult" && [2].indexOf(bodyType) !== -1 && target == "clothes":
			charData.yModifier = -1;
			break;
		case age == "child" && !target.match(/body|clothes|bg-color/):
			charData.yModifier = 2;
			break;
		case age == "child" && ["xtra-body"].indexOf(target) !== -1:
			charData.yModifier = 1;
			break;
		default:
			charData.yModifier = 0;
	}

	if (!visible) el.parentNode.style.color = "var(--c-gray05)";
	else el.parentNode.style.color = "var(--c-green04)";

	for (const n in charData.layers) {
    const bmpImage = charData.layers[n].bmp.image;
    if (bmpImage.className === "body-fix") {
        const showCheckbox = getQuery("body-fix", "#show");
        const clothesCheckbox = getQuery("clothes", "#show");
        const bodyTypeCheckbox = getQuery("body-type", "#colorCheck");
        const bodyTypeColor = getQuery("body-type", "#color");
        
        showCheckbox.checked = age === "adult" && bodyType === 1 ? clothesCheckbox.checked : false;
        getQuery("body-fix", "#colorCheck").checked = bodyTypeCheckbox.checked;
        getQuery("body-fix", "#color").value = bodyTypeColor.value;

    }  if (bmpImage.className === target) {
        charData.layers[n].bmp.alpha = visible;
        const recolorVisible = getQuery(target, "#colorCheck").checked;
        charData.layers[n].bmp2.alpha = recolorVisible * visible;
        if (visible) displayUpdate(n, target, val, el, age);
    }
}


}

async function displayUpdate(n, target, val, el, age) {
    const defaultVal = char[19][0];
    defaultVal.data.x = 999999;

    val = char[n][val] || char[n][age]?.[val] || defaultVal;

    try {
        charData.layers[n].bmp.image.src = val.src;
    } catch (e) {
        charData.layers[n].bmp.image.src = defaultVal.src;
        val = defaultVal;
    }
    charData.layers[n].bmp.y = charData.layers[n].bmp2.y = val.data.y + charData.yModifier;
    charData.layers[n].bmp.x = charData.layers[n].bmp2.x = val.data.x;
    await recolor(n, document.getElementById(target));
}
async function recolor(id, colorInput) {
	const colorSelector = colorInput.querySelector("#color");
	const colorCheck = colorInput.querySelector("#colorCheck").checked;
	const img = charData.layers[id].bmp.image;
	const imgClass = img.getAttribute("class");
	const bmp = charData.layers[id].bmp;
	const bmp2 = charData.layers[id].bmp2;
	const colors = await printColor(colorSelector);
	const matrix = new createjs.ColorMatrix();

	if (imgClass.includes("hair")) {
		matrix
			.adjustSaturation(-80 * colorCheck)
			.adjustContrast(-25 * colorCheck);
	} else if (imgClass.includes("head") || imgClass.includes("body")) {
		matrix
			.adjustSaturation(-50 * colorCheck)
			.adjustContrast(-50 * colorCheck);
	} else {
		matrix
			.adjustSaturation(-25 * colorCheck)
			.adjustContrast(-10 * colorCheck);
	}
	bmp.filters[0].matrix = matrix;
	bmp2.filters[0].redOffset = colors[0];
	bmp2.filters[0].greenOffset = colors[1];
	bmp2.filters[0].blueOffset = colors[2];
	await sleep(20);
	bmp.cache(0, 0, img.width, img.height);
	bmp2.cache(0, 0, img.width, img.height);
	await stage.update();

}
async function printColor(ev) {
    const color = ev.value;
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    return [r, g, b];
}

function downloadChar() {
    const ctx = stage.canvas.getContext("2d");
    const dta = ctx.getImageData(0, 0, 72, 128).data;
    const bb = UPNG.encode([dta], 72, 128);
    const url = URL.createObjectURL(
        new Blob([bb], {
            type: "image/png"
        })
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = `EasyChar_${new Date().toISOString()}.png`;
    link.click();
}

function getParams(id) {
    const element = document.getElementById(id);

    if (id === "changeSize") {
        const checkbox = element.querySelector("input[type='checkbox']");
        return { resizer: checkbox.checked };
    } else {
        const inputs = element.querySelectorAll("input");
        return {
            show: inputs[0].checked,
            ind: inputs[1].value,
            colorCheck: inputs[2].checked,
            color: inputs[3].value
        };
    }
}

function setParams(id, params) {
    const element = document.getElementById(id);

    if (id === "changeSize") {
        const checkbox = element.querySelector("input[type='checkbox']");
        checkbox.checked = params.resizer;
    } else {
        const inputs = element.querySelectorAll("input");
        inputs[0].checked = params.show;
        inputs[1].value = params.ind;
        inputs[2].checked = params.colorCheck;
        inputs[3].value = params.color;
    }
}

//--------- Dynamic Load Files

function obj2arr(obj, name) {
    let arr = [name];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            var temp = +obj[key];
            if (isNaN(temp)) temp = obj[key];
            arr.push(temp);
        }
    }
    return arr;
}

function arr2obj(arr) {
    let obj = {};
    let currentIndex = 0;
    obj[arr[0]] = {
        show: arr[currentIndex + 1],
        ind: arr[currentIndex + 2],
        colorCheck: arr[currentIndex + 3],
        color: arr[currentIndex + 4]
    };

    return obj;
}

//obj2arr(params.default.head, "head");
//arr2obj(obj2arr(params.default.head,"head"))

//params.url = [];

async function buildUrl() {
    charData.length = Object.keys(charData.json.folders).length;
    for (let i = charData.length; 1 <= i; i--) {
        const id = i.toString().padStart(2, "0");
        const type = charData.json.folders[id].type;
        params.url.push(obj2arr(params.default[type], type));
    }
}

//buildUrl();  
//params.url;
