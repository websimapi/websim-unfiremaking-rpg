import * as THREE from 'three';

export class Input {
    constructor(game) {
        this.game = game;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        
        this.setupEvents();
    }

    setupEvents() {
        // Handle clicks/taps
        window.addEventListener('pointerdown', (event) => {
            // Only process if clicking on the game canvas, not UI
            if (event.target.id !== 'game-container' && event.target.tagName !== 'CANVAS') return;
            
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.processInput();
        });
    }

    processInput() {
        this.raycaster.setFromCamera(this.pointer, this.game.camera);

        // 1. Check interactables first (Water, Fire, Items)
        const intersects = this.raycaster.intersectObjects(this.game.world.interactables, true);
        
        if (intersects.length > 0) {
            // Traverse up to find the root object with userData
            let obj = intersects[0].object;
            while(obj.parent && !obj.userData.type) {
                obj = obj.parent;
            }
            
            const point = intersects[0].point;
            
            // Move player to interact
            this.game.player.moveTo(point);
            
            // Trigger interaction after a small delay (simulating walking there)
            // We calculate the time needed based on distance and speed
            const dist = this.game.player.mesh.position.distanceTo(point);
            const speed = this.game.player.speed || 4;
            const timeToArrive = (dist / speed) * 1000; // milliseconds
            
            setTimeout(() => {
                // If close enough, interact
                if(this.game.player.mesh.position.distanceTo(point) < 2.0) {
                    this.handleInteraction(obj);
                }
            }, timeToArrive + 100); // Add a small buffer of 100ms
            
            // Show click marker (optional)
            return;
        }

        // 2. Check Ground for movement
        if (this.game.world.ground) {
            const groundIntersect = this.raycaster.intersectObject(this.game.world.ground);
            if (groundIntersect.length > 0) {
                const point = groundIntersect[0].point;
                this.game.player.moveTo(point);
                this.game.ui.createClickMarker(point);
            }
        }
    }

    handleInteraction(obj) {
        const type = obj.userData.type;
        const ui = this.game.ui;
        
        if (type === 'bucket_item') {
            ui.addToInventory('bucket_empty');
            this.game.world.removeObject(obj);
            ui.playSound('pickup');
            ui.showMessage("Picked up a bucket.");
        } else if (type === 'water') {
            if (ui.hasItem('bucket_empty')) {
                ui.replaceItem('bucket_empty', 'bucket_full');
                ui.playSound('splash');
                ui.showMessage("Filled bucket with water.");
            } else if (ui.hasItem('bucket_full')) {
                ui.showMessage("Bucket is already full.");
            } else {
                ui.showMessage("I need something to carry water.");
            }
        } else if (type === 'fire') {
            if (ui.hasItem('bucket_full')) {
                ui.replaceItem('bucket_full', 'bucket_empty');
                ui.addXP(100);
                this.game.world.removeObject(obj);
                ui.playSound('extinguish');
                ui.showMessage("Fire extinguished!");
            } else {
                ui.showMessage("I need water to put that out!");
            }
        }
    }
}