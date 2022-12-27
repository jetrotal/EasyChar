Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};
Number.prototype.pad = function(n) {
  return Array(n).join("0").slice(-1 * (n || 2)) + this;
};

var getQuery = function (a,b) {
  return  document.getElementById(a).querySelector(b)
}

var seed = Math.floor(Math.random() * 1000) + 1;
var successCounter = {}
var lastSprite = {}


var charData = {
  url:"https://jetrotal.github.io/EasyChar/",
  assetsFolder:"spriteData/",
  jsonFile:"details.json",
  ext:".gif",
  size:{
    types:['adult','child'], 
    current:"adult", 
    old:"child", 
    changesFolder:["body-type","body-fix", "clothes","clothes-b","bg-color"]
  },
  yOffset:{
    adult:0,
    child:2,
    adultNew:-2
  },
  menuItems:[],
  layers:{}
};

if (document.location.href == charData.url){
  charData.jsonFile = charData.jsonFile +"?" + seed;
 // charData.ext = charData.ext +"?" + seed
}

var stage = new createjs.Stage("charOutput");


fetch(charData.url + charData.assetsFolder + charData.jsonFile).then(res => res.json()).then(out => {
  charData.json = out;
  buildStage();
}).catch(err => console.log('error', err));

async function buildStage() {
  charData.length = Object.keys(charData.json.folders).length;
  for (let i = charData.length; 1 <= i; i--) {
    var id = i;
    10 > id && (id = id.pad(2));

    charData.menuItems.indexOf(charData.json.folders[id].type) === -1 &&
      charData.menuItems.push(charData.json.folders[id].type);

    var sizeFolder = charData.size.changesFolder.includes(charData.json.folders[id].type) &&
        charData.json.folders[id].type !== "bg-color"?
        charData.size.current + "/" : ""; 
    
    charData.layers[id] = {};
    charData.layers[id].img = document.createElement("img");
    charData.layers[id].img.crossOrigin = "Anonymous";
    charData.layers[id].img.className = charData.json.folders[id].type;

if(charData.layers[id].img.className == "bg-color") charData.layers[id].childOffset = 0
    else charData.layers[id].childOffset = 
        charData.size.changesFolder.includes(charData.json.folders[id].type) ? 
        0 : charData.yOffset.child;
    
   

    charData.layers[id].bmp = new createjs.Bitmap(charData.layers[id].img);
    charData.layers[id].bmp2 = new createjs.Bitmap(charData.layers[id].img);

    charData.layers[id].bmp.y = charData.layers[id].bmp2.y = 0;

    var matrix = new createjs.ColorMatrix().adjustSaturation(0);
    charData.layers[id].bmp.filters = [new createjs.ColorMatrixFilter( matrix )];
    charData.layers[id].bmp2.filters = [new createjs.ColorFilter(0,0,0,1, 0,0,0,0)];
    charData.layers[id].bmp2 .compositeOperation = "overlay";
    
    stage.addChild(charData.layers[id].bmp, charData.layers[id].bmp2);	

    charData.layers[id].img.src = `${charData.url+charData.assetsFolder}${id}/${sizeFolder}1`+charData.ext;
    
  }

  charData.menuItems.sort((a, b) => a.localeCompare(b));
  charData.menuItems.move(charData.menuItems.indexOf('head'), 0 );
  charData.menuItems.move(charData.menuItems.indexOf('bg-color'), charData.menuItems.length );

  buildMenu();
}

function buildMenu(){
var assetsMenu = document.getElementById('assetsMenu');
assetsMenu.innerHTML='Setup <div class="spacer"></div>';

for(var i = 0, len = charData.menuItems.length; i < len; ++i) {
  
  var id = charData.menuItems[i];
  var updFunc = "updateSprite(this.id,this.parentNode.id)"
  var setFunc = "updateSprite(this.id,this.parentNode.parentNode.id)"
 

  assetsMenu.innerHTML+=
  `
<div class="spriteSel" id="${id}" ${id == 'body-fix' ? "style='display:none'":''}>
<input type="checkbox" onclick="${updFunc}" id="show" class="title" ${id.includes("xtra") || id.includes("clothes") ? "" : 'checked'}>

  <label class="title"> ${id} </label><div class="spacer"></div>

  <button class="btn" onclick="${updFunc}" id="sub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14,7L9,12L14,17V7Z"/></svg></button> 
  <input class="spriteSel" id="qtd" min="1" value=1 type="number" oninput="${updFunc}" onclick="this.select()">
  <button class="btn" id="add" onclick="${updFunc}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,17L15,12L10,7V17Z"/></svg></button>${/*⯈*/''}
  <div class="spacer"></div>
  
  <input id="colorCheck" class="title" onclick="${updFunc}" type="checkbox"${id.includes("hair") || id.includes("pupil")  ?'checked':''}>
  
  <input type="color" id='color' value="${id.includes("hair")  ? '#888ff8' : id.includes("pupil")  ? '#000055':'#553737'}" oninput="this.parentNode.querySelector('#colorCheck').checked=1, ${updFunc}">
`
+//<a><img id="loader" src="" onerror="${setFunc}.then(this.parentNode.innerHTML='')"></img></a>
`</div>

${!(charData.menuItems.length > i+1) ? `
<div class="spacer"></div>
<div class="spriteSel" id="changeSize">adult<label class="switch" onclick="
charData.size.current = charData.size.types[+document.getElementById('resizer').checked];
updateAll();" 
id="show">
  <input type="checkbox" id="resizer" ${charData.size.current =='child'? 'checked':''}>
  <span  class="slider round"></span>
</label> child </div>
<div class="spacer"></div>`:''}
  `
  }  
updateAll();
};

