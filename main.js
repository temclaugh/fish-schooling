var lastMouseX = 0;
var lastMouseY = 0;
var loader = new THREE.ColladaLoader();
var boids = [];
var boidsLoaded = false;
var skyLoaded = false;
var vecLenMax = .05;
var wallOffset = .01;
var yMin = -78;
var yMax = 92;
var queueBound = 100;

var xMin = -85;
var xMax = 85;

var zMin = -81;
var zMax = 89;

function draw3D()  {
  var controls;

  function animate() {
    scene.updateMatrixWorld();
    requestAnimationFrame(animate);
    if (!skyLoaded || !boidsLoaded) return;

    for (var i = boids.length - 1; i >= 0; i--) {
        if (vectorLength(boids[i].vel) > vecLenMax) {
            var v = normalize(boids[i].vel);
            boids[i].vel = new THREE.Vector3(vecLenMax*v.x, vecLenMax*v.y, vecLenMax*v.z);
        }

        boids[i].velqueue.push(boids[i].vel);
        if (boids[i].velqueue.length > queueBound) {
          boids[i].velqueue.shift();
        }
        // else if (vectorLength(boids[i].vel) <= .001) {
        //     boids[i].vel = new THREE.Vector3(Math.random() * .01 - .005,Math.random() * .01 - .005,Math.random() * .01 - .005);
        // }

        var boid_pos = new THREE.Vector3(boids[i].position.x, boids[i].position.y, boids[i].position.z);

            var xcoord = 0;
            var ycoord = 0;
            var zcoord = 0;

            for (var j = boids[i].velqueue.length - 1; j >= 0; j--) {
              xcoord += boids[i].velqueue[j].x;
              ycoord += boids[i].velqueue[j].y;
              zcoord += boids[i].velqueue[j].z;
            };

          var look_at = new THREE.Vector3(
            boid_pos.x + xcoord,
            boid_pos.y + ycoord,
            boid_pos.z + zcoord
            )

          boids[i].position.x += xcoord/(boids[i].velqueue.length/5);
          boids[i].position.y += ycoord/(boids[i].velqueue.length/5);
          boids[i].position.z += zcoord/(boids[i].velqueue.length/5);

        console.log( "vel: " + boids[i].vel.x + " " + boids[i].vel.y + " " + boids[i].vel.z + "   ");

        boids[i].lookAt( look_at );
        //boids[i].lookAt( new THREE.Vector3(0,0,0) );
        boids[i].rotateX( -Math.PI/2 );


        if (boids[i].position.x > xMax) {
          boids[i].vel.x -= wallOffset;
        }
        if (boids[i].position.x < xMin) {
          boids[i].vel.x += wallOffset;
        }
        if (boids[i].position.y > yMax) {
          boids[i].vel.y -= wallOffset;
        }
        if (boids[i].position.y < yMin) {
          boids[i].vel.y += wallOffset;
        }
        if (boids[i].position.z > zMax) {
          boids[i].vel.z -= wallOffset;
        }
        if (boids[i].position.z < zMin) {
          boids[i].vel.z += wallOffset;
        }
    };

    renderer.render(scene, camera);

    controls.update(clock.getDelta());
    nextGeneration(boids);
  }

  function updateControls() {
    controls.update();
  }

  clock = new THREE.Clock();

  // loader.load('www.jombooth.com/repo/models/flying_boid.dae');
  // loader.load('www.jombooth.com/repo/models/low_poly_plane.dae');
  // loader.load('www.jombooth.com/repo/models/skyboxes.dae');

  geo = new THREE.SphereGeometry(1, 25, 25);
  var sphere = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color: 0x00ff00}));
  sphere.position.set(2.5, -1, 0);

  geo = new THREE.BoxGeometry(2,2,2);
  var cube = new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color: 0x0000ff })   );
  cube.position.set(0, 1, 0);

  var camera = new THREE.PerspectiveCamera(  45, 1024/500,0.1, 100000);
  camera.position.z = 10;
  camera.position.y = 1;

  controls = new THREE.FirstPersonControls( camera );
  controls.movementSpeed = 10;
  controls.lookSpeed = .05;
  // controls.addEventListener( 'change', updateControls );

  var boidbox = new THREE.Object3D();

  for(var i = 0; i < numBoids; i++) {
    loader.load('low-poly-plane.dae', function(result) {
      var idx = boids.length;
      boids[idx] = result.scene;
      boids[idx].position.x = ((Math.random() * 5.0) - 2.5);
      boids[idx].position.y = ((Math.random() * 5.0) - 2.5);
      boids[idx].position.z = ((Math.random() * 5.0) - 2.5);
      boids[idx].x = boids[idx].position.x;
      boids[idx].y = boids[idx].position.y;
      boids[idx].z = boids[idx].position.z;
      boids[idx].vel = {x : 0.1*Math.random()-.05, y: 0.1*Math.random()-.05, z : 0.1*Math.random()-.05};
      //boids[idx].vel = {x : 0, y: 0, z : 0 };
      boids[idx].velqueue = [];
      boidbox.add(boids[idx]);
      if (boids.length == numBoids - 1) {
        boidsLoaded = true;
      }
    });
  }

  boidbox.position.z = 0;

  geo = new THREE.PlaneGeometry(0, 0);
  var floor = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color : 0xcfcfcf}));
  floor.material.side = THREE.DoubleSide;
  floor.rotation.x = Math.PI/2;
  floor.position.y = -2;
  floor.receiveShadow = true;

  var floor_;

  loader.load('skybox2.dae', function(result) {
    floor_ = result.scene;
    floor_.rotation.x = -Math.PI;
    floor_.scale.x = floor_.scale.y = floor_.scale.z = 1;
    floor.add(floor_);
    skyLoaded = true;
  });

  var light = new THREE.DirectionalLight(0xe0e0e0);
  light.position.set(5,2,5).normalize();

  var light2 = new THREE.DirectionalLight(0xe0e0e0);
  light2.position.set(-5,-2,5).normalize();

  var light3 = new THREE.DirectionalLight(0xe0e0e0);
  light3.position.set(5,-2,-5).normalize();

  var light4 = new THREE.DirectionalLight(0xe0e0e0);
  light4.position.set(-5,2,-5).normalize();

  var scene = new THREE.Scene();
  scene.add(floor);
  scene.add(boidbox);
  scene.add(light);
  scene.add(light2);
  scene.add(light3);
  scene.add(light4);
  scene.add(new THREE.AmbientLight(0x101010));

  var div = document.getElementById("shapecanvas2");

  var renderer = new THREE.WebGLRenderer();
  var scale = .96;
  renderer.setSize(scale * window.innerWidth, scale * window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  renderer.shadowMapEnabled = false;
  div.appendChild( renderer.domElement );
  animate();

}
