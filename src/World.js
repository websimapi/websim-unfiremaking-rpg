import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.interactables = []; // Objects the player can click
        this.ground = null;

        this.loadTextures();
        this.createGround();
        this.createWaterSource();
        this.createFires();
        this.createBuckets();
    }

    loadTextures() {
        const loader = new THREE.TextureLoader();
        this.grassTex = loader.load('grass_texture.png');
        this.grassTex.wrapS = THREE.RepeatWrapping;
        this.grassTex.wrapT = THREE.RepeatWrapping;
        this.grassTex.repeat.set(10, 10);

        this.waterTex = loader.load('water_texture.png');
        this.waterTex.wrapS = THREE.RepeatWrapping;
        this.waterTex.wrapT = THREE.RepeatWrapping;
        
        this.fireTex = loader.load('fire_particle.png');
    }

    createGround() {
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({ 
            map: this.grassTex,
            color: 0x88cc88 
        });
        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.ground.userData = { type: 'ground' };
        this.scene.add(this.ground);
    }

    createWaterSource() {
        // A simple lake/pond
        const geometry = new THREE.CircleGeometry(5, 32);
        const material = new THREE.MeshStandardMaterial({ 
            map: this.waterTex,
            color: 0x00aaff,
            roughness: 0.1,
            metalness: 0.3
        });
        const water = new THREE.Mesh(geometry, material);
        water.rotation.x = -Math.PI / 2;
        water.position.set(-10, 0.05, -5);
        water.userData = { type: 'water' };
        this.scene.add(water);
        this.interactables.push(water);

        // Decor rocks around water
        for(let i=0; i<8; i++) {
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.5),
                new THREE.MeshStandardMaterial({ color: 0x888888 })
            );
            const angle = (i / 8) * Math.PI * 2;
            rock.position.set(-10 + Math.cos(angle)*5, 0.25, -5 + Math.sin(angle)*5);
            rock.castShadow = true;
            this.scene.add(rock);
        }
    }

    createFires() {
        // Create a few fires scattered around
        const positions = [
            { x: 5, z: 5 },
            { x: 8, z: -3 },
            { x: -5, z: 8 },
            { x: 12, z: 12 }
        ];

        this.fires = [];

        positions.forEach(pos => {
            this.spawnFire(pos.x, 0, pos.z);
        });
    }

    spawnFire(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        
        // Logs
        const logGeo = new THREE.CylinderGeometry(0.1, 0.1, 1);
        const logMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const log1 = new THREE.Mesh(logGeo, logMat);
        log1.rotation.z = Math.PI / 2;
        log1.rotation.y = Math.PI / 4;
        log1.position.y = 0.1;
        const log2 = new THREE.Mesh(logGeo, logMat);
        log2.rotation.z = Math.PI / 2;
        log2.rotation.y = -Math.PI / 4;
        log2.position.y = 0.1;
        group.add(log1, log2);

        // Particle System for flame
        const particleCount = 10;
        const particles = new THREE.Group();
        
        for(let i=0; i<particleCount; i++) {
            const spriteMat = new THREE.SpriteMaterial({ 
                map: this.fireTex, 
                color: 0xffaa00,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(1, 1, 1);
            sprite.position.set(
                (Math.random() - 0.5) * 0.5, 
                Math.random() * 0.5 + 0.2, 
                (Math.random() - 0.5) * 0.5
            );
            sprite.userData = { 
                speed: 0.5 + Math.random(), 
                initialY: sprite.position.y 
            };
            particles.add(sprite);
        }
        group.add(particles);
        group.userData = { type: 'fire', particles: particles };
        
        this.scene.add(group);
        this.interactables.push(group);
        this.fires.push(group);
    }

    createBuckets() {
        const bucketGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.5);
        const bucketMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const bucket = new THREE.Mesh(bucketGeo, bucketMat);
        bucket.position.set(2, 0.25, 2);
        bucket.castShadow = true;
        bucket.userData = { type: 'bucket_item' };
        
        this.scene.add(bucket);
        this.interactables.push(bucket);
    }

    removeObject(object) {
        this.scene.remove(object);
        this.interactables = this.interactables.filter(i => i !== object);
    }

    update(dt) {
        // Animate fires
        this.fires.forEach(fireGroup => {
            const particles = fireGroup.userData.particles;
            particles.children.forEach(p => {
                p.position.y += p.userData.speed * dt;
                if (p.position.y > 1.5) {
                    p.position.y = p.userData.initialY;
                }
                // Billboard effect is automatic for Sprites
            });
        });

        // Animate water texture
        if (this.waterTex) {
            this.waterTex.offset.x += 0.05 * dt;
            this.waterTex.offset.y += 0.02 * dt;
        }
    }
}