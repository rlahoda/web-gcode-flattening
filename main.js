// save prefs in local storage
// event watcher on units toggle

let prefs = {
  units: "in",
  zZeroPoint: "top",
  xyZeroPoint: "bottomLeft",
  retractHeight: 0.25,
  angle: 0,
  depthOfCut: 0.01,
  materialWidth: 10,
  materialHeight: 10,
  materialThickness: 1,
  bits: [
    {
      selected: true,
      name: "quarter inch downcut",
      num: 1,
      id: 1234567678,
      diameter: 0.25,
      stepover: 0.125,
      feedRate: 150,
      passDepth: 0.25,
      plungeRate: 80,
      rpm: 20000,
      units: "in",
    },
    {
      selected: false,
      name: "mm inch downcut",
      num: 2,
      id: 12345678,
      diameter: 6,
      stepover: 3,
      feedRate: 3000,
      passDepth: 3,
      plungeRate: 2000,
      rpm: 20000,
      units: "mm",
    }
  ]
}

let timeout;

function savePrefs() {
  // set timer to give buffer in case any changes come in in the mean time
  if (timeout) {
    // if there's already a timer, clear it and set a new one
    clearTimeout(timeout);
    timeout = setTimeout(setPrefs, 100);
  } else {
    // otherwise just set a timer
    timeout = setTimeout(setPrefs, 100);
  }
}

function setPrefs() {  
  // save prefs to local storage
  localStorage.setItem("prefs", JSON.stringify(prefs));
  checkDataAvailable();
}

function clearPrefs() {
  // clear prefs from local storage
  localStorage.clear();
  checkDataAvailable()
}

function convertToMM(num) {
  return parseFloat((num * 25.4).toFixed(3));
}
function convertToIN(num) {
  return parseFloat((num * 0.0393700787402).toFixed(3));
}

function deleteBit(event) {
  console.log("delete");
  
  const eventId = event.target.id;
  const [type, id] = eventId.split("-")  
  let updatedPrefs = {...prefs};
  let updatedBits = prefs.bits.filter(bit=> bit.id !== parseInt(id))
  updatedPrefs.bits = [...updatedBits];
  updatedPrefs.bits[0].selected = true;
  prefs = {...updatedPrefs};
  generateBits();
  savePrefs();
}

function addBit() {
  const newInputs = document.getElementsByClassName("new-bit");
  const now = new Date()
  const newId = now.valueOf()
  const newBit =  {
      selected: false,
      name: "",
      num: 0,
      id: newId,
      diameter: 0,
      feedRate: 0,
      passDepth: 0,
      plungeRate: 0,
      rpm: 0,
      units: "",
    }
  for (let i = 0; i < newInputs.length; i++) {
    const input = newInputs[i];
     if (input.type === "number") {
      newBit[input.id] = parseFloat(input.value);
    } else {
      newBit[input.id] = input.value;
    }
  }
  let updatedPrefs = {...prefs};
  updatedPrefs.bits = [...prefs.bits, newBit]
  prefs = {...updatedPrefs};
  generateBits();
  savePrefs()
}

function editBit(event) {
  const eventId = event.target.id;
  const [type, id] = eventId.split("-");
  console.log(id);
  
  generateBits(id);
}

function updateBit(event) {
  const updateInputs = document.getElementsByClassName("update-bit");
  const eventId = event.target.id;
  const [type, id] = eventId.split("-");
  console.log(id);
  const updateBit =  {
      selected: false,
      name: "",
      num: "",
      id: id,
      diameter: 0,
      feedRate: 0,
      passDepth: 0,
      plungeRate: 0,
      rpm: 0,
      units: "",
    }
  for (let i = 0; i < updateInputs.length; i++) {
    const input = updateInputs[i];
    if (input.type === "number") {
      updateBit[input.id] = parseFloat(input.value);
    } else {
      updateBit[input.id] = input.value;
    }
  }
  console.log(updateBit);
  
  let updatedPrefs = {...prefs};
  const filteredBits = updatedPrefs.bits.filter(bit => bit.id !== id);
  const selectedBit = filteredBits.filter(bit => bit.selected);
  if (selectedBit.length === 0) {
    updateBit.selected = true;
  }
  updatedPrefs.bits = [...filteredBits, updateBit]
  prefs = {...updatedPrefs};
  generateBits();
  savePrefs()
}

