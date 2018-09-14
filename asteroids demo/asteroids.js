//vec2d.js ...........................................................

var Vec2D = (function() {
	//exposed methods:

	var create = function(x, y) {
		var obj = Object.create(def);
		obj.setXY(x, y);

		return obj;
	};

	//Vec2D definition:

	var def = {
		_x: 1,
		_y: 0,

		getX: function() {
			return this._x;
		},

		setX: function(value) {
			this._x = value;
		},

		getY: function() {
			return this._y;
		},

		setY: function(value) {
			this._y = value;
		},

		setXY: function(x, y) {
			this._x = x;
			this._y = y;
		},

		getLength: function() {
			return Math.sqrt(this._x * this._x + this._y * this._y);
		},

		setLength: function(length) {
			var angle = this.getAngle();
			this._x = Math.cos(angle) * length;
			this._y = Math.sin(angle) * length;
		},

		getAngle: function() {
			return Math.atan2(this._y, this._x);
		},

		setAngle: function(angle) {
			var length = this.getLength();
			this._x = Math.cos(angle) * length;
			this._y = Math.sin(angle) * length;
		},

		add: function(vector) {
			this._x += vector.getX();
			this._y += vector.getY();
		},

		sub: function(vector) {
			this._x -= vector.getX();
			this._y -= vector.getY();
		},

		mul: function(value) {
			this._x *= value;
			this._y *= value;
		},

		div: function(value) {
			this._x /= value;
			this._y /= value;
		}
	};

	return { create: create };
})();

//ship.js ...........................................................

var Ship = (function() {
	//exposed methods:

	var create = function(x, y, ref) {
		var obj = Object.create(def);
		obj.ref = ref;
		obj.angle = 0;
		obj.pos = Vec2D.create(x, y);
		obj.vel = Vec2D.create(0, 0);
		obj.thrust = Vec2D.create(0, 0);
		obj.idle = false;
		obj.radius = 8;
		obj.idleDelay = 0;

		return obj;
	};

	//Ship definition:

	var def = {
		angle: null,
		pos: null,
		vel: null,
		thrust: null,
		ref: null,
		bulletDelay: null,
		idle: null,
		radius: null,

		update: function() {
			this.vel.add(this.thrust);
			this.pos.add(this.vel);

			if (this.vel.getLength() > 5) this.vel.setLength(5);

			++this.bulletDelay;

			if (this.idle) {
				if (++this.idleDelay > 120) {
					this.idleDelay = 0;
					this.idle = false;

					// this.ref.resetGame();
				}
			}
		},

		shoot: function() {
			if (this.bulletDelay > 8) {
				this.ref.generateShot();
				this.bulletDelay = 0;
			}
		}
	};

	return { create: create };
})();

//canvas-asteroids.js ...........................................................

//common vars
var canvas;
var context;
var screenWidth;
var screenHeight;
var doublePI = Math.PI * 2;

//game vars
var ship;

//keyboard vars
var keyLeft = false;
var keyUp = false;
var keyRight = false;
var keyDown = false;
var keySpace = false;

window.getAnimationFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 16.6);
	};

window.onload = function() {
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');

	window.onresize();

	keyboardInit();
	shipInit();

	loop();
};

window.onresize = function() {
	if (!canvas) return;

	screenWidth = canvas.clientWidth;
	screenHeight = canvas.clientHeight;

	canvas.width = screenWidth;
	canvas.height = screenHeight;
};

function keyboardInit() {
	window.onkeydown = function(e) {
		switch (e.keyCode) {
			//key A or LEFT
			case 65:
			case 37:
				keyLeft = true;

				break;

			//key W or UP
			case 87:
			case 38:
				keyUp = true;

				break;

			//key D or RIGHT
			case 68:
			case 39:
				keyRight = true;

				break;

			//key S or DOWN
			case 83:
			case 40:
				keyDown = true;

				break;

			//key Space
			case 32:
			case 75:
				keySpace = true;

				break;
		}

		e.preventDefault();
	};

	window.onkeyup = function(e) {
		switch (e.keyCode) {
			//key A or LEFT
			case 65:
			case 37:
				keyLeft = false;

				break;

			//key W or UP
			case 87:
			case 38:
				keyUp = false;

				break;

			//key D or RIGHT
			case 68:
			case 39:
				keyRight = false;

				break;

			//key S or DOWN
			case 83:
			case 40:
				keyDown = false;

				break;

			//key Space
			case 75:
			case 32:
				keySpace = false;

				break;
		}

		e.preventDefault();
	};
}

function shipInit() {
	ship = Ship.create(screenWidth >> 1, screenHeight >> 1, this);
}

function loop() {
	updateShip();

	render();

	getAnimationFrame(loop);
}

function updateShip() {
	ship.update();

	if (ship.idle) return;

	if (keyLeft) ship.angle -= 0.1;
	if (keyRight) ship.angle += 0.1;

	if (keyUp) {
		ship.thrust.setLength(0.1);
		ship.thrust.setAngle(ship.angle);
	} else {
		ship.vel.mul(0.94);
		ship.thrust.setLength(0);
	}

	if (ship.pos.getX() > screenWidth) ship.pos.setX(0);
	else if (ship.pos.getX() < 0) ship.pos.setX(screenWidth);

	if (ship.pos.getY() > screenHeight) ship.pos.setY(0);
	else if (ship.pos.getY() < 0) ship.pos.setY(screenHeight);
}

function render() {
	context.fillStyle = '#262626';
	context.globalAlpha = 0.4;
	context.fillRect(0, 0, screenWidth, screenHeight);
	context.globalAlpha = 1;

	renderShip();
}

function renderShip() {
	if (ship.idle) return;

	context.save();
	context.translate(ship.pos.getX() >> 0, ship.pos.getY() >> 0);
	context.rotate(ship.angle);

	context.strokeStyle = '#FFF';
	context.lineWidth = Math.random() > 0.9 ? 2 : 1;
	context.beginPath();
	context.moveTo(10, 0);
	context.lineTo(-10, -10);
	context.lineTo(-10, 10);
	context.lineTo(10, 0);
	context.stroke();
	context.closePath();

	context.restore();
}
