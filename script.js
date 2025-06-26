let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let towercvs = document.getElementById("tower");
let towerctx = towercvs.getContext("2d");

let playercvs = document.getElementById("player");
let playerctx = playercvs.getContext("2d");

let keycvs = document.getElementById("keycanvas");
let keyctx = keycvs.getContext('2d');

let buildingcvs = document.getElementById("buildingcanvas");
let buildingctx = buildingcvs.getContext("2d");

const keypershard = 3;
let towerAnimationId = null;
let playerhealth = 100;
let systemhealth = 1000;
let ownedkeys = 0;
let ShardsDelivered = 0;
let EncryptedShards = 10;
let DecryptedShards = 0;
let rows,columns,Basei,Basej,window_height,window_width;
let Hubi, Hubj;
let stangles= [];
let keypositions = [];
let buildingpos = [];
let gamePaused = false;
let gameEnded = false;

let player = {
    x: window.innerWidth/2,
    y: window.innerHeight/2,
    speed: 1
}
let boardkeys = {};
document.addEventListener("keydown",(e)=>{
   boardkeys[e.key]=true;
})
document.addEventListener("keyup",(e)=>{
    boardkeys[e.key]=false;
})

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
let bullets = [];
let mouseX = player.x, mouseY= player.y;

class Bullet {
  constructor(x, y, angle, speed = 5) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.bounces = 0;
    this.maxBounces = 5;
    this.radius = 4;
  }

  move() {
    this.x += Math.cos(this.angle)*this.speed;
    this.y += Math.sin(this.angle)*this.speed;

    if (this.x <= 0 || this.x>=window_width) {
      this.angle = Math.PI-this.angle;
      this.bounce();
    }
    if (this.y <= 0 || this.y>=window_height) {
      this.angle = -this.angle;
      this.bounce();
    }

    for(let k =buildingpos.length-1;k >=0; k--){
        let rect = buildingpos[k];
      if (
        this.x >rect.x && this.x <rect.x +50 &&
        this.y >rect.y && this.y <rect.y +50
      ) {
        rect.hp-=1;
        if(rect.hp <=0){
            buildingpos.splice(k,1);
            drawbuildings();
        }
        this.angle = this.reflect(rect);
        this.bounce();
        break;
      }
    }
    this.checkTowerHit();
  }
  bounce() {
    this.bounces++;
    this.speed *= 0.9;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y,this.radius,0,2*Math.PI);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
  }

  isDead() {
    return this.bounces >this.maxBounces || this.speed <0.5;
  }

  reflect(rect) {
    let cx = rect.x + 25;
    let cy = rect.y + 25;
    let dx = this.x - cx;
    let dy = this.y - cy;
    if (Math.abs(dx) > Math.abs(dy)) return Math.PI - this.angle;
    else return -this.angle;
  }
  checkTowerHit() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if ((i == Basei && j == Basej)||(i == Hubi && j == Hubj)) continue;
        let tx =j *200 +50;
        let ty =i *200 +50;
        let d = Math.hypot(this.x -tx,this.y -ty);
        if (d < 20) { 
          stangles[i][j] = null;
        }
      }
    }
  }
}

GameBasics();
updateTowers();
updatePosition();
mineEncryptedShards(); 
window.addEventListener("resize",()=>{
    GameBasics();
});
document.getElementById("pause").onclick = function () {
  gamePaused = !gamePaused;
  this.innerText = gamePaused ? "RESUME" : "PAUSE";

  if (!gamePaused && !gameEnded) {
    updatePosition();
    updateTowers();
    decaySystemHealth();
  }
};

