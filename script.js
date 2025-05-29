let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let rows,columns,Basei,Basej,window_height,window_width;
let stangles= [];
class Circle {
   constructor(context,x,y,r,fcolor,scolor,sangle,cangle){
    this.x=x;
    this.y=y;
    this.fcolor=fcolor;
    this.scolor=scolor;
    this.r=r;
    this.sangle= sangle;
    this.cangle = cangle;
    this.context = context;
   }
   drawCircle(){
    this.context.beginPath();
    this.context.strokeStyle = this.scolor;
    this.context.fillStyle = this.fcolor;
    this.context.arc(this.x, this.y, this.r, this.sangle, this.sangle + this.cangle, false);
    this.context.stroke();
    this.context.fill();
    this.context.closePath();
   }
   drawSector(){
    this.context.beginPath();
    this.context.moveTo(this.x,this.y);
    this.context.lineTo(this.x+this.r*Math.cos(this.sangle),this.y+this.r*Math.sin(this.sangle));
    this.context.arc(this.x,this.y,this.r,this.sangle,this.sangle+this.cangle,false);
    this.context.closePath();
    this.context.lineWidth = 1.5;
    this.context.fillStyle = this.fcolor;
    this.context.strokeStyle = this.scolor;
    this.context.fill();
    this.context.stroke();
   }
};
GameBasics();
updateTowers();

window.addEventListener("resize",()=>{
    GameBasics();
});

function GameBasics(){
    window_height = window.innerHeight;
    window_width = window.innerWidth;

    canvas.height = window_height;
    canvas.width = window_width;

    ctx.fillStyle = "green";
    rows = Math.ceil(window_height/200);
    columns = Math.ceil(window_width/200);
    console.log("Rows : ",rows);
    console.log("Columns : ",columns);
    Basei = Math.floor(Math.random()*(rows));
    Basej = Math.floor(Math.random()*(columns));
    console.log(Basei,Basej);
    DrawRect();
    SpawnKeys();
    Towerangles();
    DrawTowers();
}
function DrawRect(){
    for(let i=0;i<rows;i++){
        ctx.fillStyle='green';
        ctx.fillRect(0,i*200+150,window_width,2);
    for(let j=0;j<columns;j++){
        if(Basei == i && Basej == j){
            
            ctx.fillStyle = "cornflowerblue";
        }
        else{
            ctx.fillStyle ='green';
        }
        ctx.fillRect(j*200-25,i*200-25,150,150);
        DrawBuilding(j*200-25,i*200-25);
        if(Basei == i && Basej==j){
            let tempcircle = new Circle(ctx,j*200+50,i*200+50,16,"blue","blue",0,Math.PI*2);
            tempcircle.drawCircle();
        }
    }
    if(i){
        ctx.fillStyle = "green";
        for(let j=0;j<columns;j++)
        ctx.fillRect(j*200+150,0,2,window_height);
    }
}
}
function DrawBuilding(x,y){
    ctx.fillStyle = 'black';
    for(let k=0;k<6;k++){
        const X = Math.floor(Math.random()*(81)+x+10);
        const Y = Math.floor(Math.random()*(81)+y+10);
        ctx.fillRect(X,Y,50,50);
    }
    ctx.fillStyle ="green";
}
function SpawnKeys(){
    const keys = rows*columns/2;
   for(let i=0;i<keys;i++){
    const X = Math.floor(Math.random()*(window_width-20)+20);
    const Y = Math.floor(Math.random()*(window_height-20)+20);
    let tempcircle = new Circle(ctx,X,Y,8,"crimson","crimson",0,Math.PI*2);
    tempcircle.drawCircle();
   }
}
function Towerangles(){
    stangles = [];
    for (let i= 0; i <rows;i++) {
        stangles[i] = [];
        for (let j= 0; j <columns;j++) {
            stangles[i][j] = Math.random()*(2* Math.PI);
        }
    }
}
function DrawTowers(){
    let towercvs = document.getElementById("tower");
    let towerctx = towercvs.getContext("2d");

    towercvs.height = window_height;
    towercvs.width = window_width;
    
    for(let i=0;i<rows;i++){
        for(let j=0;j<columns;j++){
            let startangle = stangles[i][j];
            if(Basei == i && Basej==j ){

            }
            else{
                let tempcircle = new Circle(towerctx,j*200+50,i*200+50,125,"rgba(218, 125, 125, 0.2)","red",startangle,Math.PI/3);
                tempcircle.drawSector();
            }
        }
    }
}
function updateTowers(){
    for(let i=0;i<rows;i++){
        for(let j=0;j<columns;j++){
            if(Basei==i && Basej == j)  continue;
            stangles[i][j] += 0.01;
            if(stangles[i][j]>2*Math.PI)  stangles[i][j]-=2*Math.PI;
        }
    }
    DrawTowers();
    requestAnimationFrame(updateTowers);
}