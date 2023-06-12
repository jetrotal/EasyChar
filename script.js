size = {"w": 72, "h":128}
const stage = new createjs.Stage("charOutput");
const mainArea = document.getElementById('mainArea');

const tempEl = document.createElement('canvas');
tempEl.width = size.w;
tempEl.height = size.h;

const tempCtx = tempEl.getContext("2d");
const tempImg = new Image();

window.functions = {};

window.getFileValueFromURL = function(url) {
  const urlParams = new URLSearchParams(url.search);
  let fileValue = urlParams.get('file');
  if (!fileValue) fileValue = "spriteData";
  return fileValue;
}

const seed = Math.floor(Math.random() * 1000) + 1;
let colorObjs = [{r: 0.1, g: 0.1, b: 0.1},
                 {r: 0.8, g: 0, b: 0},
                 {r: 1, g: 1, b: 1}];

const url = new URL(window.location.href);

// Extract the file value from the URL
const psdURL = getFileValueFromURL(url);

let PSD = require("psd"),
    psdFile = `https://jetrotal.github.io/EasyChar/${psdURL}.psd?${seed}`;

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
    0:{
        show: true,
        ind: "1",
        colorCheck: false
    },
    "head": {
        show: true,
        ind: "1",
        colorCheck: false
    },
    "body-fix": {
        show: true,
        ind: "1",
        colorCheck: false
    },
    "body-type": {
        show: true,
        ind: "1",
        colorCheck: false
    },
    "clothes": {
        show: false,
        ind: "1",
        colorCheck: false
    },
    "clothes-b": {
        show: false,
        ind: "1",
        colorCheck: false
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
        colorCheck: false
    },
    "hair-back": {
        show: true,
        ind: "1",
        colorCheck: true
    },
    "hair-front": {
        show: true,
        ind: "1",
        colorCheck: true
    },
    "hair-xtra": {
        show: false,
        ind: "1",
        colorCheck: true
    },
    "xtra-body": {
        show: false,
        ind: "1",
        colorCheck: false
    },
    "xtra-head": {
        show: false,
        ind: "1",
        colorCheck: false
    },
    "bg-color": {
        show: true,
        ind: "1",
        colorCheck: false
    },
    "changeSize": {
        variantsMenu: false
    }
};

