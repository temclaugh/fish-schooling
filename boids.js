var numBoids = 20;
var attractionRadius = 30.0;
var repulsionRadius = 15;

var p = function (x) { console.log(x); };

function boidEquals(b1,b2) {
  return (b1.position.x == b2.position.x) && (b1.position.y == b2.position.y) && (b1.position.z == b2.position.z);
}

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
    if (boidEquals(neighbor, boid) || distance(neighbor, boid) > limit) {
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

function getAlignment2(boid, neighbors, mul) {
  var alignment = {x: 0, y: 0, z: 0};
  var n = neighbors.length - 1;
  for (i in neighbors) {
    neighbor = neighbors[i][0];
    if (boidEquals(neighbor, boid) || distance(neighbor, boid) > repulsionRadius) {
      --n;
      continue;
    }
    alignment = {
      x: alignment.x + neighbor.vel.x,
      y: alignment.y + neighbor.vel.y,
      z: alignment.z + neighbor.vel.z,
    };
  }
  if (n > 0) {
    alignment = {x: mul * alignment.x / n, y: mul * alignment.y / n, z: mul * alignment.z / n, };
  }
  return alignment;
}

function getSeparation(boid, neighbors, mul) {
  return getCohesion(boid, neighbors, -1*mul);
}

function getCohesion(boid, neighbors, mul) {
  var cohesion = {x: 0, y: 0, z: 0};

  for (j in neighbors) {
    neighbor = neighbors[j][0];
    if (boidEquals(neighbor, boid)) {
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
    x: ((cohesion.x) / n - boid.position.x) * mul,
    y: ((cohesion.y) / n - boid.position.y) * mul,
    z: ((cohesion.z) / n - boid.position.z) * mul,
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
    vel: cohesion
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
        vel: boid.vel
      });
      continue;
    }

    // var alignment = boid.rotation;
    var alignment = getAlignment2(boid, neighbors, .12);
    var cohesion = getCohesion(boid, neighbors, .3);

    var close_neighbors = boidTree.nearest(boid, numBoids, repulsionRadius);
    var separation = getSeparation(boid, close_neighbors, .3);

    var velocity = new THREE.Vector3(boid.vel.x + cohesion.vel.x + separation.vel.x,
                             boid.vel.y + cohesion.vel.y + separation.vel.y,
                             boid.vel.z + cohesion.vel.z + separation.vel.z);

    newBoids.push({
      x: (boid.rotation.x + alignment.x)/2,
      y: (boid.rotation.y + alignment.y)/2,
      z: (boid.rotation.z + alignment.z)/2,
      vel: velocity
    });
  };

  for (i in newBoids) {
    boids[i].rotation.x = newBoids[i].x;
    boids[i].rotation.y = newBoids[i].y;
    boids[i].rotation.z = newBoids[i].z;
    boids[i].vel = newBoids[i].vel;
  }
}
