import * as THREE from 'three';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = this.createCharacter();
        this.speed = 4;
        this.targetPosition = null;
        this.isMoving = false;
        
        // Animation
        this.animTime = 0;
    }

    createCharacter() {
        const group = new THREE.Group();
        
        // Materials
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffccaa });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0x883333 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x333388 });

        // Torso
        const torsoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
        const torso = new THREE.Mesh(torsoGeo, shirtMat);
        torso.position.y = 0.75;
        torso.castShadow = true;
        group.add(torso);

        // Head
        const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.25;
        head.castShadow = true;
        group.add(head);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.15, 0.6, 0.15);
        const leftArm = new THREE.Mesh(armGeo, skinMat);
        leftArm.position.set(-0.35, 0.75, 0);
        
        const rightArm = new THREE.Mesh(armGeo, skinMat);
        rightArm.position.set(0.35, 0.75, 0);
        
        group.add(leftArm);
        group.add(rightArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.15, 0.35, 0);
        
        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.15, 0.35, 0);
        
        group.add(leftLeg);
        group.add(rightLeg);

        // Store limb references for animation
        this.limbs = {
            leftArm,
            rightArm,
            leftLeg,
            rightLeg
        };

        // Pivot adjustments for animation
        // We really want to rotate limbs from the top, but for a simple prototype,
        // center rotation with offset geometry or container groups is better.
        // For simplicity here, we'll just rotate the meshes directly and accept minor clipping.

        group.position.set(0, 0, 0);
        this.scene.add(group);
        return group;
    }

    moveTo(point) {
        this.targetPosition = point;
        this.isMoving = true;
    }

    update(dt) {
        if (this.isMoving && this.targetPosition) {
            const direction = new THREE.Vector3().subVectors(this.targetPosition, this.mesh.position);
            direction.y = 0; // Keep movement on flat plane for now
            const distance = direction.length();

            if (distance < 0.1) {
                this.isMoving = false;
                this.mesh.position.x = this.targetPosition.x;
                this.mesh.position.z = this.targetPosition.z;
                this.resetAnimation();
            } else {
                direction.normalize();
                this.mesh.position.add(direction.multiplyScalar(this.speed * dt));
                
                // Rotation
                const targetRotation = Math.atan2(direction.x, direction.z);
                // Simple lerp for rotation
                let rotDiff = targetRotation - this.mesh.rotation.y;
                // Normalize angle
                while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
                while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
                this.mesh.rotation.y += rotDiff * 10 * dt;

                this.animateWalk(dt);
            }
        } else {
            this.resetAnimation();
        }
    }

    animateWalk(dt) {
        this.animTime += dt * 10;
        
        // Simple swing
        const angle = Math.sin(this.animTime) * 0.5;
        
        this.limbs.leftLeg.rotation.x = angle;
        this.limbs.rightLeg.rotation.x = -angle;
        
        this.limbs.leftArm.rotation.x = -angle;
        this.limbs.rightArm.rotation.x = angle;
    }

    resetAnimation() {
        this.limbs.leftLeg.rotation.x = 0;
        this.limbs.rightLeg.rotation.x = 0;
        this.limbs.leftArm.rotation.x = 0;
        this.limbs.rightArm.rotation.x = 0;
    }
}