function selectBit(event) {
  const eventId = event.target.id;
  const [type, id] = eventId.split("-");

  let updatedBits = prefs.bits.map(bit=> {
    
    if (bit.id === parseFloat(id) ) {
      bit.selected = true;
    } else {
      bit.selected = false;
    }
    return bit
  })
  
  let updatedPrefs = {...prefs};
  updatedPrefs.bits = [...updatedBits];
  prefs = {...updatedPrefs};
  generateBits();
  generateGCode();
  savePrefs()
}

function selectPref(event) {
  
  const eventId = event.target.id;
  const [id, value] = eventId.split("-")
  let updatedPrefs = {...prefs};
  updatedPrefs[id] = value;
  prefs = {...updatedPrefs};
  
  generatePrefs();
  generateBits();
  generateGCode();
  savePrefs();
}

function updatePrefsValues(event) {
  const eventId = event.target.id;
  const value = event.target.value;
  let updatedPrefs = {...prefs};
  updatedPrefs[eventId] = value;
  prefs = {...updatedPrefs};
  savePrefs();
  generatePrefs();
  generateGCode();
}

function copyGcode() {
  const gCodeContainer = document.getElementById("gcode-container");
  const codeText = gCodeContainer.innerHTML
  writeClipboardText(codeText)
}

async function writeClipboardText(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error(error.message);
  }
}

function generateLineNumbers(count) {
  const numberContainer = document.getElementById("code-numbers");
  for (let i = 0; i < count; i++) {
    numberContainer.innerHTML += `<li data-value="${i}"></li>`
    
  }
}

function generatePrefs() {
  const prefsSelectorContainer = document.getElementById("prefs-selectors-container");
  const prefsInputsContainer = document.getElementById("prefs-inputs-container");
  const prefsMaterialContainer = document.getElementById("prefs-material-container");
  // set units
  const unitsButtons = `
  <div class="toggle" id="units">
    <h3 class="inline">Project Units</h3>
    <button type="button" class="${prefs.units === "in"?"selected":""}" id="units-in">Inches</button>
    <button type="button" id="units-mm" class="${prefs.units === "mm"?"selected":""}">Milimeters</button>
  </div>`
  const angleButtons = `
  <div class="toggle" id="angle">
    <h3 class="inline">Angle (degrees)</h3>
    <button type="button" class="${prefs.angle == 0 ?"selected":""}" id="angle-0">0</button>
    <button type="button" id="angle-90" class="${prefs.angle == 90 ?"selected":""}">90</button>
  </div>`

  // set z zero
  const zButtons = `
   <div class="toggle" id="z-zero">
    <h3 class="inline">Z Zero Point</h3>
    <button type="button" id="zZeroPoint-top" class="${prefs.zZeroPoint === "top"?"selected":""}">Top</button>
    <button type="button" id="zZeroPoint-bottom" class="${prefs.zZeroPoint === "bottom"?"selected":""}">Bottom</button>
  </div>`

  // set xy zero
  const xyButtons = `
  <div class="toggle" id="xy-zero">
    <h3 class="inline">X/Y Zero Point</h3>
    <button type="button" id="xyZeroPoint-bottomLeft" class="${prefs.xyZeroPoint === "bottomLeft"?"selected":""}">Bottom Left</button>
    <button type="button" id="xyZeroPoint-centerLeft" class="${prefs.xyZeroPoint === "centerLeft"?"selected":""}">Center Left</button>
    <button type="button" id="xyZeroPoint-topLeft" class="${prefs.xyZeroPoint === "topLeft"?"selected":""}">Top Left</button>
    <button type="button" id="xyZeroPoint-center" class="${prefs.xyZeroPoint === "center"?"selected":""}">Center</button>
  </div>`

  const inputs = `
   <div class="toggle">
   <h3 class="inline">Depth of Cut ${prefs.units === "in" ? "(in)" : "(mm)"}</h3>
   <input class="prefs-inputs" type="number" id="depthOfCut" size="6" value="${prefs.depthOfCut}" />
   </div>
   <div class="toggle">
   <h3 class="inline">Retract Height ${prefs.units === "in" ? "(in)" : "(mm)"}</h3>
   <input class="prefs-inputs" type="number" id="retractHeight" size="6" value="${prefs.retractHeight}" />
   </div>
  `

    const material = `
  <div class="toggle">
   <h3 class="inline">Material Thickness</h3>
   <input class="material-inputs" type="number" id="materialThickness" size="6" value="${prefs.materialThickness}" />
   </div>
   <div class="toggle">
   <h3 class="inline">Material Width</h3>
   <input class="material-inputs" type="number" id="materialWidth" size="6" value="${prefs.materialWidth}" />
   </div>
   <div class="toggle">
   <h3 class="inline">Material Height</h3>
   <input class="material-inputs" type="number" id="materialHeight" size="6" value="${prefs.materialHeight}" />
   </div>
   `

  prefsSelectorContainer.innerHTML = unitsButtons + zButtons + xyButtons + angleButtons;
 const buttons = prefsSelectorContainer.getElementsByTagName("button");

 prefsInputsContainer.innerHTML = inputs;
const prefsInputs = prefsInputsContainer.getElementsByTagName("input")

prefsMaterialContainer.innerHTML = material;
const materialInputs = prefsMaterialContainer.getElementsByTagName("input")


  for (const button of buttons) {
    button.addEventListener("click", selectPref);
  }

  for (const input of prefsInputs) {
    input.addEventListener("change", updatePrefsValues)
  }
  
  for (const input of materialInputs) {
    input.addEventListener("change", updatePrefsValues)
  }
}

