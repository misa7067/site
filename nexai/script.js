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
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let time = 0;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function animate() {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const patternSize = 45;
            const speed = 0.5; // Скорость движения

            // Увеличиваем время для бесконечной анимации
            time += speed;

            for (let x = patternSize; x < canvas.width; x += patternSize) {
                for (let y = patternSize; y < canvas.height; y += patternSize) {
                    // Используем time для создания бесконечного движения
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

            animationId = requestAnimationFrame(animate);
        }

        function stopAnimation() {
            cancelAnimationFrame(animationId);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Запускаем анимацию
        animate();

        // Останавливаем анимацию при скрытии страницы для оптимизации
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stopAnimation();
            } else {
                animate();
            }
        });
    }

    initStaticPattern();
});