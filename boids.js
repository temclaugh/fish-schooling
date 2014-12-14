var numBoids = 20;
var cohesionRadius = 40;
var separationRadius = 10;

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
    boid.x = boid.position.x;
    boid.y = boid.position.y;
    boid.z = boid.position.z;
    return boid;
  });
  return new kdTree(boids, distance, ["x", "y", "z"]);
}

function getAlignment(boid, neighbors, mul) {
  var alignment = {x: 0, y: 0, z: 0};
  var n = neighbors.length - 1;
  for (i in neighbors) {
    neighbor = neighbors[i][0];
    if (boidEquals(neighbor, boid)) {
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
  var separation = {x: 0, y: 0, z: 0};
  var n = neighbors.length;

  for (j in neighbors)
  {
    neighbor = neighbors[j][0];

    if (boidEquals(neighbor, boid))
    {
      n--;
      continue;
    }

    separation =
    {
      x: separation.x + (boid.position.x - neighbor.position.x),
      y: separation.y + (boid.position.y - neighbor.position.y),
      z: separation.z + (boid.position.z - neighbor.position.z),
    };
  }

  if (n > 0)
  {
    separation =
    {
      x: ((separation.x) / n) * mul,
      y: ((separation.y) / n) * mul,
      z: ((separation.z) / n) * mul,
    };
  }

  return {
    x: 0,
    y: 0,
    z: 0,
    vel: separation
  };
}

function getCohesion(boid, neighbors, mul) {
  var cohesion = {x: 0, y: 0, z: 0};
  var n = neighbors.length;

  for (j in neighbors) {
    neighbor = neighbors[j][0];
    if (boidEquals(neighbor, boid)) {
      n--;
      continue;
    }
    cohesion = {
      x: cohesion.x + neighbor.position.x,
      y: cohesion.y + neighbor.position.y,
      z: cohesion.z + neighbor.position.z,
    };
  }

  if (n > 0) {
    cohesion = {
      x: ((cohesion.x) / n - boid.position.x) * mul,
      y: ((cohesion.y) / n - boid.position.y) * mul,
      z: ((cohesion.z) / n - boid.position.z) * mul,
    };
  }

  return {
    x: 0,
    y: 0,
    z: 0,
    vel: cohesion
  }
}

function nextGeneration(boids) {
  var boidTree = initTree(boids);
  var newBoids = [];
  for (i in boids) {

    var boid = boids[i];
    var neighbors = boidTree.nearest(boid, numBoids, cohesionRadius);

//    if (neighbors.length == 1) {
//      newBoids.push({
//        //x: boid.rotation.x,
//        //y: boid.rotation.y,
//        //z: boid.rotation.z,
//        vel: boid.vel
//      });
//      continue;
//    }

    var alignment = getAlignment(boid, neighbors, .005);
    var cohesion = getCohesion(boid, neighbors, 0.005);
    //p("Cx: " + cohesion.vel.x + " Cy: " + cohesion.vel.y + " Cz: " + cohesion.vel.z);

    var close_neighbors = boidTree.nearest(boid, numBoids, separationRadius);
    var separation = getSeparation(boid, close_neighbors, 1);
    //p("Sx: " + separation.vel.x + " Sy: " + separation.vel.y + " Sz: " + separation.vel.z);

    //p("Ax: " + alignment.x + " Ay: " + alignment.y + " Az: " + alignment.z);

    var velocity = new THREE.Vector3(boid.vel.x + cohesion.vel.x + separation.vel.x + alignment.x,
                                    boid.vel.y + cohesion.vel.y + separation.vel.y + alignment.y,
                                    boid.vel.z + cohesion.vel.z + separation.vel.z + alignment.z);

    //var velocity = new THREE.Vector3(boid.vel.x + cohesion.vel.x + separation.vel.x,
    //                                 boid.vel.y + cohesion.vel.y + separation.vel.y,
    //                                 boid.vel.z + cohesion.vel.z + separation.vel.z);


    //var velocity = new THREE.Vector3(boid.vel.x * 0.95 + separation.vel.x,
    //                                 boid.vel.y * 0.95 + separation.vel.y,
    //                                 boid.vel.z * 0.95 + separation.vel.z);

    // var velocity = new THREE.Vector3(cohesion.vel.x + separation.vel.x,
    //                                  cohesion.vel.y + separation.vel.y,
    //                                  cohesion.vel.z + separation.vel.z);

    newBoids.push({
      x: 0,
      y: 0,
      z: 0,
      vel: velocity
    });
  };

  for (i in newBoids) {
    //boids[i].rotation.x = newBoids[i].x;
    //boids[i].rotation.y = newBoids[i].y;
    //boids[i].rotation.z = newBoids[i].z;
    boids[i].vel = newBoids[i].vel;
  }
}