function generateBits(id) {
  
  const table = document.getElementById("bits-table");
  table.innerHTML = "";
  let contents = ""
  let bitToEdit = {}
  
  if (id) {
    const bitProperties = prefs.bits.filter(bit => bit.id === id);
    console.log(bitProperties);
    bitToEdit = {...bitProperties[0]};
  }

  if (id) {
    contents = `
      <div class="table-header"></div>
      <div class="table-header">Name</div>
      <div class="table-header">#</div>
      <div class="table-header">Diameter ${prefs.units === "in" ? "(in)" : "(mm)"}</div>
      <div class="table-header">Stepover ${prefs.units === "in" ? "(in)" : "(mm)"}</div>
      <div class="table-header">Feed Rate ${prefs.units === "in" ? "(in/min)" : "(mm/min)"}</div>
      <div class="table-header">Pass Depth ${prefs.units === "in" ? "(in)" : "(mm)"}</div>
      <div class="table-header">Plunge Rate ${prefs.units === "in" ? "(in/min)" : "(mm/min)"}</div>
      <div class="table-header">RPM</div>
      <div class="table-header">Original Units</div>
      <div class="table-header"></div>
      <div class="table-header"></div>
      <div class="table-content"></div>
      <div class="table-content"><input class="update-bit center-align" type="text" id="name" name="name" required value="${bitToEdit.name}"/></div>
      <div class="table-content"><input class="update-bit" type="number" id="num" name="num" size="10" required value="${bitToEdit.num}"/></div>
      <div class="table-content"><input class="update-bit" type="number" id="diameter" name="diameter" required size="10" value="${bitToEdit.diameter}"/></div>
      <div class="table-content"><input class="update-bit" type="number" id="stepover" name="stepover" required size="10" value="${bitToEdit.stepover}" /></div>
      <div class="table-content"><input class="update-bit" type="number" id="feedRate" name="feedRate" required size="10" value="${bitToEdit.feedRate}" /></div>
      <div class="table-content"><input class="update-bit" type="number" id="passDepth" name="passDepth" required size="10" value="${bitToEdit.passDepth}" /></div>
      <div class="table-content"><input class="update-bit" type="number" id="plungeRate" name="plungeRate" required size="10" value="${bitToEdit.plungeRate}"/></div>
      <div class="table-content"><input class="update-bit" type="number" id="rpm" name="rpm" required size="10" value="${bitToEdit.rpm}"/></div>
      <div class="table-content"><input class="update-bit center-align" disabled type="text" id="units" name="units" size="2" value="${bitToEdit.units}" /></div>
      <div class="table-content"><button id="update-${bitToEdit.id}">Update Bit</button></div>
      <div class="table-content"></div>
    `;
    
  } else {
    contents = `
      <div class="table-header"></div>
      <div class="table-header">Name</div>
      <div class="table-header">#</div>
      <div class="table-header">Diameter ${prefs.units === "in" ? "(in)" : "(mm)"}</div>
      <div class="table-header">Stepover ${prefs.units === "in" ? "(in)" : "(mm)"}</div>
      <div class="table-header">Feed Rate ${prefs.units === "in" ? "(in/min)" : "(mm/min)"}</div>
      <div class="table-header">Pass Depth ${prefs.units === "in" ? "(in)" : "(mm)"}</div>
      <div class="table-header">Plunge Rate ${prefs.units === "in" ? "(in/min)" : "(mm/min)"}</div>
      <div class="table-header">RPM</div>
      <div class="table-header">Original Units</div>
      <div class="table-header"></div>
      <div class="table-header"></div>
      <div class="table-content"></div>
      <div class="table-content"><input class="new-bit center-align" type="text" id="name" name="name" required/></div>
      <div class="table-content"><input class="new-bit" type="number" id="num" name="num" size="10" required/></div>
      <div class="table-content"><input class="new-bit" type="number" id="diameter" name="diameter" required size="10" /></div>
      <div class="table-content"><input class="new-bit" type="number" id="stepover" name="stepover" required size="10" /></div>
      <div class="table-content"><input class="new-bit" type="number" id="feedRate" name="feedRate" required size="10" /></div>
      <div class="table-content"><input class="new-bit" type="number" id="passDepth" name="passDepth" required size="10" /></div>
      <div class="table-content"><input class="new-bit" type="number" id="plungeRate" name="plungeRate" required size="10" /></div>
      <div class="table-content"><input class="new-bit" type="number" id="rpm" name="rpm" required size="10" /></div>
      <div class="table-content"><input class="new-bit center-align" disabled type="text" id="units" name="units" size="2" value="${prefs.units}" /></div>
      <div class="table-content"><button id="add-1">Add Bit</button></div>
      <div class="table-content"></div>
    `;

  }

  const sortedBits = sort(prefs.bits, "num", "az")

  for (let i = 0; i < sortedBits.length; i++) {
    const bit = sortedBits[i];
    if (id && bit.id === id) {
      continue;
    };

    if (prefs.units !== bit.units) {
      if (prefs.units === "in") {
        const markup = `
        <div class="table-content toggle"><button id="select-${bit.id}" class="${bit.selected ? "selected":""}" type="button">✔️</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.name}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.num}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToIN(bit.diameter)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToIN(bit.stepover)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToIN(bit.feedRate)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToIN(bit.passDepth)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToIN(bit.plungeRate)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.rpm}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.units}</div>
        <div class="table-content"><button id="edit-${bit.id}" type="button">Edit</button></div>
        <div class="table-content"><button id="delete-${bit.id}" type="button">Delete</button></div>`;
        contents +=markup;
        
      } else {
        const markup = `
        <div class="table-content toggle"><button id="select-${bit.id}" class="${bit.selected ? "selected":""}" type="button">✔️</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.name}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.num}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToMM(bit.diameter)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToMM(bit.stepover)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToMM(bit.feedRate)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToMM(bit.passDepth)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${convertToMM(bit.plungeRate)}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.rpm}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.units}</div>
        <div class="table-content"><button id="edit-${bit.id}" type="button">Edit</button></div>
        <div class="table-content"><button id="delete-${bit.id}" type="button">Delete</button></div>`;
        contents +=markup;
        
      }
    } else {
      const markup = `
        <div class="table-content toggle"><button id="select-${bit.id}" class="${bit.selected ? "selected":""}" type="button">✔️</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.name}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.num}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.diameter}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.stepover}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.feedRate}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.passDepth}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.plungeRate}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.rpm}</div>
        <div class="table-content ${bit.selected ? "selected":""}">${bit.units}</div>
        <div class="table-content"><button id="edit-${bit.id}" type="button">Edit</button></div>
        <div class="table-content"><button id="delete-${bit.id}" type="button">Delete</button></div>`;
        contents +=markup;
    }

  }


  table.innerHTML = contents;
  const buttons = table.getElementsByTagName("button");
  for (const button of buttons) {
    const [type, id] = button.id.split("-")
    if (type === "delete") {
      button.addEventListener("click", deleteBit)
      
    } else if (type === "add"){
      button.addEventListener("click", addBit)

    } else if (type === "select"){
      button.addEventListener("click", selectBit)

    } else if (type === "edit"){
      button.addEventListener("click", editBit)
  
    } else if (type === "update"){
      button.addEventListener("click", updateBit)
      
    
    } else {
      
    }
  }
}

