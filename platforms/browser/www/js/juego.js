var app={
  inicio: function(){
    dificultad = 1;
	velocidad = 2;
	salto = 5; // Cada cuántos puntos se aumenta la dificultad
	desplazamientoCoche = 0;
	velocidadCocheMax = 200;
	umbralAceleracion = 0.8;
    puntuacion = 0;
    gasolinaMax = 15;
    gasolina = gasolinaMax;
	gasolinaIcono = '|';
	anchoCoche = 32;
	altoCoche = 64;
	anchoMoneda = 32;
	altoMoneda = 32;
	anchoBidon = 45;
	altoBidon = 64;
	monedaTime = 0;
	bidonTime = 0;
	cadenciaMoneda = 500;
	cadenciaBidon = 1200;
	consumoGasolina = 900;
	gasolinaTime = consumoGasolina;
	probabilidadMoneda = 0.6;
	probabilidadBidon = 0.7;
	offset = 50;
		
    alto  = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;
	inicioX = Math.floor((ancho/2)-(anchoCoche/2));
	inicioY = alto-altoCoche;
	
	monedas = new Array();
    
    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function(){

    function preload() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

	  game.stage.backgroundColor = '#000000';
	  game.load.image('carretera', 'assets/road.jpg');
	  game.load.image('coche', 'assets/car.png');
      game.load.image('moneda', 'assets/coin.png');
      game.load.image('bidon', 'assets/gas.png');
    }

    function create() {
	  carretera = game.add.tileSprite(0,
        offset,
        game.width,
        game.cache.getImage('carretera').height,
        'carretera'
      );
      
      coche = game.add.sprite(inicioX, inicioY, 'coche');
	  game.physics.arcade.enable(coche);
      coche.body.collideWorldBounds = true;
	  
	  monedas = game.add.group();
	  
	  bidones = game.add.group();
	  
	  for (var i = 0; i < 20; i++)
      {
        var m = monedas.create(0, 0, 'moneda');
        m.name = 'moneda' + i;
        m.exists = false;
        m.visible = false;
        m.checkWorldBounds = true;
        m.events.onOutOfBounds.add(eliminaItem, this);
		
		var b = bidones.create(0, 0, 'bidon');
        b.name = 'bidon' + i;
        b.exists = false;
		b.visible = false;
        b.checkWorldBounds = true;
        b.events.onOutOfBounds.add(eliminaItem, this);

	  }
	  
	  game.physics.arcade.enable(bidones);
	  game.physics.arcade.enable(monedas);
      
	  game.add.text(16, 16, "Puntos:", { fontSize: '24px', fill: '#ffc080' });
	  scoreText = game.add.text(106, 16, puntuacion, { fontSize: '24px', fill: '#ffffff' });
      
	  game.add.text(200, 16, "Gasolina:", { fontSize: '24px', fill: '#ffc080' });
	  gasText = game.add.text(308, 16, "", { fontSize: '24px', fill: '#00c000' });
	  pintaGasolina(gasolinaMax);
      
    }

    function update(){
	  carretera.tilePosition.y += velocidad * dificultad;
      coche.body.velocity.x = desplazamientoCoche;
	  if (game.time.now > monedaTime) {
		moneda = monedas.getFirstExists(false);
		if (moneda)
		{
			if(Math.random() > probabilidadMoneda) {
				moneda.reset(app.numeroAleatorioHasta(ancho-anchoMoneda), offset);
				moneda.body.velocity.y = velocidad * dificultad * 60;
			}
			monedaTime = game.time.now + cadenciaMoneda;
		}
	  }
	  if (game.time.now > bidonTime) {
		bidon = bidones.getFirstExists(false);
		if (bidon)
		{
			if(Math.random() > probabilidadBidon) {
				bidon.reset(app.numeroAleatorioHasta(ancho-anchoBidon), offset);
				bidon.body.velocity.y = velocidad * dificultad * 60;
			}
			bidonTime = game.time.now + cadenciaBidon;
		}
	  }
	  
	  if (game.time.now > gasolinaTime) {
		  gasolina--;
		  pintaGasolina(gasolina);
		  if(gasolina == 0) {
			  coche.visible = false;
			  monedas.visible = false;
			  bidones.visible = false;
			  game.add.text((game.world.width / 2)-80, (game.world.height / 2) - 14, "¡Fin del juego!", { fontSize: '24px', fill: '#ff0000' });
			  game.gamePaused();
		  }
		  gasolinaTime = game.time.now + consumoGasolina;
	  }
	  
	  game.physics.arcade.overlap(coche, monedas, monedaCollisionHandler, null, this);
	  game.physics.arcade.overlap(coche, bidones, bidonCollisionHandler, null, this);
    }
	
	function eliminaItem(i) {
		i.kill();
	}
	
	function monedaCollisionHandler(c, m) {
		m.kill();
		puntuacion = puntuacion+1;
		scoreText.text = puntuacion;
		dificultad = Math.floor(puntuacion/salto)+1;
	}
	
	function bidonCollisionHandler(c, b) {
		b.kill();
		gasolina = gasolinaMax;
		pintaGasolina(gasolina);
	}
	
	function pintaGasolina(g) {
		if(g < (gasolinaMax/3)) {
			gasText.addColor('#c00000', 0);
		} else if(g < (gasolinaMax/1.5)) {
			gasText.addColor('#c09000', 0);
		} else {
			gasText.addColor('#00c000', 0);
		}
		gasText.text = gasolinaIcono.repeat(g);
	}
	
    var estados = { preload: preload, create: create, update: update };
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser',estados);
  },

  numeroAleatorioHasta: function(limite){
    return Math.floor(Math.random() * limite);
  },

  vigilaSensores: function(){
    
    function onError() {
        console.log('onError!');
    }

    function onSuccess(datosAceleracion){
      app.detectaAgitacion(datosAceleracion);
      app.registraDireccion(datosAceleracion);
    }

    navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 10 });
  },

  detectaAgitacion: function(datosAceleracion){
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;

    if (agitacionX || agitacionY){
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function(){
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion){
    if(datosAceleracion.x > umbralAceleracion)
		desplazamientoCoche = (-1) * velocidadCocheMax;
	else if(datosAceleracion.x < ((-1) * umbralAceleracion))
		desplazamientoCoche = velocidadCocheMax;
	else
		desplazamientoCoche = datosAceleracion.x * (-1) * velocidadCocheMax;
  },
  
};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        app.inicio();
    }, false);
}