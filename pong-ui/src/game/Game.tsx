import React, { useEffect, useState } from "react"

const Game = () => {
  const [phaser, setPhaser] = useState<Phaser.Game>(); 

  useEffect(() => {
    async function initPhaser() {
        const Phaser = await import('phaser');
        const { default:HelloWorldScene } = await import('./Scene');;

        const config = {
          type: Phaser.AUTO,
          parent: 'phaser-container',
          width: 800,
          height: 600,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 200 },
            },
          }
        }

        let game = new Phaser.Game({
            ...config,
            scene: [HelloWorldScene]
        });

        setPhaser(game);
    }

    initPhaser();
}, []);

  return <div id="phaser-container" />
}

export default Game
