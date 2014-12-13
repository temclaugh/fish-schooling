var numBoids = 200;
var attractionRadius = 20.0;
var repulsionRadius = attractionRadius / 10;
var p = function (x) { console.log(x); };

function vectorLength(v) {
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2) + Math.pow(v.z, 2));
}

function normalize(v) {
  var len = vectorLength(v);
  return {x: v.x/len, y: v.y/len, z: v.z/len};
}

function constructBoids(count) {

  function randInt() { return Math.floor(200 * Math.random() - 100); }

  var xs = [59, 77, 80, 88, 48, -86, 93, -72, 100, 51, 84, -38, 73, -37, 57, 96, -100, -55, 88, 73, 56, -82, 98, 29, 75, 14, -20, -87, -30, 68, -78, -90, -87, 88, 35, 19, 66, 83, -61, -84, 21, 64, 78, -79, 42, 21, 2, -34, 58, -10, 92, -52, -62, -45, -75, -17, -82, -74, 60, 21, -38, -85, 40, -36, -23, 100, -5, 10, 58, -50, -27, -5, 52, 60, -73, -75, 69, 41, -51, 71, 27, -38, 8, -43, -9, 47, -44, -1, 10, -44, -18, -13, 37, -43, -73, 41, -35, 34, 87, -43];
  var ys = [37, 13, 76, 31, -14, 67, 35, 17, -25, -16, -44, 91, -19, -38, -70, -38, 57, -93, -88, -58, 72, -93, 97, 82, -43, -24, -62, -31, -43, 40, -83, 64, 40, -32, -77, -9, -61, 11, 50, -2, -59, -34, -9, 86, -96, -27, -92, -74, 33, 45, -49, 16, -37, -55, -23, 85, -3, -64, 33, 22, 13, 5, 14, 98, 61, -86, -92, -16, 50, -41, -30, -62, -71, 10, 41, 58, -40, 40, 69, -46, 29, -43, 78, 19, 34, -69, 30, 39, 48, 65, -24, 44, -51, -99, 33, 32, -93, 87, 89, 12];
  var zs = [94, -9, -79, -17, 76, -56, 91, 19, 54, 15, 36, -17, -4, -71, -49, -61, 68, 69, 44, -13, -13, 14, 15, -12, 66, -88, -61, -98, 95, -41, -54, 95, 49, 54, -34, 98, -53, -88, 14, 83, -55, 37, 94, 46, 24, -97, -37, -91, -12, 29, -34, -94, -83, -87, 97, 19, -79, -70, 77, 32, 40, 21, 99, 82, 4, -12, 17, -16, 88, 71, -31, 86, 79, 89, -12, -35, -16, 30, 85, -58, 100, -8, -74, 69, -4, -65, -85, 16, 42, -100, 87, -54, 21, 60, 75, -71, 37, 63, -37, 44];

  var boids = [];

  var randDirection = function() {
    var rand = function () { return 2 * Math.random() - 1; };
    var v = {x: rand(), y: rand(), z: rand()};
    return normalize(v);
  };

  for (var i = 0; i < count; ++i) {
    var boid = {
      position: {x: randInt(), y: randInt(), z: randInt()},
      rotation: randDirection(),
    };
    boids.push(boid);
  }

  boids = boids.map(function (x) {
    x.x = x.position.x;
    x.y = x.position.y;
    x.z = x.position.z;
    return x;
  });

  return boids;
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2));
}

function initTree(boids) {
  return new kdTree(boids, distance, ["x", "y", "z"]);
}

function nextGeneration(boids) {
  for (i in boids) {
    var boid = boids[i];
    var newBoids = [];
    var neighbors = boidTree.nearest(boid, numBoids, attractionRadius);
    if (neighbors.length == 1) {
      newBoids.push(boid);
      continue
    }

    var cohesion = {x: 0, y: 0, z: 0};
    var alignment = {x: 0, y: 0, z: 0};
    var separation = {x: 0, y: 0, z: 0};
    for (j in neighbors) {
      neighbor = neighbors[j][0];

      if (neighbor == boid) {
        continue;
      }

      cohesion.x += neighbor.position.x;
      cohesion.y += neighbor.position.y;
      cohesion.z += neighbor.position.z;

      alignment.x += neighbor.rotation.x;
      alignment.y += neighbor.rotation.y;
      alignment.z += neighbor.rotation.z;

      if (distance(boid, neighbor) < repulsionRadius) {
        separation.x += neighbor.position.x - boid.position.x;
        separation.y += neighbor.position.y - boid.position.y;
        separation.z += neighbor.position.z - boid.position.z;
      }
    }


    var n = neighbors.length - 1;
    cohesion = {
      x: cohesion.x/n,
      y: cohesion.y/n,
      z: cohesion.z/n,
    };
    alignment = {
      x: alignment.x/n,
      y: alignment.y/n,
      z: alignment.z/n,
    };
    separation = {
      x: separation.x/n - boid.position.x,
      y: separation.y/n - boid.position.y,
      z: separation.z/n - boid.position.z,
    };
    p([cohesion, alignment, separation]);

    cohesion = normalize(cohesion);
    alignment = normalize(alignment);
    separation = normalize(separation);


    newDirection = {
      x: (cohesion.x + alignment.x + separation.x)/3,
      y: (cohesion.y + alignment.y + separation.y)/3,
      z: (cohesion.z + alignment.z + separation.z)/3,
    }
    newDirection = normalize(newDirection);
    boid.position.x = newDirection.x;
    boid.position.y = newDirection.y;
    boid.position.z = newDirection.z;

    newBoids.push(boid)
  }
  return newBoids;
}

var boids = constructBoids(numBoids);

var boidTree = initTree(boids);

var t0 = new Date();
boids = nextGeneration(boids);
initTree(boids);
var t1 = new Date();
p(t1 - t0);
