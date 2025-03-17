function startGame(mode) {
    // Add a loading animation class to the clicked card
    const cards = document.querySelectorAll('.mode-card');
    cards.forEach(card => {
        if (card.querySelector('h2').textContent.toLowerCase().includes(mode)) {
            card.style.transform = 'scale(0.95)';
            card.style.opacity = '0.8';
        }
    });

    // Redirect to the game page with the selected mode
    setTimeout(() => {
        window.location.href = `game.html?type=${mode}`;
    }, 300);
}

// Add hover sound effect to cards
document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const hoverSound = new Audio('sounds/hover.mp3');
        hoverSound.volume = 0.2;
        hoverSound.play().catch(() => {}); // Ignore errors if sound can't play
    });
}); 