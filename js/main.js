var camera, controls, renderer, scene, geometry, material, mesh;
var container;
var w = window.innerWidth;
var h = window.innerHeight;
var planeGeometry;
var mouseX, mouseY;
var time = 0.0;
var globalUniforms = {
    time: { type: 'f', value: time },
    resolution: { type: 'v2', value: new THREE.Vector2(w, h) },
    mouseX: { type: 'f', value: 0.0 },
    mouseY: { type: 'f', value: 0.0 }
}
var page;
initScene();

function initScene() {
    //input scene - basic three.js setup and loop functionality
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/ window.innerHeight, 1, 100000);
    camera.position.set(0, 0, 750);

    //orbit controls for input scene - make sure only input or output scene has controls, not both
    controls = new THREE.OrbitControls(camera);

    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true, precision: "highp", antialias: false});
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMapEnabled = true;

    scene = new THREE.Scene();

    container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(renderer.domElement);

    material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: 2,
        map: THREE.ImageUtils.loadTexture("tex/image-not-found.gif")
    });

    initLights();
    initObjects();

    animate();

    //takes input scene and makes it a texture, as well as starting feedback loop
    // initOutputScene();
}
function initLights(){
    var pointColor = "#ffffff";
    spotLight = new THREE.SpotLight(pointColor);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    // spotLight.shadowCameraVisible = true;
    spotLight.shadowCameraNear = 2;
    spotLight.shadowCameraFar = 200;
    spotLight.shadowCameraFov = 130;
    // spotLight.target = page;
    spotLight.distance = 0;
    scene.add(spotLight);
    var ambiColor = "#1c1c1c";
    var ambientLight = new THREE.AmbientLight(ambiColor);
    // scene.add(ambientLight);

}
function initObjects(){
    manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    loadModel("obj/page.obj", 0, 0, 0, 1.0, 0, 0, 0, material);

    planeGeometry = new THREE.PlaneBufferGeometry(10000,10000);
    plane = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({side:2, color: 0xffffff}));
    plane.rotation.x = Math.PI/2;
    plane.receiveShadow = true;
    // scene.add(plane);
}
function animate() {
    window.requestAnimationFrame(animate);
    draw();
}

function draw() {

    // spotLight.target = page;
    // page.receiveShadow = true;
    // page.castShadow = true;
    renderer.render(scene, camera);
}

function map(value, max, minrange, maxrange) {
    return ((max - value) / (max)) * (maxrange - minrange) + minrange;
}

function onDocumentMouseMove(event) {
    unMappedMouseX = (event.clientX);
    unMappedMouseY = (event.clientY);
    mouseX = map(unMappedMouseX, window.innerWidth, -1.0, 1.0);
    mouseY = map(unMappedMouseY, window.innerHeight, -1.0, 1.0);
    globalUniforms.mouseX.value = mouseX;
    globalUniforms.mouseY.value = mouseY;
}

function onKeyDown(event) {
    if (event.keyCode == "32") {
        screenshot();

        function screenshot() {
            var blob = dataURItoBlob(outputRenderer.domElement.toDataURL('image/png'));
            var file = window.URL.createObjectURL(blob);
            var img = new Image();
            img.src = file;
            img.onload = function(e) {
                window.open(this.src);
            }
        }

        function dataURItoBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        }

        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
}
function loadModel(model, x, y, z, scale, rotX, rotY, rotZ, customMaterial){
    var loader = new THREE.OBJLoader( manager );
    loader.load( model, function ( object ) {

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                child.material = customMaterial;
                // child.material.side = 2;
                // child.material.envMap = texCube;

            }

        } );

        object.scale.set(scale,scale,scale);
        scene.add( object );
        object.castShadow = true;
        object.receiveShadow = true;
    }, onProgress, onError );
}

function onProgress( xhr ) {
    if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
};

function onError( xhr ) {
};