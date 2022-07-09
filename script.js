Number.prototype.pad = function(n) {
  return Array(n).join("0").slice(-1 * (n || 2)) + this;
};

var spriteData = {
url:"https://jetrotal.github.io/EasyChar/", 
size:"adult", 
usesSize:["body-type", "clothes"], 
childOffsef:2, //if(size == "child") translates-Y 2px
menuItems:[]
};

fetch(spriteData.url + "spriteData/details.json").then(res => res.json()).then(out => {
  spriteData.json = out;
  start();
}).catch(err => console.log('error', JSON.stringify(err)));

function start() {
  document.getElementById("charOutput").innerHTML = "";

  spriteData.length = Object.keys(spriteData.json.folders).length;

  for (let i = 1; i < spriteData.length; i++) {
    var id = i;
    10 > id && (id = id.pad(2));

    -1 === spriteData.menuItems.indexOf(spriteData.json.folders[id].type) && spriteData.menuItems.push(spriteData.json.folders[id].type);

    var size = spriteData.usesSize.includes(spriteData.json.folders[id].type) ? spriteData.size + "/" : "", yOffset = "child" !== spriteData.size || spriteData.usesSize.includes(spriteData.json.folders[id].type) ? 0 : spriteData.childOffsef + "px";

var overclass=""

var spriteHTML= function(){
  return `
  <img
    style="
    transform:translateY(${yOffset});
    z-index:${spriteData.length - i}
    "
    id="layer_${id}"
    class="${spriteData.json.folders[id].type} ${overclass}";
    src="${spriteData.url}spriteData/${id}/${size}1.gif"
    onerror="this.style.display='none'" 
    onload="this.style.display='absolute'"></img>
    `
                          };

    
    document.getElementById("charOutput").innerHTML += spriteHTML();

    var overclass="overlay";
    document.getElementById("charOutput").innerHTML += spriteHTML();
    
    var overclass="top";
    document.getElementById("charOutput").innerHTML += spriteHTML();
    
  }




spriteData.menuItems.sort((a, b) => a.localeCompare(b))
  generateMenu();
}

function generateMenu(){
  spriteData.menuItems
for(var i = 0, len = spriteData.menuItems.length; i < len; ++i) {
      

  var id = spriteData.menuItems[i];
  var updFunc = "updateSprite(this.id,this.parentNode.id)"
  
  document.getElementById('assetsMenu').innerHTML+=
  `
<div class="spriteSel" id="${id}">
<input type="checkbox" id="show" onclick="${updFunc}" id="dummy" class="title" ${id.includes("xtra") || id.includes("clothes") ? "" : 'checked'}>
  <label class="title"> ${id}: </label>
  <button class="btn" onclick="${updFunc}" id="sub">\◀</button>
  <input class="spriteSel" id="qtd" min="0" value=1 type="number">
  <button class="btn" id="add" onclick="${updFunc}">▶</button>

  <input id="colorCheck" class="title" onclick="${updFunc}" type="checkbox"${id.includes("hair") || id.includes("pupil")  ?'checked':''}>

<input type="color" id="color" value="${id.includes("hair")  ? '#ff0000' : '#250000'}" oninput="this.parentNode.querySelector('#colorCheck').checked=1, getColor(this,this.parentNode.id)">

  <img src="" onerror="${updFunc}"></img>
</div>
  `
  }  

};

function updateSprite(mode, target, setVal=1) {
  var el = document.getElementById(target).querySelector("#qtd"); 
  val = parseInt(el.value);

  "set" == mode ? el.value = setVal : 
  "add" == mode ? el.value = val + 1 : 
  "sub" == mode && (el.value = val - 1);
  
  
  mode = document.getElementById(target).querySelector("#show").checked;
  target = document.getElementsByClassName(target);
  
  for (val = 0; val < target.length; val++) target[val].src = target[val].src.split("/").slice(0, -1).join("/") + "/" + el.value * mode + ".gif";
  
}


function getColor(input,output) {
var colorA = 'contrast(0) sepia(100%) saturate(100000%)'
console.log ( output, document.querySelector(`.${output}.overlay`) )
    let color = HexToHSL(input.value)
    
    console.log('hsl(' + color.h + ', ' + color.s + '%, ' + color.l + '%)')
}

function HexToHSL(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }

    s = s*100;
    s = Math.round(s);
    l = l*100;
    l = Math.round(l);
    h = Math.round(360*h);

    return {h, s, l};
}