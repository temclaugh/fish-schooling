var lastMouseX = 0;
var lastMouseY = 0;
var loader = new THREE.ColladaLoader();
var boids = [];
var boidsLoaded = false;
var skyLoaded = false;

function draw3D()  {
  var controls;

  function animate() {
    requestAnimationFrame(animate);
    if (!skyLoaded || !boidsLoaded) return;

    for (var i = boids.length - 1; i >= 0; i--) {
        boids[i].translateY(-.1);
    };

    renderer.render(scene, camera);
    //camera.rotateY(Math.PI/1720);
    //camera.translateX(Math.PI/180);

    // if (controls.moveForward) {
    //   console.log("moving forward");
    //   camera.translateZ(-Math.PI/180);
    // }

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
      boids[idx].rotation.x = -Math.PI/2;
      boids[idx].rotation.y = (-Math.PI/2 * Math.random()) + Math.PI/4;
      boids[idx].rotation.z = (-Math.PI/2 * Math.random()) + Math.PI/4;
      boids[idx].position.x = ((Math.random() * 40.0) - 20);
      boids[idx].position.y = ((Math.random() * 40.0) - 20);
      boids[idx].position.z = ((Math.random() * 40.0) - 20);
      boids[idx].x = boids[idx].position.x;
      boids[idx].y = boids[idx].position.y;
      boids[idx].z = boids[idx].position.z;
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
  var scale = .7;
  renderer.setSize(scale * 1920, scale * 900);
  renderer.setClearColor(0x000000, 1);
  renderer.shadowMapEnabled = true;
  div.appendChild( renderer.domElement );
  animate();

}