async function updateAll(mode='loader',value){
  for(var i = 0, len = charData.menuItems.length; i < len; ++i) {
await sleep(10)
    var id = charData.menuItems[i];
  
    await updateSprite(mode, id, value);
    
  }
}

function checkNewBody(body = [1, 2, 3]) {
  for (var i = 0; i < body.length; i++) 
    if ("" + body[i] ==getQuery("body-type","#qtd").value) 
      return 1;  
  return 0;
}

var forceUpdate = 0;

async function updateSprite(mode, target, setVal) {
  var visible =getQuery(target,"#show").checked;
  var recolorVisible = getQuery(target,"#colorCheck").checked;

  var sizeRegex = new RegExp(charData.size.types.join("|"), 'gi');

  var el = getQuery(target,"#qtd"); 
  var val = el ? parseInt(el.value):1;
!setVal ?  setVal = val:'';

  mode == "set" ? el.value = setVal : 
  mode == "add" ? el.value = val + 1 : 
  mode == "sub" && (el.value = val - 1);
  
  successCounter[target] = 0;
  el.value = !!el.value && Math.abs(el.value) >= 1 ? Math.abs(el.value) : null
  
  if (!visible) el.parentNode.style.color='var(--c-gray05)';
  else el.parentNode.style.color='var(--c-green04)';
 


for (var n in charData.layers) {

  // charData.layers[n].img.src 
  var url = charData.layers[n].img.src.replace(sizeRegex, charData.size.current);
  
  if (charData.layers[n].img.getAttribute('class') !=="bg-color"){
   
  charData.layers[n].bmp2.y = charData.layers[n].bmp.y = 
    (charData.size.current!=="adult") ? charData.layers[n].childOffset :
    (( charData.layers[n].img.getAttribute('class') =="clothes" || charData.layers[n].img.getAttribute('class') =="clothes-b" ) && 
getQuery('body-type',"#qtd").value <= 2) ? 
    charData.layers[n].bmp.y = (charData.layers[n].img.getAttribute('class') !=="clothes" ? charData.yOffset.adultNew : document.getElementById("body-type").querySelector(".spriteSel").value == 2 ? -1 : charData.yOffset.adultNew) :  charData.yOffset.adult 
  
}



 if (charData.layers[n].img.getAttribute('class') =="body-fix"){

if ( (getQuery('body-fix','#colorCheck').checked 
  !== getQuery('body-type','#colorCheck').checked)
|| (getQuery('body-fix','#color').value 
  !== getQuery('body-type','#color').value) )
      { 
        
 getQuery('body-fix','#colorCheck').checked =
 getQuery('body-type','#colorCheck').checked;

getQuery('body-fix','#color').value =
 getQuery('body-type','#color').value
updateSprite('loader','body-fix');
}

    (charData.size.current=='adult' && getQuery('body-type',"#qtd").value == 1) &&
      getQuery('clothes',"#show").checked == 1
      ? (charData.layers[n].bmp.alpha = 1) 
:charData.layers[n].bmp.alpha = charData.layers[n].bmp2.alpha = 0;

if (forceUpdate ==1) forceUpdate = 0, updateAll();
    }
  
if (charData.layers[n].img.getAttribute("class") == target) {

  charData.layers[n].bmp.alpha = visible;
  charData.layers[n].bmp2.alpha = recolorVisible * visible;
  
  
  url = url.split("/").slice(0, -1).join("/") + "/" + el.value + charData.ext;
  
  var img = new Image();
  img.src = url;
  img.n = n;
  img.target = target;
  img.blankUrl = charData.layers[n].img.src.split("/").slice(0, -1).join("/") + "/0"+charData.ext;
  
  img.addEventListener("load", event => {
    displayUpdate(event.target.n, event.target.src, event.target.target);
    successCounter[target]++;
    lastSprite[target] = el.value;
  });
  img.addEventListener("error", event => {
    displayUpdate(event.target.n, event.target.blankUrl, event.target.target);
    console.log(  lastSprite[target] );
    checkSuccess(target, el.value);
  });
}

}

}

function checkSuccess(target, val){
  if (successCounter[target] == 0 ){
  updateSprite("set", target, lastSprite[target])
  }
}

async function displayUpdate(n,url,target){
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
     bmp2.filters[0].blueOffset] = colors;

    await sleep(20);
    
   
     bmp.cache(0, 0, img.width, img.height); //*/
    
    bmp2.cache(0, 0, img.width, img.height); 
    
    await stage.update();
    
  } catch (e) {console.log('fail',e)
    await sleep(200), await recolor(id, colorInput);
  }
}
 
async function printColor(ev) {
  const color = ev.value
  const r = parseInt(color.substr(1,2), 16)
  const g = parseInt(color.substr(3,2), 16)
  const b = parseInt(color.substr(5,2), 16)
  return [r,g,b]
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};


//createjs.Ticker.on("tick", tick);
//function tick() { console.log("TICK!!!"); }



function downloadChar(){

  var ctx = stage.canvas.getContext('2d');
  
  var dta = ctx.getImageData(0,0,72,128).data;  // ctx is Context2D of a 
  var  bb = UPNG.encode([dta], 72, 128);
  const url = URL.createObjectURL(new Blob([bb], { type: 'image/png' }));
  
  var link = document.createElement("a"); // Or maybe get it from the crrent document

  link.href = url;
  link.download = "EasyChar_"+new Date().getTime()+'.png';
  link.click();
}
