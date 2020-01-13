/*



*/
autowatch = 1;

outlets = 3;
var lcdOut = 0;
var colomnOut = 1;
var debug = 2;

/*****************************************
SETUP VARIABLES
*****************************************/
var dimX = 8;
var dimY = 8;
var gridSize = 53;
var gridSpacing = 2;

function size(x,y){ 
	dimX=x; dimY=y;
	var a = new Array();
	a.push("dim");
	a.push(x * gridSize + x * gridSpacing);
	a.push(y * gridSize +  y * gridSpacing);
	createStates();
	outlet(lcdOut, a);
}

var curNumStates = 3;
function numStates (val) { 
	curNumStates=val;
	createColor();
}


var curColor = new Array(255,0,0);

var color = new Array(curNumStates);
function createColor(){ 
	for(var i=0;i<curNumStates;i++) {
		color[i] = new Array(3);
		for(var k=0;k<3;k++)color[i][k] = curColor[k] * (i/curNumStates) * (curNumStates/(curNumStates-1));
			//post(i, color[i], "\n");
	}
}//createColor
createColor();
var curCursorColor = new Array(3);
function cursorColor(){
	var a = arrayfromargs(messagename,arguments);
	for(var i=0;i<3;i++)curCursorColor[i] = a[i+1];
}
cursorColor(50,50,50);

//arrays for storing states
var states = new Array(dimX);
function createStates(){
	for(var i=0; i<dimX; i++){
		states[i] = new Array(dimY);
		for(var k=0;k<dimY;k++) states[i][k] = {x:0, y:0, color:[0,0,0], state:0};
		//post(states[i],"\n");
	}
}
createStates()

function loadbang(){
	outlet(lcdOut, "brgb 0 0 0");
	outlet(lcdOut, "clear");
}


/****************************************
MAIN
****************************************/

//new message changing the state of one button
function update(){
	var a = arrayfromargs(messagename,arguments);
	a[2] = dimY - a[2] - 1;
	//post(a[2]);
	states[a[1]][a[2]].state = (states[a[1]][a[2]].state + 1 ) % curNumStates ;
	curState = states[a[1]][a[2]].state;
	for(var i=0;i<3;i++) {
		var hue = curState / (curNumStates-1);
		states[a[1]][a[2]].color[i] = a[i+3] * hue;
	}
	
	writeGrid(a[1],a[2], 
		curState * states[a[1]][a[2]].color[0],
		curState * states[a[1]][a[2]].color[1],
		curState * states[a[1]][a[2]].color[2]);
	outlet(debug,a);
}

function writeGrid(x, y, r, g, b){
	var state = states[x][y];
	var a = new Array(8);
	a[0] = "paintrect";
	a[1] = x * gridSize+ (x+1)*gridSpacing;
	a[2] = y * gridSize + (y+1)*gridSpacing;
	a[3] = (x+1) * gridSize + (x+1)*gridSpacing;
	a[4] = (y+1) * gridSize + (y+1)*gridSpacing;
	a[5] = r;  
	a[6] = g;  
	a[7] = b;
	outlet(lcdOut,a);                   
}

function msg_int(val){
	if(val >=0) val = val % dimX;
	else val = 0;

	//create cursor column
	for(var i=0;i<dimY;i++){ 
		var col = new Array(3);
		for(var k=0;k<3;k++) {
			col[k] = states[val][i].color[k];
			col[k] += curCursorColor[k];
		}
		writeGrid(val,i,col[0],col[1],col[2]);
	}

	//update prev cursor column
	for(var i=0;i<dimY;i++){
		var col = new Array(3);
		var prevVal = (val + dimX - 1) % dimX;
		for(var k=0;k<3;k++) {
			col[k] = states[prevVal][i].color[k];
		}
		writeGrid(prevVal,i,col[0],col[1],col[2]);
	}

	var s = new Array(dimY);
	for(var i=0; i<dimY; i++) {
		curY = (dimY-i-1) % dimY;
		s[i] = states[val][curY];
	}

	outlet(colomnOut, s);

}