const helperFunctions = (() => {
    Array.prototype.move = function(from, to) {
try{
        this.splice(to, 0, this.splice(from, 1)[0]);
}catch(e){}
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
try{
        return document.getElementById(a).querySelector(b);
}catch(e){return 0;}
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

//----------------- Pencil/Eraser vars
canvas = stage.canvas;

let pixelsContainer = new createjs.Container();
stage.addChild(pixelsContainer);

let pixel = new createjs.Shape();
let outline = new createjs.Shape();
const gridSize = 1;

let currZoom = 5;
let currTrans = 50;

let currentTool = "pencil";
let brushColor = "#000000";
let outlineColor = "#000000";

let pickerStatus =  0;

let canvasProps = canvas.getBoundingClientRect();


async function preload() {
    let psd = await PSD.fromURL(psdFile);
window.psdx = psd
    
    size.w = psd.header.width; 
    size.h = psd.header.height;
    
    tempEl.width = size.w;
    tempEl.height = size.h;
    
    stage.canvas.width = size.w;
    stage.canvas.height = size.h;
    
    document.getElementById('charContainer').style.margin= `0 ${size.w - 12}px ${size.h + 12}px `;

    psd = psd.tree().children();
    await processLayers(psd);
    Object.assign(char, buildHierarchy(charData.assetsMap));
    recursiveAssign(char, charData.listOfTypes);
    PSD = null;
    charData.assetsMap = null;
    getFoldersLentgh();
    buildStage();
    buildDrawingLayer();
    
}
preload();

async function processLayers(layers) {
    let sub = 0
    for (let [index,layer] of layers.entries()) {
        if (layer.name == "@rules") {
            processRules(layer.children());
           //sub--;
            continue;
        }
        if (layer.name == "@functions") {
            processFunctions(layer.children());
            sub--;
            continue;
        }
        
        if (layer.parent.name == null) {
            layer.type = layer.name;
            layer.name = index +sub;
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
    window.rules = {};
    for (let layer of layers)
	if (layer.name == "credits") alert('achei'), document.getElementById('licenseText').value = layer.get('typeTool').export().value
        else Object.assign(window.rules, JSON.parse(layer.name));
    
}

function processFunctions(layers) {
    //window.functions = {};
    for (let layer of layers) 
        args = layer.name.split(')').join('').split(' ').join('').split('('),
            window.functions[args[0]] = new Function(args[1].split(','), layer.get('typeTool').export().value);
    
};

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
        
         if (!char[n][rules.variants[0]])  {
             if (!charData.foldersLength[char[n].type]) charData.foldersLength[char[n].type]= 0;
                if (charData.foldersLength[char[n].type] < Object.keys(char[n]).length - 1)
                    charData.foldersLength[char[n].type] = Object.keys(char[n]).length - 1;
            }
        
        
        if (!charData.foldersLength[char[n].type]) charData.foldersLength[char[n].type] = {};
       
        for (var i = 0; i < rules.variants.length; i++) {
            var variant = rules.variants[i];
            if (char[n][variant]) {
                if (!charData.foldersLength[char[n].type][variant]) charData.foldersLength[char[n].type][variant] = 0;
                if (charData.foldersLength[char[n].type][variant] < Object.keys(char[n][variant]).length)
                    charData.foldersLength[char[n].type][variant] = Object.keys(char[n][variant]).length;
            } 
        }
      
    }
}

async function buildStage() {
	for (let i = Object.keys(char).length; i >= 1; i--) {
        if (char[i] == undefined ) continue;
		if (!charData.menuItems.includes(char[i].type)) {
			charData.menuItems.push(char[i].type);
		}
		charData.layers[i] = {};
		const img = new Image();
		img.className = char[i].type;
		const bmp = new createjs.Bitmap(img);

		charData.layers[i].bmp = bmp;

		stage.addChild(bmp);;
	}

	reorderMenuItems();
	buildMenu();
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
    mainArea.style.display = 'none'
    clearCanvas();
    const assetsMenu = document.getElementById("assetsMenu");
    assetsMenu.innerHTML = 'Setup <div class="spacer"></div>';
    const updFunc = "updateSprite(this.id,this.parentNode.id), updateAll()"

    Object.values(charData.menuItems).forEach((id, i) => {
        if (!(Object.values(charData.menuItems).length > i)) return;

        const itemParams = params.default[id] 
        ? params.default[id] 
        : params.default[0];
        const display = rules.noMenu.indexOf(id) >-1 ? "style='display:none'" : "";
        const variantsMenuDisplay = rules.noMenu.indexOf('variantsMenu') >-1 ? "style='display:none'" : "";

        const checked = itemParams.show ? "checked" : "";
        const colorChecked = itemParams.colorCheck ? "checked" : "";
        const variantsMenuChecked = params.default.changeSize.variantsMenu ? "checked" : "";

        assetsMenu.innerHTML += `
        <div class="spriteSel" id="${id}" ${display}>
          <input type="checkbox" onclick="${updFunc}" id="show" class="title" ${checked}>
          <label class="title"> ${id} </label><div class="spacer"></div>
          <button class="btn" onclick="${updFunc}" id="sub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14,7L9,12L14,17V7Z"/></svg></button> 
          <input class="spriteSel" id="ind" value=${itemParams.ind} type="number" oninput="${updFunc}" onclick="this.select()">
          <button class="btn" id="add" onclick="${updFunc}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,17L15,12L10,7V17Z"/></svg></button>
          <div class="spacer"></div>
          <input id="colorCheck" class="title" onclick="${updFunc}" type="checkbox" ${colorChecked}>
          <div id="picker" class="colorSlider"><img src="" onerror="buildPickerMenu(colorObjs,this.parentNode,'${id}')"></img></div> 
        </div>
        ${
            !(Object.values(charData.menuItems).length > i + 1)
                ? `
        <div class="spacer"></div>
        <div class="spriteSel" id="changeSize" ${variantsMenuDisplay}>
          ${rules.variants[1]}
          <label class="switch" onclick="updateAll();" id="show">
              <input type="checkbox" id="variantsMenu" ${variantsMenuChecked}>
              <span  class="slider round"></span>
            </label> 
            ${rules.variants[0]} 
        </div>
        <div class="spacer"></div>`
                : ""
        }
        `;
    });
    updateAll();
}

async function updateAll(mode = "set", value) {
    for (var i = 0, len = charData.menuItems.length; i < len; ++i) {
        var id = charData.menuItems[i];

        await updateSprite(mode, id, value);
        //await sleep(10);
    }

await stage.update();
    mainArea.style.display = ''
        document.getElementsByClassName('floaty')[0].style.height = document.getElementById('assetsMenu').clientHeight +'px';
}

async function updateSprite(mode, target, setVal) {
	const visible = getQuery(target, "#show").checked;
	const colorVisible = getQuery(target, "#colorCheck").checked;
	const el = getQuery(target, "#ind");

	const age = document.getElementById("variantsMenu").checked ? rules.variants[0] : rules.variants[1];
	const maxInput = (charData.foldersLength[target][age] || charData.foldersLength[target]) - 1;


	const bodyType = +getQuery("body-type", "#ind").value;
	let val = +el.value

	if (!setVal) setVal = val;

	const valueActions = { set: setVal, add: setVal + 1, sub: setVal - 1 };

    if (mode == "sub") el.value = valueActions[mode]
	else el.value = valueActions[mode] || setVal;

	if (el.value < 1) el.value = maxInput
	if (el.value  > maxInput) el.value = 1;

    if(functions && functions.changeYposition)
    functions.changeYposition(age,bodyType,target)
//	changeYposition(age,bodyType,target)

	if (!visible) el.parentNode.style.color = "var(--c-gray05)";
	else el.parentNode.style.color = "";

	for (const n in charData.layers) {
        
        const bmpImage = charData.layers[n].bmp.image;
        if (bmpImage.className === "body-fix") {
        const showCheckbox = getQuery("body-fix", "#show");
        const clothesCheckbox = getQuery("clothes", "#show");
        const bodyTypeCheckbox = getQuery("body-type", "#colorCheck");
        
        showCheckbox.checked = age === rules.variants[1] && bodyType === 1 ? clothesCheckbox.checked : false;
        getQuery("body-fix", "#colorCheck").checked = bodyTypeCheckbox.checked;

    }  
        if (bmpImage.className === target) {
        charData.layers[n].bmp.alpha = visible;
        if (visible) 
            await displayUpdate(n, target, val, el, age, colorVisible);
    }
}

}

async function displayUpdate(n, target, val, el, age, recolorVisible) {
    
    const defaultVal = char[1][0];
    let imgSrc;
    defaultVal.data.x = 500;

    val = char[n][val] || char[n][age]?.[val] || defaultVal;
    
    

        if(recolorVisible && val != defaultVal) {
            await applyFilter(val.src, target)
            imgSrc = await applyFilter(val.src, target)
                           }
        else imgSrc = val.src;

charData.layers[n].bmp.image.src = imgSrc;

    charData.layers[n].bmp.y = val.data.y + charData.yModifier;
    charData.layers[n].bmp.x = val.data.x;

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
    const dta = ctx.getImageData(0, 0, size.w, size.h).data;
    const bb = UPNG.encode([dta], size.w, size.h);
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


//------ new color engine

function buildPickerMenu(colors, target,id) {
    const hexColors = colors.map(color => `#${Math.round(color.r * 255).toString(16).padStart(2, '0')}${Math.round(color.g * 255).toString(16).padStart(2, '0')}${Math.round(color.b * 255).toString(16).padStart(2, '0')}`);

    const gp = new Grapick({ el: target });
    target.querySelector('.grp-wrapper').style.height = '10px';
    hexColors.forEach((color, index) => gp.addHandler((index / (hexColors.length - 1)) * 100, color));

    
    target.insertAdjacentHTML('beforeend', `<svg id="recolor">${document.getElementById("newColor").outerHTML.replace("newColor","c-"+id)}</svg>`);

    gp.on('change', complete => updateColors(gp.getColorValue(), target));

    updateColors(gp.getColorValue(), target);

}


function updateColors(input, target) {
    
    const colors = input.match(/(#[a-f0-9]{6}|rgba\(\d{1,3}, \d{1,3}, \d{1,3}, (\d{1,3})?\))/gi);

    colorObj = colors.map(color => {
        if (color.startsWith('#')) {
            color = color.slice(1);
            const r = parseInt(color.slice(0, 2), 16) / 255;
            const g = parseInt(color.slice(2, 4), 16) / 255;
            const b = parseInt(color.slice(4), 16) / 255;
            return {r, g, b};
        } else {
            const values = color.match(/\d+/g);
            return {r: parseInt(values[0]) / 255, g: parseInt(values[1]) / 255, b: parseInt(values[2]) / 255};
        }
    });

    updateSVGfilter(colorObj,target);
}

async function updateSVGfilter(colorsObj, target) { 
  const channels = ['r', 'g', 'b'];
  
  channels.forEach(channel => {
    const values = colorObj.map(color => color[channel]).join(" ");
    target.querySelector(`#re${channel.toUpperCase()}`).setAttribute("tableValues", values);
  });
  
  updateAll();
}

async function applyFilter(imgSrc, target) {
        tempCtx.filter = ``;
        await tempCtx.clearRect(0, 0, tempEl.width, tempEl.height);

    let filterType = "c-"+target;
    await new Promise(r => tempImg.onload=r, tempImg.src=imgSrc);

    if(Object.keys(rules.remap).indexOf(target) >-1)
      filterType ="c-"+ rules.remap[target];
   
    tempCtx.drawImage(tempImg, 0, 0);
    tempCtx.filter = `url(#${filterType})`;
    let URI = await tempEl.toDataURL();
    return URI
}


//----------------- Pencil/Eraser Engine
canvas = stage.canvas;

function buildDrawingLayer() {
    window.isOver = 0;
    const obj = document.querySelector("#charOutput");
    const container = document.querySelector("#charContainer");
const paintMenu = document.querySelector("#paintButtons");
    obj.oncontextmenu= function() {return false};
    
    const r = document.querySelector(':root');

     obj.onmouseover =  function() {
         
         if(document.getElementById('charOutput').clientHeight * currZoom > document.getElementById('appContainer').clientHeight){
             currZoom = 2;
             currTrans = 0;
         }
         
         r.style.setProperty('--drawMenuSize', `calc(${document.getElementById('charOutput').clientHeight}px / 4)`);

document.getElementById('paintButtons').style.height =  document.getElementById('charOutput').clientHeight+"px";
    document.getElementById('paintButtons').style.marginLeft = document.getElementById('charOutput').clientWidth+"px"
         
        paintMenu.style.display ="flex"
        container.style.zIndex = '200'
        container.style.transform = `translateY(-${currTrans}px)  scale(${currZoom})`;
        container.style.transformOrigin = 'top center';
        container.style.boxShadow = "0 0 0 200vw rgb(0 0 0 / 0.7)";
        isOver = 1
        
    };

       paintMenu.onmouseover = function() { 
           paintMenu.style.display ="flex"
           container.style.zIndex = '200'
           container.style.transform = `translateY(-${currTrans}px) scale(${currZoom})`;
           container.style.transformOrigin = 'top center';
           container.style.boxShadow = "0 0 0 200vw rgb(0 0 0 / 0.7)";
            return isOver = 0
        }


    paintMenu.onmouseout = obj.onmouseout =  function() { 
        paintMenu.style.display ="none"
        container.style.transform = '';
        container.style.transformOrigin = '';
        container.style.boxShadow = '';
        return isOver = 0
    };

    obj.addEventListener("contextmenu", async function(e){
    updateDrawPicker()
});
    
    createjs.Ticker.addEventListener("tick", update);
   // createjs.Ticker.setFPS(90);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;
    stage.on("stagemousedown", drawPixel);

stage.canvas.addEventListener("mousemove", function(event) {
    if (shiftDown) if (event.buttons === 1) { // check if shift key is down
        if (!logged) { // check if log message has not been outputted
            var currentMousePos = {x: event.clientX, y: event.clientY}; // get current mouse position
            var deltaX = currentMousePos.x - lastMousePos.x; // calculate difference in x position
            var deltaY = currentMousePos.y - lastMousePos.y; // calculate difference in y position
            if (Math.abs(deltaX) > Math.abs(deltaY)) { // check if movement is more horizontal than vertical
                lockedAxis = 'x';
            } else {
                lockedAxis = 'y';
            }
            logged = true; // update logged to indicate log message has been outputted
        }
    }
    lastMousePos = {x: event.clientX, y: event.clientY}; // update lastMousePos for next event
});
    
    
    stage.on("stagemousemove", drawPixel);
}



document.getElementById('pickerRect').style.fill = document.getElementById('colorPickerBtn').value;

async function updateDrawPicker(){
    
    
    if (pickerStatus == 0){
        return document.getElementById('colorPickerBtn').click();
        pickerStatus = 1;

 
        
    } if (pickerStatus == 1){ 
        document.getElementById('colorPickerBtn').outerHTML = document.getElementById('colorPickerBtn').outerHTML;

        pickerStatus  = 0;
    }

}

function setTool(tool,item) {
    currentTool = tool;
    document.getElementById('pencil').classList.remove("btActive");
    document.getElementById('eraser').classList.remove("btActive");
 
    item.classList.add("btActive");
}

function clearCanvas() {
    pixelsContainer.removeAllChildren();
    pixel = new createjs.Shape();
}

function update() {
    stage.update();
}

let lastDrawnX, lastDrawnY;

document.addEventListener("keydown", function(event) {
    if (event.keyCode === 16) { // check if shift key is pressed
        shiftDown = true; // update shiftDown to indicate shift key is down
    }
});

document.addEventListener("keyup", function(event) {
    if (event.keyCode === 16) { // check if shift key is released
        shiftDown = false; // update shiftDown to indicate shift key is not down
        logged = false; // reset logged to false when shift key is released
        lockedAxis = undefined
    }
});

let currX;
let currY;
var lastMousePos = {x: 0, y: 0}; // variable to store previous mouse position

var shiftDown = false; // variable to track if shift key is down
var logged = false; // variable to track if log message has been outputted
let lockedAxis;

function drawPixel(evt) {
    if (!isMouseWithinCanvas()) return removeOutline();
    drawOutline(evt);

  let firstMove = true;


    if (evt.nativeEvent.buttons === 1) { // left mouse button is down
        if(currX === undefined)
        currX = evt.stageX;
        if(currY === undefined)
        currY = evt.stageY;

        if (lockedAxis == undefined)


console.log(lockedAxis)

if(lockedAxis === "x") {
    currX = evt.stageX;
} else if(lockedAxis === "y") {
    currY = evt.stageY;
} else {
    currX = evt.stageX;
    currY = evt.stageY;
}
        
        const x = Math.floor(currX / gridSize) * gridSize;
        const y = Math.floor(currY / gridSize) * gridSize;
        
                smoothPixels(x, y);
               
            
        pixelsContainer.addChild(pixel);
    }
}

function smoothPixels(currentX, currentY) {
    if (lastDrawnX === undefined && lastDrawnY === undefined) {
        lastDrawnX = currentX;
        lastDrawnY = currentY;
    }
    const pixels = getPixelsOnLine(lastDrawnX, lastDrawnY, currentX, currentY);
    for (let i = 0; i < pixels.length; i++) {
        switch (currentTool) {
            case "pencil":
                pixel.graphics.beginFill(brushColor).drawRect(pixels[i].x, pixels[i].y, gridSize, gridSize);
                break;
            case "eraser":
                removePixel(pixels[i].x, pixels[i].y);
                break;
        }
        
    }
    lastDrawnX = currentX;
    lastDrawnY = currentY;
}

function getPixelsOnLine(x0, y0, x1, y1) {
    const pixels = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let e2;
    while (true) {
        pixels.push({x: x0, y: y0});
        if (x0 === x1 && y0 === y1) {
            break;
        }
        e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;;;;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    return pixels;
}



function drawOutline(evt) {
    
    if (!isMouseWithinCanvas()) return;

    canvasProps = canvas.getBoundingClientRect();


    outlineColor = brushColor;
    const x = Math.floor(evt.stageX / gridSize) * gridSize;
    const y = Math.floor(evt.stageY / gridSize) * gridSize;



    switch (currentTool) {
        case "eraser":
            outline.graphics.clear().beginFill("#ffffff").drawRect(x, y, 1, 1);
            document.getElementById("eraserCursor").style.display='block'
    document.getElementById("pencilCursor").style.display='none'
            break;
        case "pencil":
            outline.graphics.clear().beginFill(brushColor).drawRect(x, y, 1, 1);
            document.getElementById("eraserCursor").style.display='none'
            document.getElementById("pencilCursor").style.display='block'
 
    }
    stage.addChild(outline);
    document.getElementById('cursors').style.left =((canvasProps.left/currZoom+x)*currZoom)+"px"
    document.getElementById('cursors').style.top=((canvasProps.top/currZoom+y)*currZoom)+"px"
  //  document.getElementById('cursors').style.transform = `scale(${currZoom /1.5})`
    
    if (pixelsContainer !== stage.children[stage.children.length ])
        stage.addChildAt(pixelsContainer,stage.children.length);

  
}

function isMouseWithinCanvas() {
    return isOver; 
}

function removeOutline() {
     document.getElementById("eraserCursor").style.display='none'
    document.getElementById("pencilCursor").style.display='none'
    stage.removeChild(outline);
}

stage.on("stagemousedown", function() {
    removeOutline();
    lockedAxis = undefined;
    
  
});

stage.on("stagemouseup", function() {
    lastDrawnX = undefined;
    lastDrawnY = undefined;
    currX = undefined;
    currY = undefined;
    lockedAxis = undefined;
    logged = false;
});

function removePixel(x, y) {
    let instructions = pixel.graphics._instructions;
    for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].x === x && instructions[i].y === y) {
            instructions.splice(i, 4); // remove the instruction and its corresponding fill and stroke styles
            //break;
        }
    }
    //pixelsContainer.children[0].graphics.clear().command = instructions; //update the graphics instructions
    stage.update();
}





//----------functions that I may or may not use for loading from url
function wip(){

//--------- Dynamic Load Files

function getParams(id) {
    const element = document.getElementById(id);

    if (id === "changeSize") {
        const checkbox = element.querySelector("input[type='checkbox']");
        return { variantsMenu: checkbox.checked };
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
        checkbox.checked = params.variantsMenu;
    } else {
        const inputs = element.querySelectorAll("input");
        inputs[0].checked = params.show;
        inputs[1].value = params.ind;
        inputs[2].checked = params.colorCheck;
        inputs[3].value = params.color;
    }
}

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
}

