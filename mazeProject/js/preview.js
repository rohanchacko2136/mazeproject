class PreviewGenerator {
    static generatePreviews() {
        this.generateClassicPreview();
        this.generateTimeAttackPreview();
        this.generateDynamicPreview();
    }

    static generateClassicPreview() {
        const preview = document.querySelector('.classic-preview');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = preview.offsetWidth;
        canvas.height = preview.offsetHeight;
        preview.appendChild(canvas);

        // Create a mini maze
        const cellSize = 20;
        const grid = this.generateMiniMaze(10, 8);
        let playerX = cellSize * 1.5;
        let playerY = cellSize * 1.5;
        let targetX = canvas.width - cellSize * 2.5;
        let targetY = canvas.height - cellSize * 2.5;

        const animate = () => {
            // Clear canvas
            ctx.fillStyle = '#121212';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw maze walls with glow effect
            ctx.fillStyle = '#2c3e50';
            for(let y = 0; y < grid.length; y++) {
                for(let x = 0; x < grid[0].length; x++) {
                    if(grid[y][x] === 1) {
                        // Glow effect
                        ctx.shadowColor = '#ff0000';
                        ctx.shadowBlur = 10;
                        ctx.fillRect(
                            x * cellSize + canvas.width/2 - grid[0].length * cellSize/2,
                            y * cellSize + canvas.height/2 - grid.length * cellSize/2,
                            cellSize,
                            cellSize
                        );
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // Animate player dot
            playerX = playerX + Math.sin(Date.now() / 500) * 2;
            playerY = playerY + Math.cos(Date.now() / 500) * 2;

            // Draw player with trail effect
            ctx.fillStyle = '#3498db44';
            for(let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(
                    playerX - i * 4,
                    playerY - i * 4,
                    cellSize/3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            // Draw player
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(playerX, playerY, cellSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Draw finish point with pulsing effect
            const pulseSize = 1 + Math.sin(Date.now() / 300) * 0.2;
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(
                targetX - (cellSize * pulseSize) / 2,
                targetY - (cellSize * pulseSize) / 2,
                cellSize * pulseSize,
                cellSize * pulseSize
            );

            requestAnimationFrame(animate);
        };

        animate();
    }

    static generateTimeAttackPreview() {
        const preview = document.querySelector('.timed-preview');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = preview.offsetWidth;
        canvas.height = preview.offsetHeight;
        preview.appendChild(canvas);

        const animate = () => {
            // Clear canvas
            ctx.fillStyle = '#121212';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) / 3;
            const time = Date.now() / 1000;

            // Draw outer circle with glowing effect
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Rotating second hand
            const secondAngle = time * Math.PI;
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(secondAngle) * radius * 0.8,
                centerY + Math.sin(secondAngle) * radius * 0.8
            );
            ctx.stroke();

            // Minute hand
            const minuteAngle = time * Math.PI / 30;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(minuteAngle) * radius * 0.6,
                centerY + Math.sin(minuteAngle) * radius * 0.6
            );
            ctx.stroke();

            // Center dot with pulse effect
            const pulseSize = 1 + Math.sin(time * 2) * 0.2;
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 5 * pulseSize, 0, Math.PI * 2);
            ctx.fill();

            // Time markers with glow
            for(let i = 0; i < 12; i++) {
                const angle = (i * Math.PI / 6) - Math.PI / 2;
                const markerRadius = radius * 0.9;
                ctx.fillStyle = i % 3 === 0 ? '#FF0000' : '#FFFFFF';
                ctx.shadowColor = i % 3 === 0 ? '#FF0000' : '#FFFFFF';
                ctx.shadowBlur = i % 3 === 0 ? 10 : 5;
                ctx.beginPath();
                ctx.arc(
                    centerX + Math.cos(angle) * markerRadius,
                    centerY + Math.sin(angle) * markerRadius,
                    i % 3 === 0 ? 4 : 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            requestAnimationFrame(animate);
        };

        animate();
    }

    static generateDynamicPreview() {
        const preview = document.querySelector('.dynamic-preview');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = preview.offsetWidth;
        canvas.height = preview.offsetHeight;
        preview.appendChild(canvas);

        const blocks = [];
        const numBlocks = 6;
        const blockSize = 40;

        // Initialize blocks
        for(let i = 0; i < numBlocks; i++) {
            blocks.push({
                x: Math.random() * (canvas.width - blockSize),
                y: Math.random() * (canvas.height - blockSize),
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }

        const animate = () => {
            // Clear canvas with trail effect
            ctx.fillStyle = 'rgba(18, 18, 18, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw blocks
            blocks.forEach(block => {
                // Update position
                block.x += block.vx;
                block.y += block.vy;
                block.rotation += block.rotationSpeed;

                // Bounce off walls
                if(block.x <= 0 || block.x >= canvas.width - blockSize) block.vx *= -1;
                if(block.y <= 0 || block.y >= canvas.height - blockSize) block.vy *= -1;

                // Draw block with rotation and glow
                ctx.save();
                ctx.translate(block.x + blockSize/2, block.y + blockSize/2);
                ctx.rotate(block.rotation);

                // Glow effect
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(-blockSize/2, -blockSize/2, blockSize, blockSize);
                
                // Inner detail
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 2;
                ctx.strokeRect(-blockSize/3, -blockSize/3, blockSize/1.5, blockSize/1.5);

                ctx.restore();
            });

            // Add particle effects
            for(let i = 0; i < 2; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = Math.random() * 2 + 1;

                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(animate);
        };

        animate();
    }

    static generateMiniMaze(width, height) {
        const maze = Array(height).fill().map(() => Array(width).fill(1));
        const stack = [{x: 1, y: 1}];
        maze[1][1] = 0;

        while(stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [
                {x: current.x + 2, y: current.y, dir: {x: 1, y: 0}},
                {x: current.x - 2, y: current.y, dir: {x: -1, y: 0}},
                {x: current.x, y: current.y + 2, dir: {x: 0, y: 1}},
                {x: current.x, y: current.y - 2, dir: {x: 0, y: -1}}
            ].filter(n => 
                n.x > 0 && n.x < width - 1 && 
                n.y > 0 && n.y < height - 1 && 
                maze[n.y][n.x] === 1
            );

            if(neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                maze[next.y][next.x] = 0;
                maze[current.y + next.dir.y][current.x + next.dir.x] = 0;
                stack.push(next);
            } else {
                stack.pop();
            }
        }

        return maze;
    }
}

// Generate previews when the page loads
window.addEventListener('load', () => {
    PreviewGenerator.generatePreviews();
}); 