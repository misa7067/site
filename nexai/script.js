document.addEventListener("DOMContentLoaded", function() {
    // Скрипт для анимации появления элементов при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // ===== JAVASCRIPT ДЛЯ ГЕОМЕТРИЧЕСКОГО ФОНА =====
    function initStaticPattern() {
        const canvas = document.getElementById('patternCanvas');
        if (!canvas) return; // Проверяем, есть ли canvas на странице

        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function animate() {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() * 0.001;
            const patternSize = 45;

            for (let x = patternSize; x < canvas.width; x += patternSize) {
                for (let y = patternSize; y < canvas.height; y += patternSize) {
                    const opacity = 0.1 + Math.sin(time * 0.8 + x * 0.01 + y * 0.01) * 0.08;

                    // Перекрестие
                    ctx.strokeStyle = `rgba(150, 150, 170, ${opacity})`;
                    ctx.lineWidth = 1.2;

                    // Вертикальная линия
                    ctx.beginPath();
                    ctx.moveTo(x, y - patternSize/2.5);
                    ctx.lineTo(x, y + patternSize/2.5);
                    ctx.stroke();

                    // Горизонтальная линия
                    ctx.beginPath();
                    ctx.moveTo(x - patternSize/2.5, y);
                    ctx.lineTo(x + patternSize/2.5, y);
                    ctx.stroke();

                    // Угловые точки
                    ctx.fillStyle = `rgba(180, 180, 200, ${opacity})`;
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            requestAnimationFrame(animate);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate();
    }

    initStaticPattern();
});