import * as THREE from 'three';
import { Game } from './Game.js';

// Initialize the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
});