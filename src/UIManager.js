import * as THREE from 'three';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.inventory = [null, null, null, null];
        this.xp = 0;
        this.messageTimeout = null;

        // Sounds
        this.sounds = {
            splash: new Audio('sfx_splash.mp3'),
            extinguish: new Audio('sfx_extinguish.mp3'),
            pickup: new Audio('sfx_pickup.mp3')
        };
    }

    playSound(name) {
        if(this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play().catch(e => console.log("Audio play failed interaction required"));
        }
    }

    showMessage(text) {
        const box = document.getElementById('message-box');
        box.textContent = text;
        box.classList.add('visible');
        
        if (this.messageTimeout) clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => {
            box.classList.remove('visible');
        }, 3000);
    }

    addXP(amount) {
        this.xp += amount;
        document.getElementById('xp-value').textContent = this.xp;
        
        // Visual flair
        const tracker = document.getElementById('xp-tracker');
        tracker.style.transform = "scale(1.2)";
        tracker.style.transition = "transform 0.1s";
        setTimeout(() => tracker.style.transform = "scale(1)", 100);
    }

    addToInventory(itemType) {
        // Find first empty slot
        const index = this.inventory.findIndex(item => item === null);
        if (index !== -1) {
            this.inventory[index] = itemType;
            this.updateInventoryUI();
            return true;
        }
        return false;
    }

    hasItem(itemType) {
        return this.inventory.includes(itemType);
    }

    replaceItem(oldType, newType) {
        const index = this.inventory.indexOf(oldType);
        if (index !== -1) {
            this.inventory[index] = newType;
            this.updateInventoryUI();
        }
    }

    updateInventoryUI() {
        this.inventory.forEach((item, index) => {
            const slot = document.getElementById(`slot-${index}`);
            slot.innerHTML = ''; // Clear
            
            if (item) {
                const img = document.createElement('img');
                img.src = item === 'bucket_empty' ? 'bucket_empty_icon.png' : 'bucket_full_icon.png';
                slot.appendChild(img);
            }
        });
    }

    createClickMarker(position) {
        // A simple temporary mesh to show click
        const geo = new THREE.RingGeometry(0.2, 0.3, 16);
        const mat = new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(position);
        mesh.position.y += 0.05;
        mesh.rotation.x = -Math.PI / 2;
        this.game.scene.add(mesh);

        // Animate and remove
        let scale = 1;
        const animate = () => {
            scale -= 0.05;
            mesh.scale.set(scale, scale, scale);
            if (scale <= 0) {
                this.game.scene.remove(mesh);
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}