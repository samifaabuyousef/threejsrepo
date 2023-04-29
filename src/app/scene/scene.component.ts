import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements AfterViewInit {
  @ViewChild('rendererContainer') rendererContainer: ElementRef;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene;
  camera;
  mesh = null;
  controls;
  isPlaying: boolean = false;
  index = 0;
  intervalId: NodeJS.Timer;

  constructor() {
    this.scene = new THREE.Scene();
    this.renderer.shadowMap.enabled = true;
    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 2;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = true;
    this.controls.update();
  }

  controlUpdate() {
    this.controls.update();
  }

  ngAfterViewInit() {
    this.configCamera();
    this.configRenderer();
    this.configControls();
    this.createMesh();
    this.animate();
  }

  configCamera() {
    this.camera.position.set(100, 200, 300);
  }

  configRenderer() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(
      new THREE.Color(0.39215686274509803, 0.19607843137254902, 0)
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
  }

  configControls() {
    this.controls.autoRotate = false;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.update();
  }

  createMesh() {
    const material = new THREE.MeshLambertMaterial({
      color: 0x00fff0,
    });

    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const cube = new THREE.Mesh(geometry, material);
    const edges = new THREE.BoxHelper(cube, 'darkorchid');



    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.castShadow = true;
    light1.position.set(0, 10, 0);

    const light3 = new THREE.DirectionalLight(0xffffff, 0.8);
    light3.position.set(10, 4, 10);
    light3.castShadow = true;

    this.scene.add(light1);
    this.scene.add(light3);

    const group = new THREE.Group();
    group.add(cube);
    group.add(edges);

    

    this.scene.add(group);
    // for adding  ground uncomment the following
    // this.addGround();
    // for changing the light position
    // this.changeLightPostion();
  }

  showTime: string;
  step = 1 / 60;


  changeLightPostion() {
    // the direction of the light could be animated with the time also by changing the position
    const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
    light2.position.set(-5, 4, -5);
    light2.castShadow = true;
    this.scene.add(light2);

  }

  addGround() {
        // Ground plane
        var groundGeo = new THREE.PlaneGeometry(10000, 10000);
        var groundMat = new THREE.MeshPhongMaterial({
          color : 0xf124545,
        });
        var ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -100;
        ground.receiveShadow = true;
        this.scene.add(ground);
  }

  animate() {
    window.requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  previous() {
    clearInterval(this.intervalId);
    this.index = this.index - 2;
    if (this.index - 2 <= 0) {
      this.index = 0;
    }
    if (this.isPlaying) this.play();
  }

  play() {
    this.isPlaying = true;
    if (this.index > 24) {
      this.index = 0;
      this.isPlaying = false;
    }
    this.intervalId = setInterval(() => {
      this.index++;
      let dateObj = this.getTime(this.index);
      this.changeBrightness(dateObj);
      if (this.index > 24) {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.intervalId);
  }

  next() {
    clearInterval(this.intervalId);
    this.index = this.index + 2;
    if (this.index + 2 > 24) {
      this.index = 24;
    }
    if (this.isPlaying) this.play();
  }

  movingSlider(event: any) {
    let dateObj = this.getTime(event.value);
    this.changeBrightness(dateObj);
  }

  getTime(val: any) {
    const [hoursStr, minutesStr] = this.formatTime(val).split(':'); // split the time string into hours and minutes
    const hours = parseInt(hoursStr); // parse the hours as an integer
    const minutes = parseInt(minutesStr); // parse the minutes as an integer
    const dateObj = new Date(); // create a new Date object
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  }

  changeBrightness(dateObj: Date) {
    const [r, g, b] = this.getBrightness(dateObj);
    const color = new THREE.Color(r / 255, g / 255, b / 255);
    this.scene.background = color;

    this.controlUpdate();
    this.camera.updateProjectionMatrix();
    this.animate();
  }

  getBrightness(time: Date): any {
    const timeOfDay = (time.getHours() * 60 + time.getMinutes()) / (24 * 60);
    const color = [255, 200, 150];
    const brightness = 100 + 155 * Math.sin(timeOfDay * Math.PI);
    const adjustedColor = color.map((value) =>
      Math.round((value * brightness) / 255)
    );

    return adjustedColor;
  }

  formatTime(value: any | null) {
    if (!value) {
      return '00:00';
    }
    if (value === 0) {
      return '00:00';
    }
    if (value === 24) {
      return '23:59';
    }

    let decimalPart = +value.toString().replace(/^[^\.]+/, '0');
    let mm = decimalPart * 60;
    mm = Math.round(mm);
    var mmPart =
      mm.toString().length == 1 ? '0' + mm.toString() : mm.toString();
    if (mmPart == '60') {
      mmPart = '00';
    }
    var hhPart;
    if (value >= 0) {
      let valueStr = value.toFixed(2);
      let strArr = valueStr.split('.');
      if (strArr[0].length == 1) {
        strArr[0] = '0' + strArr[0];
      }
      hhPart = strArr[0];
    }
    return hhPart + ':' + mmPart;
  }


  formatLabel(num: any) {
    const hour = Math.floor(num);
    const minute = Math.round((num - hour) * 60);
    const isAM = hour < 12;
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinute = minute < 10 ? "0" + minute : minute.toString();
    const period = isAM ? "AM" : "PM";
    return `${formattedHour}:${formattedMinute} ${period}`;
  }
}