document.getElementById("restart").onclick = function () {
  location.reload();
};
document.addEventListener("keydown", (e) => {
  boardkeys[e.key] = true;
  if (e.key === " ") {
    shootBullet();
  }
});
document.addEventListener("mousemove", (e) => {
  mouseX =e.clientX;
  mouseY =e.clientY;
});
function GameBasics(){

    window_height = window.innerHeight;
    window_width = window.innerWidth;
    
    canvas.height = window_height;
    canvas.width = window_width;

    towercvs.height = window_height;
    towercvs.width = window_width;
    
    playercvs.height = window_height;
    playercvs.width = window_width;

    keycvs.height = window_height;
    keycvs.width = window_width;

    buildingcvs.width = window.innerWidth;
    buildingcvs.height = window.innerHeight;

    ctx.fillStyle = "green";
    rows = Math.ceil(window_height/200);
    columns = Math.ceil(window_width/200);
    Basei = Math.floor(Math.random()*(rows));
    Basej = Math.floor(Math.random()*(columns));
    do {
    Hubi = Math.floor(Math.random()*rows);
    Hubj = Math.floor(Math.random()*columns);
    }while (Hubi == Basei && Hubj == Basej);
    DrawRect();
    SpawnKeys();
    Towerangles();
    DrawTowers();
    drawplayer();
    if(towerAnimationId != null){
        cancelAnimationFrame(towerAnimationId);
    }
    updateTowers();
    updatePosition();
    decaySystemHealth();
}
function DrawRect(){
    for(let i=0;i<rows;i++){
        ctx.fillStyle='green';
        ctx.fillRect(0,i*200+150,window_width,2);
    for(let j=0;j<columns;j++){
        if(Basei == i && Basej == j){
            
            ctx.fillStyle = "cornflowerblue";
        }
        else if(Hubi == i && Hubj == j){
            ctx.fillStyle='orange';
        }
        else{
            ctx.fillStyle ='green';
        }
        ctx.fillRect(j*200-25,i*200-25,150,150);
        DrawBuilding(j*200-25,i*200-25);
        if(Basei == i && Basej==j){
            let tempcircle = new Circle(ctx,j*200+50,i*200+50,20,"blue","blue",0,Math.PI*2);
            tempcircle.drawCircle();
        }
        else if (Hubi === i && Hubj === j) {
        let hubCircle = new Circle(ctx, j*200 +50, i *200 +50, 20,"gold","gold", 0, Math.PI*2);
        hubCircle.drawCircle();
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
    for(let k=0;k<6;k++){
        const X = Math.floor(Math.random()*(81)+x+10);
        const Y = Math.floor(Math.random()*(81)+y+10);
        buildingpos.push({ x: X, y: Y, hp:5});
    }
    drawbuildings();
}
function drawbuildings(){
  buildingctx.clearRect(0, 0, window_width, window_height);
  for(let b of buildingpos) {
    buildingctx.fillStyle = "black";
    buildingctx.fillRect(b.x, b.y, 50, 50);
  }
}
function SpawnKeys(){
    const keycount = rows*columns/2;
   for(let i=0;i<keycount;i++){
    const X = Math.floor(Math.random()*(window_width-20)+20);
    const Y = Math.floor(Math.random()*(window_height-20)+20);
    keypositions.push([X,Y]);
   }
   updateKeys();
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
let visionAngle = Math.PI / 3;
    for(let i=0;i<rows;i++){
        for(let j=0;j<columns;j++){
            let startangle = stangles[i][j];
            let centeredStart = startangle - visionAngle / 2;
            if((Basei == i && Basej==j) || (Hubi == i && Hubj == j))  continue;
            if (stangles[i][j] == null) continue; 
            let tempcircle = new Circle(towerctx,j*200+50,i*200+50,125,"rgba(218, 125, 125, 0.2)","red",centeredStart,visionAngle);
            tempcircle.drawSector();
        }
    }
}
function updateTowers(){
    if (gamePaused || gameEnded) return;

    towerctx.clearRect(0,0,window_width,window_height);
    for(let i=0;i<rows;i++){
        for(let j=0;j<columns;j++){
            if(Basei==i && Basej == j)  continue;
            if(stangles[i][j] != null) stangles[i][j]+=0.0075;
            if(stangles[i][j]>2*Math.PI)  stangles[i][j]-=2*Math.PI;
        }
    }
    DrawTowers();
    towerAnimationId = requestAnimationFrame(updateTowers);
}
function drawplayer(){
    playerctx.clearRect(0,0,playercvs.width,playercvs.height);
    let playercircle = new Circle(playerctx,player.x,player.y,15,"cyan","cyan",0,Math.PI*2);
    playercircle.drawCircle();

    let basecircle = new Circle(playerctx,Basej*200+50,Basei*200+50,20,"blue","blue",0,Math.PI*2);
    basecircle.drawCircle();

    let hubcircle = new Circle(playerctx,Hubj*200+50,Hubi*200+50,20,"gold","gold",0,Math.PI*2);
    hubcircle.drawCircle();
}
function updatePosition(){
    if (gamePaused || gameEnded) return;

    let prevX = player.x;
    let prevY = player.y;

    if(boardkeys["ArrowUp"] || boardkeys["w"])  player.y-=player.speed;
    if(boardkeys["ArrowDown"] || boardkeys["s"])  player.y+=player.speed;
    if(boardkeys["ArrowLeft"] || boardkeys["a"])  player.x-=player.speed;
    if(boardkeys["ArrowRight"] || boardkeys["d"])  player.x+=player.speed;

    player.x= Math.max(0, Math.min(window_width, player.x));
    player.y= Math.max(0, Math.min(window_height, player.y));

    for (let rect of buildingpos) {
    if (
        player.x +15 > rect.x && player.x -15 < rect.x + 50 &&
        player.y +15 > rect.y && player.y -15 < rect.y + 50
    ) {
        player.x = prevX;
        player.y = prevY;
        break;
    }
}

    checkKeyCollection();
    updateKeys();  
    if (keypositions.length < 5) {
    spawnNewKeys(10);
    }  
    drawplayer(); 
    updateBullets();       
    updateInfo();
    checkTowerDetection();        
    checknearcentralhub();
    checkShardDelivery();
    checkGameEnd();

   if (!gamePaused &&!gameEnded) requestAnimationFrame(updatePosition);
}
function updateInfo(){
    document.getElementById("plhealth").innerHTML = `${playerhealth.toFixed(1)}`;
    document.getElementById("syshealth").innerHTML = `${systemhealth.toFixed(1)}`;
    document.getElementById("keys").innerHTML =`${ownedkeys}`;
    document.getElementById("decshards").innerHTML = `${DecryptedShards}`;
    document.getElementById("encshards").innerHTML = `${EncryptedShards}`;
    document.getElementById("delshards").innerHTML = `${ShardsDelivered}`;
    const highScore = localStorage.getItem("highScore") || 0;
    document.getElementById("highscore").innerHTML = `${highScore}`;
}
function decaySystemHealth() {
    if (gamePaused || gameEnded) return;
    systemhealth -= 2;
    if (systemhealth < 0) systemhealth = 0;
    setTimeout(decaySystemHealth, 1000);
}
function mineEncryptedShards() {
  EncryptedShards++;
  setTimeout(mineEncryptedShards, 10000);
}
function checkKeyCollection() {
    for (let i =keypositions.length-1;i>= 0;i--) {
        let [x,y] = keypositions[i];
        let dx =player.x - x;
        let dy =player.y - y;
        if (Math.sqrt(dx*dx +dy*dy) < 20) {
            ownedkeys++;
            keypositions.splice(i, 1);
        }
    }
}
function updateKeys() {
   keyctx.clearRect(0,0,keycvs.width,keycvs.height); 
  for (let [x,y] of keypositions) {
  let tempcircle = new Circle(keyctx,x,y,8,"crimson","crimson",0,Math.PI*2);
  tempcircle.drawCircle();
 }
}
function checknearcentralhub(){
    const dx = player.x- (Hubj*200+50);
    const dy = player.y- (Hubi*200+50);
    const nearHub= Math.sqrt(dx*dx + dy*dy)< 30;
    if(nearHub && EncryptedShards > 0 && ownedkeys >= keypershard) {
        EncryptedShards--;
        ownedkeys -= keypershard;
        DecryptedShards++;
    }
}
function checkShardDelivery() {
    const baseX =Basej*200 +50;
    const baseY =Basei *200 +50;
    const dx = player.x- baseX;
    const dy = player.y- baseY;
    const nearBase =Math.sqrt(dx*dx + dy*dy)<30;

    if (nearBase && DecryptedShards > 0) {
        DecryptedShards--;
        ShardsDelivered++;
        systemhealth = Math.min(1000, systemhealth + 100);
        
    const storedHigh = parseInt(localStorage.getItem("highScore") || "0");
    if (ShardsDelivered > storedHigh) {
      localStorage.setItem("highScore", ShardsDelivered);
      document.getElementById("highscore").innerText = ShardsDelivered;
    }
    }
}
function checkTowerDetection() {
    const towerRange = 125;
    const visionAngle = Math.PI / 3;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if ((i == Basei && j == Basej) || (i == Hubi && j == Hubj)) continue;

            const towerX = j * 200 + 50;
            const towerY = i * 200 + 50;
            const dx = player.x - towerX;
            const dy = player.y - towerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < towerRange) {
                const angleToPlayer = Math.atan2(dy, dx);
                const towerAngle = stangles[i][j];
                const halfVision = visionAngle / 2;

                let a = angleToPlayer;
                let b = ((towerAngle + Math.PI) % (2 * Math.PI)) - Math.PI;

                let angleDiff = a - b;
                if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

                if (Math.abs(angleDiff) <= halfVision) {
                    playerhealth -= 0.01;
                    if (playerhealth < 0) playerhealth = 0;
                    return;
                }
            }
        }
    }
}
function shootBullet(){
  const dx =mouseX -player.x;
  const dy = mouseY -player.y;
  const angle =Math.atan2(dy, dx);
  const bullet = new Bullet(player.x,player.y,angle);
  bullets.push(bullet);
}

function updateBullets() {
  for (let i =bullets.length-1; i >=0;i--) {
    const b = bullets[i];
    b.move();
    b.draw(playerctx);
    if (b.isDead()) bullets.splice(i, 1);
  }
}
function spawnNewKeys(count){
    for(let i =0;i<count;i++){
        const X = Math.floor(Math.random()*(window_width -20)+20);
        const Y = Math.floor(Math.random()*(window_height -20)+20);
        keypositions.push([X, Y]);
    }
}
function checkGameEnd() {
  if (gameEnded) return;

  if (playerhealth <= 0 || systemhealth <= 0) {
    gameEnded = true;
    gamePaused = true;
    cancelAnimationFrame(towerAnimationId);

    const storedHigh = parseInt(localStorage.getItem("highScore")||"0");
    if (ShardsDelivered > storedHigh) {
      localStorage.setItem("highScore", ShardsDelivered);
      alert("New High Score! Game Over!");
    } else {
      alert("Game Over!");
    }
    return;
  }
}
