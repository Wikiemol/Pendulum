
window.addEventListener('load', onLoad, false);

var can = null;
var ctx = null;
var mx = 0;
var my = 0;
var startTime = 0;
var globalTime = 0;
var dt = 0;
var friction = 0.9;

function onLoad() {

    startTime = (new Date()).getTime();
    can = document.getElementById("can");
    ctx = can.getContext("2d");
    can.width = window.innerWidth;
    can.height = window.innerHeight;
    can.style.top = '0px';
    can.style.left = '0px';
    can.style.position = 'absolute';

    var length      = 600;
    var segments    = 600;
    var drawHinges  = false;
    var gravity     = 1.0;
        friction    = 0.85;
    
    var r = new Ray([can.width / 2, can.height / 2], length / segments, -Math.PI / 6);
    var pend = new Pendulum(r, gravity);
    var pendulums = [pend];
    for(var i = 1; i < segments; i++) {
        var ray = new Ray(pendulums[i - 1].ray.end, length / segments, -Math.PI/6);
        var p = new Pendulum(ray, gravity);
        pendulums.push(p);
    }

    setInterval(function() {
        dt = -globalTime;
        globalTime = ((new Date()).getTime() - startTime);
        dt += globalTime;

        ctx.clearRect(0, 0, can.width, can.height);

        //Background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, can.width, can.height);

        //Pendulum
        pendulums[0].moveTo([mx,my]);

        for(var i = 0; i < pendulums.length; i++) {
            i != 0 && pendulums[i].moveTo(pendulums[i - 1].ray.end);

            pendulums[i].update();

            if(drawHinges) {
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(pendulums[i].ray.end[0], pendulums[i].ray.end[1], 3, 3);
            }

            pendulums[i].draw();
        }
    }, 33);

    window.addEventListener('mousemove', onMove, false);
}

function onMove(evt) {
    mx = evt.x;
    my = evt.y;
}

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

function norm(v) {
    var mag = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
    return [v[0] / mag, v[1] / mag];
}

function Pendulum(ray, gravity) {
    this.ray = ray;
    this.posVel = [0, 0];
    this.posAcc = [0, 0];
    this.angularAcc = (gravity * Math.cos(ray.angle)) / (Math.PI * 6);
    this.angularVel = 0;
    this.gravity = gravity;
}

Pendulum.prototype.update = function() {
    var normVec = norm(this.ray.vector);
    var perp = this.ray.getPerpVector();
    var a = this.posAcc[0] * perp[0] + this.posAcc[1] * perp[1];

    this.angularAcc = (this.gravity * Math.cos(this.ray.angle)) / (Math.PI * 6) + 3.4 * a / (dt * dt);
    this.angularVel += this.angularAcc;
    this.angularVel *= friction;
    this.ray.setAngle(this.ray.angle + this.angularVel);
    var rayNorm = this.ray.normVec();

}

Pendulum.prototype.draw = function() {
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(this.ray.pos[0], this.ray.pos[1]);
    ctx.lineTo(this.ray.end[0], this.ray.end[1]);
    ctx.stroke();
}

Pendulum.prototype.moveTo = function(pos) {
    var prevVel = this.posVel;
    this.posVel = sub(pos, this.ray.pos);
    this.posAcc = sub(this.posVel, prevVel);
    this.ray.setPosition(pos);
}

function Ray(position, length, angle) {
    this.pos = position;
    this.vector = [length * Math.cos(angle), length * Math.sin(angle)];
    this.end = add(this.vector, this.pos);
    this.length = length;
    this.angle = angle;
}

Ray.prototype.getPerpVector = function() {
    return [this.vector[1] / this.length, -this.vector[0] / this.length];
}

Ray.prototype.setAngle = function(angle) {
    this.angle = angle;
    this.resetAngle();
}

Ray.prototype.resetAngle = function() {
    this.vector = [this.length * Math.cos(this.angle), this.length * Math.sin(this.angle)];
    this.end = add(this.vector, this.pos);
}

Ray.prototype.setEnd = function(vec) {
    this.end = vec;
    this.angle = Math.atan(vec[0], vec[1]);
}

Ray.prototype.setPosition = function(pos) {
    this.pos = pos;
    this.end = add(this.vector, this.pos);
}

Ray.prototype.normVec = function() {
    return [this.vector[0] / this.length, this.vector[1] / this.length];
}
