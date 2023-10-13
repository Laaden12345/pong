import React, { useEffect, useState } from "react"

const Game = () => {
  const [phaser, setPhaser] = useState<Phaser.Game>(); 

  useEffect(() => {
    async function initPhaser() {
        const Phaser = await import('phaser');
        const { default:GameScene } = await import('./GameScene');;

        const config = {
          type: Phaser.AUTO,
          parent: 'phaser-container',
          width: 800,
          height: 600,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 0, x: 0 },
            },
          }
        }

        let game = new Phaser.Game({
            ...config,
            scene: [GameScene]
        });

        setPhaser(game);
    }

    initPhaser();
}, []);

  return <div id="phaser-container" />
}

export default Game
