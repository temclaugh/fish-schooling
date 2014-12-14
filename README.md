3D Boids
==============
AUTHORS: JO BOOTH, TIM MCLAUGHLIN

FILES:
total 1140
boids.js
ColladaLoader.js
css
FirstPersonControls.js
flying_boid.dae
glBoids.html
images
index.html
kdTree-min.js
low-poly-plane.dae
main.js
README.md
skybox2
skybox2.dae
three.js

PLATFORMS:
modern web browsers

REQUIREMENTS:
we met our project goals

CODE DESIGN:
we used a kd-tree to make fast 3d boids. for more details, see index.html inside the tarball.

RUNNING PROGRAM:
This CANNOT work if the website is merely placed in a local folder and run directly in browser, as our texture loader depends on Ajax calls. If you wish to run the program locally, simply call python -m SimpleHTTPServer in the root directory of the project, and then point your browser at localhost:8000. Any other hosting scheme will also work fine.

Once here, index.html has our writeup, and our program is at GLBoids.html.

You can parametrize the program by providing a custom url.

Custom urls are of the form: boids.com/GLBoids.html?<Boid_Type>_<Num_Boids>
And you can supply either 'planes' or 'birds' for <Boid_Type> (no quotes) and any positive integer for <Num_Boids>.

Our project can also be seen at 3dboids.com

ACKNOWLEDGEMENTS:
Baseline code for the GL world adapted from
  http://www.ibm.com/developerworks/library/wa-webgl3/

Textures from:
https://3dwarehouse.sketchup.com/model.html?id=200a58ab65bbdb396c1cd53dbc9f7b8e
https://3dwarehouse.sketchup.com/model.html?id=a5e7ad2251a97fd284c514843bb76d54
https://3dwarehouse.sketchup.com/model.html?id=1782aa27691e90da234c264b700ce120
