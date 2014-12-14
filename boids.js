var numBoids = 20;
var attractionRadius = 1000.0;
var repulsionRadius = attractionRadius / 10;

var p = function (x) { console.log(x); };

function vectorLength(v) {
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2) + Math.pow(v.z, 2));
}

function normalize(v) {
  var len = vectorLength(v);
  return {x: v.x/len, y: v.y/len, z: v.z/len};
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2));
}

function initTree(boids) {
  boids = boids.map(function (boid) {

    var boid_pos = new THREE.Vector3(boid.position.x, boid.position.y, boid.position.z);
    boid.localToWorld(boid_pos);

    boid.x = boid_pos.x;
    boid.y = boid_pos.y;
    boid.z = boid_pos.z;
    return boid;

  });
  return new kdTree(boids, distance, ["x", "y", "z"]);
}

function getAlignment(boid, neighbors, limit) {
  var alignment = {x: 0, y: 0, z: 0};
  for (i in neighbors) {
    neighbor = neighbors[i][0];
    if (neighbor == boid || distance(neighbor, boid) > limit) {
      continue;
    }
    alignment = {
      x: alignment.x + neighbor.rotation.x,
      y: alignment.y + neighbor.rotation.y,
      z: alignment.z + neighbor.rotation.z,
    };
  }
  var n = neighbors.length - 1;
  alignment = {x: alignment.x / n, y: alignment.y / n, z: alignment.z / n, };
  return alignment;
}

function getSeparation(boid, neighbors, mul) {
  var separation = getAlignment(boid, neighbors, repulsionRadius);
  return {x: -1 * separation.x, y: -1 * separation.y, z: -1 * separation.z};
}

function getCohesion(boid, neighbors, mul) {
  var cohesion = {x: 0, y: 0, z: 0};

  for (j in neighbors) {
    neighbor = neighbors[j][0];
    if (neighbor == boid) {
      continue;
    }
    cohesion = {
      x: cohesion.x + neighbor.position.x,
      y: cohesion.y + neighbor.position.y,
      z: cohesion.z + neighbor.position.z,
    };
  }
  var n = neighbors.length - 1;
  cohesion = {
    x: (cohesion.x) / n,
    y: (cohesion.y) / n,
    z: (cohesion.z) / n,
  };

  var dummyBoid = new THREE.Object3D();
  dummyBoid.position.x = boid.position.x;
  dummyBoid.position.y = boid.position.y;
  dummyBoid.position.z = boid.position.z;
  dummyBoid.lookAt(new THREE.Vector3(cohesion.x, cohesion.y, cohesion.z), boid.up);
  return {
    x: dummyBoid.rotation.x,
    y: dummyBoid.rotation.y,
    z: dummyBoid.rotation.z,
  }
}

function nextGeneration(boids) {
  var boidTree = initTree(boids);
  var newBoids = [];
  for (i in boids) {

    var boid = boids[i];
    var neighbors = boidTree.nearest(boid, numBoids, attractionRadius);

    if (neighbors.length == 1) {
      newBoids.push({
        x: boid.rotation.x,
        y: boid.rotation.y,
        z: boid.rotation.z,
      });
      continue;
    }

    // var alignment = boid.rotation;
    var alignment = getAlignment(boid, neighbors, attractionRadius);
    var cohesion = getCohesion(boid, neighbors, 1);
    var separation = getSeparation(boid, neighbors, .01);
    newBoids.push({
      x: (boid.rotation.x + cohesion.x + alignment.x)/3,
      y: (boid.rotation.y + cohesion.y + alignment.y)/3,
      z: (boid.rotation.z + cohesion.z + alignment.z)/3,
    });
  };

  for (i in newBoids) {
    boids[i].rotation.x = newBoids[i].x;
    boids[i].rotation.y = newBoids[i].y;
    boids[i].rotation.z = newBoids[i].z;
  }
}
