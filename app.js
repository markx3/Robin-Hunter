/// <reference path="../lib/phaser.d.ts"/>
var Robin = /** @class */ (function () {
    function Robin(game) {
        this.game = game;
        this.bird = this.game.add.sprite(0, 0, "robin");
        this.bird.game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        this.bird.scale.setMagnitude(0.4);
        this.bird.anchor.setTo(0.5, 0.5);
        this.bird.body.setSize(80, 45, 100, 130);
        this.bird.body.position.set(this.bird.position.x, this.bird.position.y);
        this.bird.animations.add("fly");
        this.bird.play("fly", 30, true);
        this.bird.position.set(this.game.world.width + 100, this.game.world.randomY);
        this.game.physics.arcade.accelerateToXY(this.bird, 0, this.bird.position.y, 50);
        this.bird.outOfBoundsKill = true;
    }
    return Robin;
}());
var Jet = /** @class */ (function () {
    function Jet(game) {
        this.game = game;
        this.jet = this.game.add.sprite(0, 0, "jet");
        this.jet.scale.setMagnitude(0.6);
        this.jet.anchor.add(0.5, 0.5);
        this.jet.position.x = 0;
        this.jet.scale.x *= -1;
        this.jet.position.y = this.game.world.centerY;
        this.game.physics.enable(this.jet, Phaser.Physics.ARCADE);
        this.jet.body.collideWorldBounds = true;
        this.jet.body.setSize(200, 100, 100, 100);
    }
    Jet.prototype.shoot = function () {
        return new Shot(this.game, this.jet);
    };
    return Jet;
}());
var Shot = /** @class */ (function () {
    function Shot(game, jet) {
        this.game = game;
        this.shot = this.game.add.sprite(jet.position.x + 25, jet.position.y + 20, "particle1");
        this.game.physics.enable(this.shot, Phaser.Physics.ARCADE);
        this.shot.scale.setMagnitude(0.3);
        this.shot.body.setSize(30, 30, 120, 45);
        this.shot.anchor.set(0.5, 0.5);
        this.game.physics.arcade.accelerateToXY(this.shot, this.game.width, this.shot.position.y, 10000);
        this.shot.outOfBoundsKill = true;
    }
    return Shot;
}());
var SimpleGame = /** @class */ (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { create: this.create, preload: this.preload, update: this.update, render: this.render });
    }
    SimpleGame.prototype.preload = function () {
        this.game.load.image("background", "images/sky.png");
        this.game.load.image("jet", "images/plane.png");
        this.game.load.image("particle1", "images/particle1.png");
        this.game.load.image("particle2", "images/particle2.png");
        this.game.load.image("particle3", "images/particle3.png");
        this.game.load.spritesheet("robin", "images/robin.png", 240, 314, 22);
    };
    SimpleGame.prototype.update = function () {
        var _this = this;
        var rnd = Math.floor(Math.random() * 100) + 1;
        if (rnd < 3)
            this.robinGroup.add(new Robin(this.game).bird);
        this.game.input.pointer1.reset();
        if (this.cursors.down.isDown)
            this.jet.jet.body.velocity.y += 20;
        if (this.cursors.up.isDown)
            this.jet.jet.body.velocity.y -= 20;
        if (this.cursors.left.isDown)
            this.jet.jet.body.velocity.x -= 20;
        if (this.cursors.right.isDown)
            this.jet.jet.body.velocity.x += 20;
        this.game.physics.arcade.overlap(this.shotGroup, this.robinGroup, function (obj1, obj2) {
            var emitter = null;
            emitter = _this.game.add.emitter(obj2.position.x, obj2.position.y, 5);
            emitter.makeParticles('particle3', 1, 5, false, false);
            emitter.setScale(0.3, 0.3, 0.3, 0.3);
            emitter.explode(10000000, 20);
            _this.score += 10;
            _this.scoreText.text = ("Score: ").concat(_this.score.toString());
            _this.shotGroup.remove(obj1);
            _this.robinGroup.remove(obj2);
            obj1.kill();
            obj2.kill();
        }, null, this);
        this.game.physics.arcade.collide(this.robinGroup, this.game.world.bounds, function () {
            _this.score -= 5;
            _this.scoreText.text = ("Score: ").concat(_this.score.toString());
        }, null, this);
        this.robinGroup.forEach(function (robin) {
            if (robin.position.x < 0) {
                _this.score -= 5;
                _this.scoreText.text = ("Score: ").concat(_this.score.toString());
                _this.robinGroup.remove(robin);
                robin.kill();
            }
        }, this);
    };
    SimpleGame.prototype.render = function () {
        // Only used for debug purposes.
        // this.shotGroup.forEach((shot) => {
        //     this.game.debug.body(shot);
        // }, this);
        // this.robinGroup.forEach((robin) => {
        //     this.game.debug.body(robin);
        // }, this);
        // this.game.debug.body(this.jet.jet);
    };
    SimpleGame.prototype.create = function () {
        this.background = this.game.add.sprite(0, 0, "background");
        this.jet = new Jet(this.game);
        this.robinGroup = this.game.add.group();
        this.shotGroup = this.game.add.group();
        this.score = 0;
        this.shotCounter = 0;
        this.scoreText = this.game.add.text(0, 0, "Score: ".concat(this.score.toString()), {
            font: "30px Arial", fill: "#ff0000", align: "center"
        });
        this.game.physics.arcade.gravity.y = 0;
        this.game.physics.arcade.gravity.x = 0;
        this.SPACE = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.SPACE.onDown.add(SimpleGame.prototype.spaceHit, this);
        this.game.input.pointer1.addClickTrampoline("shoot", this.pointerHandler, this);
        this.cursors = this.game.input.keyboard.createCursorKeys();
    };
    SimpleGame.prototype.pointerHandler = function () {
        this.jet.jet.position.set(this.game.input.pointer1.x, this.game.input.pointer1.y - 200);
        this.shotCounter++;
    };
    SimpleGame.prototype.spaceHit = function () {
        this.shotGroup.add(this.jet.shoot().shot);
    };
    return SimpleGame;
}());
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=app.js.map