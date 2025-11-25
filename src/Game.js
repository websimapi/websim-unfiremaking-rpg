import * as THREE from 'three';
import { World } from './World.js';
import { Player } from './Player.js';
import { Input } from './Input.js';
import { UIManager } from './UIManager.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 20;
        dirLight.shadow.camera.bottom = -20;
        dirLight.shadow.camera.left = -20;
        dirLight.shadow.camera.right = 20;
        this.scene.add(dirLight);

        // Sub-systems
        this.ui = new UIManager(this);
        this.world = new World(this.scene);
        this.player = new Player(this.scene);
        this.input = new Input(this);

        this.clock = new THREE.Clock(); 
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    start() {
        this.animate();
        this.ui.showMessage("Welcome! Find a bucket.");
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        const dt = this.clock.getDelta();
        this.player.update(dt);
        this.world.update(dt);
        
        // Camera follow player
        const targetPos = this.player.mesh.position.clone();
        targetPos.add(new THREE.Vector3(0, 12, 12)); // Offset
        this.camera.position.lerp(targetPos, 0.1);
        this.camera.lookAt(this.player.mesh.position);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}