function calculateStartPoints(bit) {
  let startPoints = {
    xStart: 0,
    yStart: 0,
    zStart: 0, 
    zFirstPass: 0,// how deep the first pass goes
    xLimit: prefs.materialWidth,
    yLimit: prefs.materialHeight,
    zLimit: 0, // lowest the z will go
    zRetract: 0,
  }

  if (prefs.zZeroPoint === "top") {
    startPoints.zRetract = 0 + prefs.retractHeight;
    startPoints.zFirstPass = prefs.depthOfCut < bit.passDepth ? 0 - prefs.depthOfCut : 0 - bit.passDepth;
    startPoints.zStart = 0;
    startPoints.zLimit = 0 - prefs.depthOfCut;
  } else {
    startPoints.zRetract = prefs.materialThickness + prefs.retractHeight;
    startPoints.zFirstPass = prefs.depthOfCut < bit.passDepth ? prefs.materialThickness - prefs.depthOfCut : prefs.materialThickness - bit.passDepth;
    startPoints.zStart = prefs.materialThickness;
    startPoints.zLimit = prefs.materialThickness - prefs.depthOfCut;
  }

  switch (prefs.xyZeroPoint) {
    case "centerLeft":
      startPoints.yStart = 0 - (0.5 * prefs.materialHeight);
      startPoints.yLimit = 0 + (0.5 * prefs.materialHeight);
      startPoints.xLimit = 0 + prefs.materialWidth;
      break;
    case "topLeft":
      startPoints.yStart = 0 - prefs.materialHeight;
      startPoints.xLimit = 0 + prefs.materialWidth;
      break;
    case "center":
      startPoints.yStart = 0 - (0.5 * prefs.materialHeight);
      startPoints.xStart = 0 - (0.5 * prefs.materialWidth);
      startPoints.yLimit = 0 + (0.5 * prefs.materialHeight);
      startPoints.xLimit = 0 + (0.5 * prefs.materialWidth);
      break;
  
    default:
      break;
  }
  return startPoints
}

