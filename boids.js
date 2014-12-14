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

function getAlignment(boid, neighbors) {
  var alignment = {x: 0, y: 0, z: 0};
  for (j in neighbors) {
    neighbor = neighbors[j][0];
    if (neighbor == boid) {
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
  var separation = {x: 0, y: 0, z: 0};

  var boid_pos = new THREE.Vector3(boid.position.x, boid.position.y, boid.position.z);
  boid.localToWorld(boid_pos);

  for (j in neighbors) {
    neighbor = neighbors[j][0];
    if (neighbor == boid) {
      continue;
    }

    // TODO: Restrict this to neighbors within small radius!

    var neighbor_pos = new THREE.Vector3(neighbor.position.x, neighbor.position.y, neighbor.position.z);
    neighbor.localToWorld(neighbor_pos);

    separation = {
      x: separation.x + neighbor_pos.x,
      y: separation.y + neighbor_pos.y,
      z: separation.z + neighbor_pos.z,
    };
  }
  var n = neighbors.length - 1;
  separation = {x: (boid_pos.x - (separation.x / n)) * mul, y: (boid_pos.y - (separation.y / n)) * mul , z: (boid_pos.z - (separation.z / n)) * mul, };
  return separation;
}

function getCohesion(boid, neighbors, mul) {
  var cohesion = {x: 0, y: 0, z: 0};

  var boid_pos = new THREE.Vector3(boid.position.x, boid.position.y, boid.position.z);
  boid.localToWorld(boid_pos);

  for (j in neighbors) {
    neighbor = neighbors[j][0];
    if (neighbor == boid) {
      continue;
    }

    var neighbor_pos = new THREE.Vector3(neighbor.position.x, neighbor.position.y, neighbor.position.z);
    neighbor.localToWorld(neighbor_pos);

    cohesion = {
      x: cohesion.x + neighbor_pos.x,
      y: cohesion.y + neighbor_pos.y,
      z: cohesion.z + neighbor_pos.z,
    };
  }
  var n = neighbors.length - 1;
  cohesion = {x: ((cohesion.x / n) - boid_pos.x) * mul, y: ((cohesion.y / n) - boid_pos.y) * mul, z: ((cohesion.z / n) - boid_pos.z) * mul, };
  return cohesion;
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

    var alignment = {x: 0, y: 0, z: 0};
    var alignment = getAlignment(boid, neighbors);
    var cohesion = getCohesion(boid, neighbors, 1);
    var separation = getSeparation(boid, neighbors, .01);
    newBoids.push({
      x: boid.position.x + alignment.x,
      y: boid.position.y + alignment.y,
      z: boid.position.z + alignment.z,
    });
    newBoids[newBoids.length - 1]  = normalize(newBoids[newBoids.length - 1]);
  };

  for (i in newBoids) {
    boids[i].rotation.x = newBoids[i].x;
    boids[i].rotation.y = newBoids[i].y;
    boids[i].rotation.z = newBoids[i].z;
  }
}
