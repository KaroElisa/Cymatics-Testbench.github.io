import * as THREE from './js/three.module.js';

//import { dat.GUI } from './js/dat.gui.module.js';

var camera, scene, renderer, mesh, material, key, analyser;

  var clock = new THREE.Clock();
  init();
  animate();

  function init(){
    // Renderer.
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    //renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Add renderer to page
    document.body.appendChild(renderer.domElement);

    // Create camera.
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = 1500;

    //AUDIO LISTENERS
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // Create scene.
    scene = new THREE.Scene();

    // Create material
    var uniforms = {
        color: { type: "c", value: new THREE.Color(0x324B7A) },
        noiseScale: { type: "v3", value: new THREE.Vector3(1000.0, 1000.0, 2000.0)},
        speed: { type: "f", value: 100.0},
        time: { type:"f", value: 0.0},
        intensity: { type:"f", value: 3.0}
    };
    var vertexShader = document.getElementById('tunnelVertexShader').text;
    var fragmentShader = document.getElementById('tunnelFragmentShader').text;
    material = new THREE.ShaderMaterial(
      {
        uniforms : uniforms,
        vertexShader : vertexShader,
        fragmentShader : fragmentShader,
        side: THREE.BackSide
      });

    // Create cylinder and add to scene.
    // CylinderBufferGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded, thetaStart, thetaLength)
    var geometry = new THREE.CylinderBufferGeometry( 200, 100, 3000, 32, 16, true );
    mesh = new THREE.Mesh(geometry, material);
    // rotate 90 degrees
    mesh.rotation.x = (90 * Math.PI)/180;

    //AUDIO LOADER
    const audioLoader = new THREE.AudioLoader();

    scene.add(mesh);

    const sound = new THREE.Audio( listener );
    audioLoader.load( 'sounds/X3Loud2.mp3', function ( buffer ) {

      sound.setBuffer( buffer );
      sound.setLoop( true );
      sound.setVolume( 1 );
      sound.play();

    } );
    mesh.add( sound );

    analyser = new THREE.AudioAnalyser( sound, 32 );

    // Add listener for window resize.
    window.addEventListener('resize', onWindowResize, false);

    // set up controls
    gui(uniforms);

  }

  function animate() {
    requestAnimationFrame(animate);
    //mesh.rotation.x += 0.01;
    material.uniforms.time.value = clock.getElapsedTime();

    //SOUND REACTIVE EMISSION
    material.noiseScale = analyser.getAverageFrequency();

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function gui(uniforms){
    var gui = new dat.GUI();


    for(key in uniforms){
      // Skip the time uniform as that is incremented in the render function
      if(key !== 'time'){
        if(uniforms[key].type == 'f'){
          var controller = gui.add(uniforms[key], 'value').name(key);
        }else if(uniforms[key].type == 'c'){
          uniforms[key].guivalue = [uniforms[key].value.r * 255, uniforms[key].value.g * 255, uniforms[key].value.b * 255];
          var controller = gui.addColor(uniforms[key], 'guivalue').name(key);
          controller.onChange(function(value){
            this.object.value.setRGB(value[0]/255, value[1]/255, value[2]/255);
          });
        }else if(uniforms[key].type == 'v3'){
          var controllerx = gui.add(uniforms[key].value, 'x').name(key+' X');
          var controllery = gui.add(uniforms[key].value, 'y').name(key+' Y');
          var controllerz = gui.add(uniforms[key].value, 'z').name(key+' Z');
        }
      }
    }
  }