function countLines(string) {
  return string.split(/\r|\r\n|\n/g).length;
}

function generateGCode() {
  const gCodeContainer = document.getElementById("gcode-container");
  const selectedBit = prefs.bits.filter(bit => bit.selected === true)
  const bitValues =  {...selectedBit[0]};
  
  // compare bit units to project units and update as necessary
   if (prefs.units !== bitValues.units) {
      if (prefs.units === "in") {
        // convert to inches
        bitValues.diameter = convertToIN(bitValues.diameter);
        bitValues.feedRate = convertToIN(bitValues.feedRate);
        bitValues.passDepth = convertToIN(bitValues.passDepth);
        bitValues.plungeRate = convertToIN(bitValues.plungeRate);
      } else {
        // convert to mm
        bitValues.diameter = convertToMM(bitValues.diameter);
        bitValues.feedRate = convertToMM(bitValues.feedRate);
        bitValues.passDepth = convertToMM(bitValues.passDepth);
        bitValues.plungeRate = convertToMM(bitValues.plungeRate);
      }
    } 
  const startPoints = calculateStartPoints(bitValues)
console.log(startPoints);

  // da big loop
  let loopCode = "";
  let primaryAxisPosition = 0;
  let zCurrentHeight = startPoints.zFirstPass;
  let zLoopNeeded = false;
  let firstLoop = true;
  let primaryAxis = "Y";
  let secondaryAxis = "X";
  let primaryLimit = startPoints.yLimit; // primary is the one it steps up
  let secondaryLimit = startPoints.xLimit; // secondary is the one is moves across
  let primaryStart = startPoints.yStart;
  let secondaryStart = startPoints.xStart;

  if (startPoints.zLimit !== startPoints.zFirstPass) {
    zLoopNeeded = true;
  }
  

  if (prefs.angle == 0) {
    primaryAxisPosition = startPoints.yStart
  } else {
    primaryLimit = startPoints.xLimit;
    secondaryLimit = startPoints.yLimit;
    primaryAxisPosition = startPoints.xStart
    primaryStart = startPoints.xStart;
    secondaryStart = startPoints.yStart;
  }
  // start from zero point
  // y stays the same, set x as far end amount
  // add stepover to y, x stays the same
  // x goes back to start
  while (primaryAxisPosition < primaryLimit) {
    // go to secondary axis limit, step up the stepover amount, come back to secondary axis start
    primaryAxisPosition = primaryAxisPosition + bitValues.stepover;
    loopCode += `
${secondaryAxis}${secondaryLimit}${firstLoop ? `F${bitValues.feedRate}`:""}
${primaryAxis}${primaryAxisPosition}
${secondaryAxis}${secondaryStart}`
    firstLoop = false;
  }
let  zLoopCode = "";
  while (zLoopNeeded) {
    // it's already done 1 pass, now step down again and repeat
    // check to make sure the next step down doesn't go below the limit
    // if it does, only go to that limit and set the flag to false
    // otherwise do another step
    zCurrentHeight = zCurrentHeight - bitValues.passDepth;
    
    if (zCurrentHeight <= startPoints.zLimit) {
      zCurrentHeight = startPoints.zLimit
      zLoopNeeded = false;
    }
    zLoopCode += `(Retract to safe height)
Z${startPoints.zRetract}F${bitValues.plungeRate}
(Move to start point)
G00X${startPoints.xStart}Y${startPoints.yStart}
(Step down the pass depth then start over)
G01Z${zCurrentHeight}F${bitValues.plungeRate}${loopCode}`
  }

const gCode = `(GCode Flattening Generator)
(Use at your own risk)
(Everything is an experiment)
(Check the Carbide 3d forums if you need help)
(I run a Carbide 3d Shapeoko 5.1 Pro)
(The code might need to be different if you're on a different machine)
(stockMin:${startPoints.xStart}${prefs.units}, ${startPoints.yStart}${prefs.units}, ${startPoints.zStart}${prefs.units})
(stockMax:${startPoints.xLimit}${prefs.units}, ${startPoints.yLimit}${prefs.units}, ${startPoints.zLimit}${prefs.units})
(STOCK/BLOCK,${prefs.materialWidth}, ${prefs.materialHeight}, ${prefs.materialThickness}, ${startPoints.xStart}, ${startPoints.yStart}, ${startPoints.zStart})
(Set the machine to absolute programming - everything is set from a zero point)
G90
(set units that the gcode is created in G20 for in, G21 for mm)
${prefs.units === "in" ? "G20" : "G21"}
(Move to safe Z to avoid workholding)
(G53 is go to machine zero)
G53G0Z-0.197
(TOOL ${bitValues.num}: ${bitValues.name}.)
(M05 is spindle stop)
M05
(Change bit to number ${bitValues.num})
M6T${bitValues.num}
(Set spindle to ${bitValues.rpm} rpm)
M03S${bitValues.rpm}
G01X${startPoints.xStart}Y${startPoints.yStart}
Z${startPoints.zRetract}
Z${startPoints.zFirstPass}F${bitValues.plungeRate}${loopCode}${zLoopCode}
(Job Complete. Raise spindle to safe height)
G0Z${startPoints.zRetract}
(Stop spindle)
M05
(Go to home)
M02
  `
  gCodeContainer.innerHTML = gCode;

  function downloadGCode() {
    const textBlob = new Blob([gCode], { type: "text/plain" });
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement("a");
    a.classList.add("visually-hidden");
    a.href = url;
    a.download = "flatten.nc";
    document.body.appendChild(a);
    a.click();
    // Cleanup
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // const lineCount = countLines(gCode)
  // generateLineNumbers(lineCount)

  const downloadButton = document.getElementById("download-button")
  downloadButton.addEventListener("click", downloadGCode);

  const copyButton = document.getElementById("code-copy");
  copyButton.addEventListener("click", copyGcode);
}

function checkDataAvailable() {
  const localPrefs = localStorage.getItem("prefs");
  const clearPrefsButton = document.getElementById("clear-prefs");
  clearPrefsButton.addEventListener("click", clearPrefs);
  const dataFoundMessage = document.getElementById("data-found");
  const noDataFoundMessage = document.getElementById("no-data-found");
  
  if (!localPrefs) {
    clearPrefsButton.setAttribute("disabled", true)
    dataFoundMessage.classList.add("visually-hidden")
    noDataFoundMessage.classList.remove("visually-hidden")
  } else {    
    let updatedPrefs = JSON.parse(localPrefs);
    prefs = {...updatedPrefs};
    clearPrefsButton.removeAttribute("disabled")
    dataFoundMessage.classList.remove("visually-hidden")
    noDataFoundMessage.classList.add("visually-hidden")
  }
}




function initialize() {
  // check local storage for prefs and load if they exist
  checkDataAvailable();
  
  generatePrefs();
  generateBits();
  generateGCode();

  // add listener to units toggle
  // add listener to bits table
  // add listeners to material settings
  // add listeners to bit selector
}
initialize();


function sort(data, sortParam, sortOrder) {
  function checkIfLetters(value) {
    const regex = RegExp("^d");
    return regex.test(value);
  }
  let sortedData;

  if (sortOrder === "az") {
    sortedData = data.sort(function(a, b) {
      let aParam = a[sortParam];
      let bParam = b[sortParam];

      const aIsLetters = checkIfLetters(aParam);
      const bIsLetters = checkIfLetters(bParam);
      if (typeof aParam === "string" && aIsLetters && bIsLetters) {
        aParam = aParam.toUpperCase(); // ignore upper and lowercase
        bParam = bParam.toUpperCase(); // ignore upper and lowercase
      }

      if (aParam < bParam) {
        return -1;
      }
      if (aParam > bParam) {
        return 1;
      }
      // names must be equal
      return 0;
    });
  } else if (sortOrder === "za") {
    sortedData = data.sort(function(a, b) {
      let aParam = a[sortParam];
      let bParam = b[sortParam];

      const aIsLetters = checkIfLetters(aParam);
      const bIsLetters = checkIfLetters(bParam);
      if (typeof aParam === "string" && aIsLetters && bIsLetters) {
        aParam = aParam.toUpperCase(); // ignore upper and lowercase
        bParam = bParam.toUpperCase(); // ignore upper and lowercase
      }

      if (aParam < bParam) {
        return 1;
      }
      if (aParam > bParam) {
        return -1;
      }
      // names must be equal
      return 0;
    });
  }
  return sortedData;
}