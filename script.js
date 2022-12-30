const helperFunctions = (() => {
  Array.prototype.move = function move(from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
  };
  Number.prototype.pad = function pad(n) {
  return Array(n).join("0").slice(-1 * (n || 2)) + this;
  };
  
  window.sleep = function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
  };
  
  window.getQuery = function getQuery(a, b) {
  return document.getElementById(a).querySelector(b);
  };
  })();
  
const seed = Math.floor(Math.random() * 1000) + 1;
let successCounter = {};
let lastSprite = {};
let forceUpdate = 0;

let params = {};
params.default = {
  "head": {
      "show": true,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "body-fix": {
      "show": true,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "body-type": {
      "show": true,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "clothes": {
      "show": false,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "clothes-b": {
      "show": false,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "eyes-pupil": {
      "show": true,
      "qtd": "1",
      "colorCheck": true,
      "color": "#000055"
  },
  "eyes-shape": {
      "show": true,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "hair-back": {
      "show": true,
      "qtd": "1",
      "colorCheck": true,
      "color": "#888ff8"
  },
  "hair-front": {
      "show": true,
      "qtd": "1",
      "colorCheck": true,
      "color": "#888ff8"
  },
  "hair-xtra": {
      "show": false,
      "qtd": "1",
      "colorCheck": true,
      "color": "#888ff8"
  },
  "xtra-body": {
      "show": false,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "xtra-head": {
      "show": false,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "bg-color": {
      "show": true,
      "qtd": "1",
      "colorCheck": false,
      "color": "#553737"
  },
  "changeSize":{
    resizer: false
  }
};


let charData = {
  url: "https://jetrotal.github.io/EasyChar/",
  assetsFolder: "spriteData/",
  jsonFile: "details.json",
  ext: ".gif",
  size: {
    types: ["adult", "child"],
    current: "adult",
    old: "child",
    changesFolder: ["body-type", "body-fix", "clothes", "clothes-b", "bg-color"],
  },
  yOffset: {
    adult: 0,
    child: 2,
    adultNew: -2,
  },
  menuItems: [],
  layers: {},
};

if (document.location.href === charData.url) {
  charData.jsonFile = `${charData.jsonFile}?${seed}`;
  // charData.ext = `${charData.ext}?${seed}`;
}

const stage = new createjs.Stage("charOutput");

init();

async function init() {
  try {
    const res = await fetch(`${charData.url}${charData.assetsFolder}${charData.jsonFile}`);
    charData.json = await res.json();
    buildStage();
  } catch (err) {
    console.error(err);
  }
}
async function buildStage() {
  charData.length = Object.keys(charData.json.folders).length;
  for (let i = charData.length; 1 <= i; i--) {
    const id = i.toString().padStart(2, '0');
    const type = charData.json.folders[id].type;

    if (!charData.menuItems.includes(type)) {
      charData.menuItems.push(type);
    }

    const sizeFolder = charData.size.changesFolder.includes(type) && type !== "bg-color" ? `${charData.size.current}/` : "";

    charData.layers[id] = {};
    charData.layers[id].img = document.createElement("img");
    charData.layers[id].img.crossOrigin = "Anonymous";
    charData.layers[id].img.className = type;

    if (charData.layers[id].img.className === "bg-color") {
      charData.layers[id].childOffset = 0;
    } else {
      charData.layers[id].childOffset = charData.size.changesFolder.includes(type) ? 0 : charData.yOffset.child;
    }

    charData.layers[id].bmp = new createjs.Bitmap(charData.layers[id].img);
    charData.layers[id].bmp2 = new createjs.Bitmap(charData.layers[id].img);

    charData.layers[id].bmp.y = charData.layers[id].bmp2.y = 0;

    const matrix = new createjs.ColorMatrix().adjustSaturation(0);
    charData.layers[id].bmp.filters = [new createjs.ColorMatrixFilter(matrix)];
    charData.layers[id].bmp2.filters = [new createjs.ColorFilter(0, 0, 0, 1, 0, 0, 0, 0)];
    charData.layers[id].bmp2.compositeOperation = "overlay";

    stage.addChild(charData.layers[id].bmp, charData.layers[id].bmp2);

    charData.layers[id].img.src = `${charData.url}${charData.assetsFolder}${id}/${sizeFolder}1${charData.ext}`;
  }

  charData.menuItems.sort((a, b) => a.localeCompare(b));
  charData.menuItems.move(charData.menuItems.indexOf('head'), 0);
  charData.menuItems.move(charData.menuItems.indexOf('bg-color'), charData.menuItems.length);

  buildMenu();
}

function buildMenu() {
  var assetsMenu = document.getElementById('assetsMenu');
  assetsMenu.innerHTML = 'Setup <div class="spacer"></div>';
  var updFunc = "updateSprite(this.id,this.parentNode.id)";

  charData.menuItems.forEach((id, i) => {
    const itemParams = params.default[id];
    assetsMenu.innerHTML +=
      `
        <div class="spriteSel" id="${id}" ${id !== 'body-fix'? '' : "style='display:none'"}>
          <input type="checkbox" onclick="${updFunc}" id="show" class="title" ${itemParams.show ? 'checked' : ''}>
          <label class="title"> ${id} </label><div class="spacer"></div>
          <button class="btn" onclick="${updFunc}" id="sub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14,7L9,12L14,17V7Z"/></svg></button> 
          <input class="spriteSel" id="qtd" min="1" value=${itemParams.qtd} type="number" oninput="${updFunc}" onclick="this.select()">
          <button class="btn" id="add" onclick="${updFunc}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,17L15,12L10,7V17Z"/></svg></button>
          <div class="spacer"></div>
          <input id="colorCheck" class="title" onclick="${updFunc}" type="checkbox" ${itemParams.colorCheck ? 'checked' : ''}>
          <input type="color" id='color' value="${itemParams.color}" oninput="this.parentNode.querySelector('#colorCheck').checked=1, ${updFunc}">
        </div>
        ${
        !(charData.menuItems.length > i + 1)
          ? `
        <div class="spacer"></div>
        <div class="spriteSel" id="changeSize">
          adult
          <label class="switch" onclick="
            charData.size.current = charData.size.types[+document.getElementById('resizer').checked];
            updateAll();" 
            id="show">
              <input type="checkbox" id="resizer" ${params.default.changeSize.resizer ? '' : 'checked'}>
              <span  class="slider round"></span>
            </label> 
            child 
        </div>
        <div class="spacer"></div>`
          : ''
        }
        `;
  });
  updateAll();
}

async function updateAll(mode = 'loader', value) {
	for (var i = 0, len = charData.menuItems.length; i < len; ++i) {
		await sleep(10)
		var id = charData.menuItems[i];

		await updateSprite(mode, id, value);

	}
}

//forceUpdate

async function updateSprite(mode, target, setVal) {
  const visible = getQuery(target, '#show').checked;
  const colorVisible = getQuery(target, '#colorCheck').checked;
  const sizeRegex = new RegExp(charData.size.types.join('|'), 'gi');
  const el = getQuery(target, '#qtd');
  let val = el ? parseInt(el.value, 10) : 1;

  if (!setVal) {
    setVal = val;
  }

  switch (mode) {
    case 'set':
      el.value = setVal;
      break;
    case 'add':
      el.value = val + 1;
      break;
    case 'sub':
      el.value = val - 1;
      break;
    default:
      // do nothing
      break;
  }

  successCounter[target] = 0;
  el.value = el.value && Math.abs(el.value) >= 1 ? Math.abs(el.value) : null;

  if (!visible) el.parentNode.style.color = 'var(--c-gray05)';
  else el.parentNode.style.color = 'var(--c-green04)';


	for (var n in charData.layers) {

		// charData.layers[n].img.src 
		var url = charData.layers[n].img.src.replace(sizeRegex, charData.size.current);

		if (charData.layers[n].img.getAttribute('class') !== "bg-color") {

			charData.layers[n].bmp2.y = charData.layers[n].bmp.y =
				(charData.size.current !== "adult") ? charData.layers[n].childOffset :
				((charData.layers[n].img.getAttribute('class') == "clothes" || charData.layers[n].img.getAttribute('class') == "clothes-b") &&
					getQuery('body-type', "#qtd").value <= 2) ?
				charData.layers[n].bmp.y = (charData.layers[n].img.getAttribute('class') !== "clothes" ? charData.yOffset.adultNew : getQuery('body-type', ".spriteSel").value == 2 ? -1 : charData.yOffset.adultNew) : charData.yOffset.adult

		}



		if (charData.layers[n].img.getAttribute('class') == "body-fix") {

			if ((getQuery('body-fix', '#colorCheck').checked !==
					getQuery('body-type', '#colorCheck').checked) ||
				(getQuery('body-fix', '#color').value !==
					getQuery('body-type', '#color').value)) {

				getQuery('body-fix', '#colorCheck').checked =
					getQuery('body-type', '#colorCheck').checked;

				getQuery('body-fix', '#color').value =
					getQuery('body-type', '#color').value
				updateSprite('loader', 'body-fix');
			}

			(charData.size.current == 'adult' && getQuery('body-type', "#qtd").value == 1) &&
			getQuery('clothes', "#show").checked == 1 ?
				(charData.layers[n].bmp.alpha = 1) :
				charData.layers[n].bmp.alpha = charData.layers[n].bmp2.alpha = 0;

			if (forceUpdate == 1) forceUpdate = 0, updateAll();
		}

		if (charData.layers[n].img.getAttribute("class") == target) {

			charData.layers[n].bmp.alpha = visible;
      var recolorVisible = getQuery(target, "#colorCheck").checked;
			charData.layers[n].bmp2.alpha = recolorVisible * visible;


			url = url.split("/").slice(0, -1).join("/") + "/" + el.value + charData.ext;

			var img = new Image();
			img.src = url;
			img.n = n;
			img.target = target;
			img.blankUrl = charData.layers[n].img.src.split("/").slice(0, -1).join("/") + "/0" + charData.ext;

			img.addEventListener("load", event => {
				displayUpdate(event.target.n, event.target.src, event.target.target);
				successCounter[target]++;
				lastSprite[target] = el.value;
			});
			img.addEventListener("error", event => {
				displayUpdate(event.target.n, event.target.blankUrl, event.target.target);
				console.log(lastSprite[target]);
				checkSuccess(target, el.value);
			});
		}

	}

}



async function displayUpdate(n, url, target) {
	charData.layers[n].img.src = url;
	await recolor(n, document.getElementById(target));
}


async function recolor(id, colorInput) {
	var colors = await printColor(colorInput.querySelector("#color"));
	var colorMode = +colorInput.querySelector("#colorCheck").checked;


	var img = charData.layers[id].img;
	var imgClass = img.getAttribute('class');

	var bmp = charData.layers[id].bmp;
	var bmp2 = charData.layers[id].bmp2;

	try {
		var matrix = new createjs.ColorMatrix();

		if (imgClass.includes('hair'))
			matrix.adjustSaturation(-80 * colorMode).adjustContrast(-25 * colorMode);
		else if (imgClass.includes('head') || imgClass.includes('body'))
			matrix.adjustSaturation(-50 * colorMode).adjustContrast(-50 * colorMode);
		else
			matrix.adjustSaturation(-25 * colorMode).adjustContrast(-10 * colorMode);

		bmp.filters[0].matrix = matrix;
		[bmp2.filters[0].redOffset,
			bmp2.filters[0].greenOffset,
			bmp2.filters[0].blueOffset
		] = colors;

		await sleep(20);


		bmp.cache(0, 0, img.width, img.height); //*/

		bmp2.cache(0, 0, img.width, img.height);

		await stage.update();

	} catch (e) {
		console.log('fail', e)
		await sleep(200), await recolor(id, colorInput);
	}
}

async function printColor(ev) {
	const color = ev.value
	const r = parseInt(color.substr(1, 2), 16)
	const g = parseInt(color.substr(3, 2), 16)
	const b = parseInt(color.substr(5, 2), 16)
	return [r, g, b]
}


function checkSuccess(target, val) {
	if (successCounter[target] == 0) {
		updateSprite("set", target, lastSprite[target])
	}
}


function downloadChar() {

	var ctx = stage.canvas.getContext('2d');

	var dta = ctx.getImageData(0, 0, 72, 128).data; // ctx is Context2D of a 
	var bb = UPNG.encode([dta], 72, 128);
	const url = URL.createObjectURL(new Blob([bb], {
		type: 'image/png'
	}));

	var link = document.createElement("a"); // Or maybe get it from the crrent document

	link.href = url;
	link.download = "EasyChar_" + new Date().getTime() + '.png';
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
      qtd: inputs[1].value,
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
    inputs[1].value = params.qtd;
    inputs[2].checked = params.colorCheck;
    inputs[3].value = params.color;
  }
}


//--------- Dynamic Load Files

function obj2arr(obj,name) {
  let arr = [name];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
        var temp = +obj[key]
        if (isNaN(temp)) temp = obj[key]
      arr.push(temp);
    }
  }
  return arr;
}

function arr2obj(arr) {
  let obj = {};
  let currentIndex = 0;
    obj[arr[0]] = {
      "show": arr[currentIndex + 1],
      "qtd": arr[currentIndex + 2],
      "colorCheck": arr[currentIndex + 3],
      "color": arr[currentIndex + 4]
    };

  return obj;
}

obj2arr(params.default.head,"head")
//arr2obj(obj2arr(params.default.head,"head"))

params.url = []

async function buildUrl() {
  charData.length = Object.keys(charData.json.folders).length;
  for (let i = charData.length; 1 <= i; i--) {
    const id = i.toString().padStart(2, '0');
    const type = charData.json.folders[id].type;
      params.url.push(obj2arr(params.default[type],type))
  }
}

buildUrl();
params.url