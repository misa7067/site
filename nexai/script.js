document.addEventListener("DOMContentLoaded", function() {
    // ======================================================
    // ==== СКРИПТ АНИМАЦИИ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ ====
    // ======================================================
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

    // ======================================================
    // ========= ФОНОВАЯ АНИМАЦИЯ (CANVAS) =========
    // ======================================================
    function initStaticPattern() {
        const canvas = document.getElementById('patternCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let startTime = Date.now();

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function animate() {
            const currentTime = Date.now() - startTime;
            const normalizedTime = (currentTime * 0.0025) % (Math.PI * 2);

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const patternSize = 45;

            for (let x = patternSize; x < canvas.width; x += patternSize) {
                for (let y = patternSize; y < canvas.height; y += patternSize) {
                    const opacity = 0.1 + Math.sin(normalizedTime + x * 0.01 + y * 0.01) * 0.08;

                    ctx.strokeStyle = `rgba(150, 150, 170, ${opacity})`;
                    ctx.lineWidth = 1.2;

                    ctx.beginPath();
                    ctx.moveTo(x, y - patternSize/2.5);
                    ctx.lineTo(x, y + patternSize/2.5);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x - patternSize/2.5, y);
                    ctx.lineTo(x + patternSize/2.5, y);
                    ctx.stroke();

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
        animate();

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stopAnimation();
            } else {
                startTime = Date.now() - (startTime % (Math.PI * 2 * 1000));
                animate();
            }
        });
    }
    initStaticPattern();

    // ======================================================
    // ==== СЛАЙДЕР ПРОЕКТОВ ====
    // ======================================================
    function initProjectsSlider() {
        const track = document.querySelector('.projects-slider-track');
        if (!track) return;

        const slides = Array.from(track.querySelectorAll('.project-slide'));
        const nextButton = document.querySelector('.slider-arrow.next');
        const prevButton = document.querySelector('.slider-arrow.prev');

        if (slides.length === 0) return;

        let currentIndex = 0;

        function updateSlider() {
            const translateX = -currentIndex * 100;
            track.style.transform = `translateX(${translateX}%)`;
            updateButtons();
        }

        function updateButtons() {
            if (prevButton) {
                prevButton.style.opacity = currentIndex === 0 ? '0.3' : '1';
                prevButton.style.pointerEvents = currentIndex === 0 ? 'none' : 'all';
            }
            if (nextButton) {
                nextButton.style.opacity = currentIndex === slides.length - 1 ? '0.3' : '1';
                nextButton.style.pointerEvents = currentIndex === slides.length - 1 ? 'none' : 'all';
            }
        }

        function moveToSlide(index) {
            if (index >= 0 && index < slides.length) {
                currentIndex = index;
                updateSlider();
            }
        }

        updateSlider();

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentIndex < slides.length - 1) moveToSlide(currentIndex + 1);
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) moveToSlide(currentIndex - 1);
            });
        }

        let startX = 0, currentX = 0, isDragging = false;
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none';
        });
        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            track.style.transform = `translateX(${-currentIndex * 100 + (diff / track.offsetWidth) * 100}%)`;
        });
        track.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.3s ease';
            const diff = currentX - startX;
            if (diff > 50 && currentIndex > 0) {
                moveToSlide(currentIndex - 1);
            } else if (diff < -50 && currentIndex < slides.length - 1) {
                moveToSlide(currentIndex + 1);
            } else {
                updateSlider();
            }
        });
        window.addEventListener('resize', updateSlider);
    }
    initProjectsSlider();

    // ======================================================
    // ==== ЛОГИКА МОДАЛЬНОГО ОКНА (С ПОДДЕРЖКОЙ СМЕНЫ ТЕКСТА) ====
    // ======================================================
    const modalOverlay = document.getElementById('project-modal-overlay');
    const modal = document.getElementById('project-modal');

    if (modalOverlay && modal) {
        const closeModalBtn = modal.querySelector('.modal-close-btn');
        const modalTitle = modal.querySelector('.modal-title');
        const modalTags = modal.querySelector('.modal-tags');
        const modalDescription = modal.querySelector('.modal-description');
        const gridGallery = document.querySelector('.grid-gallery');
        const prevBtn = document.querySelector('.gallery-arrow.prev');
        const nextBtn = document.querySelector('.gallery-arrow.next');
        const counter = document.querySelector('.gallery-counter');
        const projectLinks = document.querySelectorAll('.project-card-link');

        let currentImages = [];
        let currentDescriptions = []; // Массив текстов для каждой страницы
        let currentPage = 0;

        function updateGallery() {
            gridGallery.innerHTML = '';
            const startIndex = currentPage * 3;
            const pageImages = currentImages.slice(startIndex, startIndex + 3);

            // ОБНОВЛЕНИЕ ТЕКСТА
            // Если для текущей страницы есть описание - показываем его, иначе показываем первое
            if (currentDescriptions[currentPage]) {
                modalDescription.innerHTML = currentDescriptions[currentPage];
            } else {
                modalDescription.innerHTML = currentDescriptions[0];
            }

            // СБРОС СТИЛЕЙ
            gridGallery.className = 'grid-gallery';
            gridGallery.removeAttribute('style');

            // ЛОГИКА РАСКЛАДКИ КАРТИНОК
            // Проверяем, это 4-й кейс (по названию)
// ЛОГИКА РАСКЛАДКИ КАРТИНОК
            // Проверяем, нужен ли специальный макет (Hardy или SmartEstate)
            const isSpecialLayout = currentImages.some(img =>
                img.includes('hardy') ||
                img.includes('rent')
            );

            if (isSpecialLayout && pageImages.length >= 3) {
                // СПЕЦИАЛЬНЫЙ МАКЕТ (2 слева, 1 справа)
                gridGallery.className = 'grid-gallery special-layout';

                // Левое верхнее фото (index 0)
                if (pageImages[0]) {
                    const leftTop = document.createElement('div');
                    leftTop.className = 'grid-item special-left-top';
                    leftTop.innerHTML = `<img src="${pageImages[0]}" alt="Img" loading="lazy"><div class="grid-caption"></div>`;
                    gridGallery.appendChild(leftTop);
                }
                // Левое нижнее фото (index 1)
                if (pageImages[1]) {
                    const leftBottom = document.createElement('div');
                    leftBottom.className = 'grid-item special-left-bottom';
                    leftBottom.innerHTML = `<img src="${pageImages[1]}" alt="Img" loading="lazy"><div class="grid-caption"></div>`;
                    gridGallery.appendChild(leftBottom);
                }
                // Правое большое фото (index 2)
                if (pageImages[2]) {
                    const rightLarge = document.createElement('div');
                    rightLarge.className = 'grid-item special-right-large';
                    rightLarge.innerHTML = `<img src="${pageImages[2]}" alt="Img" loading="lazy"><div class="grid-caption"></div>`;
                    gridGallery.appendChild(rightLarge);
                }
            } else if (pageImages.length >= 3) {
                // СТАНДАРТНЫЙ МАКЕТ (1 большая, 2 маленьких)
                gridGallery.className = 'grid-gallery standard-layout';
                if (pageImages[0]) {
                    const item = document.createElement('div');
                    item.className = 'grid-item large';
                    item.innerHTML = `<img src="${pageImages[0]}" alt="Img" loading="lazy"><div class="grid-caption"></div>`;
                    gridGallery.appendChild(item);
                }
                if (pageImages[1]) {
                    const item = document.createElement('div');
                    item.className = 'grid-item small';
                    item.innerHTML = `<img src="${pageImages[1]}" alt="Img" loading="lazy"><div class="grid-caption"></div>`;
                    gridGallery.appendChild(item);
                }
                if (pageImages[2]) {
                    const item = document.createElement('div');
                    item.className = 'grid-item small';
                    item.innerHTML = `<img src="${pageImages[2]}" alt="Img" loading="lazy"><div class="grid-caption"></div>`;
                    gridGallery.appendChild(item);
                }
            } else {
                // МЕНЬШЕ 3 КАРТИНОК
                pageImages.forEach((image) => {
                    const item = document.createElement('div');
                    item.className = 'grid-item';
                    item.style.height = '250px';
                    item.innerHTML = `<img src="${image}" alt="Img" loading="lazy"><div class="grid-caption"></div>`;
                    gridGallery.appendChild(item);
                });
            }

            const totalPages = Math.ceil(currentImages.length / 3);
            counter.textContent = `${currentPage + 1} / ${totalPages}`;

            // УПРАВЛЕНИЕ КНОПКАМИ
            const showControls = totalPages > 1;
            prevBtn.style.display = showControls ? 'flex' : 'none';
            nextBtn.style.display = showControls ? 'flex' : 'none';
            counter.style.display = showControls ? 'block' : 'none';

            prevBtn.style.opacity = currentPage === 0 ? '0.3' : '1';
            prevBtn.style.pointerEvents = currentPage === 0 ? 'none' : 'all';
            nextBtn.style.opacity = currentPage === totalPages - 1 ? '0.3' : '1';
            nextBtn.style.pointerEvents = currentPage === totalPages - 1 ? 'none' : 'all';
        }

        function nextPage() {
            if (currentPage < Math.ceil(currentImages.length / 3) - 1) {
                currentPage++;
                updateGallery();
            }
        }

        function prevPage() {
            if (currentPage > 0) {
                currentPage--;
                updateGallery();
            }
        }

        prevBtn.addEventListener('click', prevPage);
        nextBtn.addEventListener('click', nextPage);

        let touchStartX = 0;
        gridGallery.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
        gridGallery.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextPage();
                else prevPage();
            }
        });

        // ФУНКЦИЯ ОТКРЫТИЯ МОДАЛКИ
        const openModal = (cardLink) => {
            const title = cardLink.querySelector('.project-card-title').textContent;
            const tags = cardLink.dataset.tags || '';

            // ПОЛУЧАЕМ И РАЗБИВАЕМ ОПИСАНИЕ ПО РАЗДЕЛИТЕЛЮ "|||"
            const rawDescription = cardLink.dataset.fullDescription || '<p>Описание не найдено.</p>';
            currentDescriptions = rawDescription.split('|||');

            const images = cardLink.dataset.images || '';
            currentImages = images.split(',').map(url => url.trim()).filter(Boolean);
            currentPage = 0;

            // СБРОС
            gridGallery.style.display = '';
            gridGallery.className = 'grid-gallery';
            gridGallery.removeAttribute('style');

            updateGallery();

            modalTitle.textContent = title;
            modalTags.innerHTML = tags.split(',').map(tag => tag.trim() ? `<span>${tag.trim()}</span>` : '').join('');

            document.body.classList.add('modal-open');
            modalOverlay.classList.add('active');
            modal.classList.add('active');
        };

        const closeModal = () => {
            modal.classList.add('closing');
            modalOverlay.classList.add('closing');
            setTimeout(() => {
                document.body.classList.remove('modal-open');
                modalOverlay.classList.remove('active', 'closing');
                modal.classList.remove('active', 'closing');
            }, 300);
        };

        projectLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                openModal(link);
            });
        });

        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    }

    // ======================================================
    // ==== ПОЛНОЭКРАННЫЙ РЕЖИМ ====
    // ======================================================
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    if (fullscreenOverlay) {
        const fullscreenImage = fullscreenOverlay.querySelector('.fullscreen-image');
        const fullscreenCloseBtn = fullscreenOverlay.querySelector('.fullscreen-close-btn');
        const gridGallery = document.querySelector('.grid-gallery');

        function openFullscreen(imageSrc) {
            fullscreenImage.src = imageSrc;
            fullscreenOverlay.classList.add('active');
        }

        function closeFullscreen() {
            fullscreenOverlay.classList.remove('active');
        }

        if(gridGallery) {
            gridGallery.addEventListener('click', function(e) {
                if (e.target.tagName === 'IMG') {
                    openFullscreen(e.target.src);
                }
            });
        }

        fullscreenCloseBtn.addEventListener('click', closeFullscreen);
        fullscreenOverlay.addEventListener('click', e => { if (e.target === fullscreenOverlay) closeFullscreen(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && fullscreenOverlay.classList.contains('active')) closeFullscreen(); });
    }

    // ======================================================
    // ==== ПЛАВНЫЙ СКРОЛЛ ====
    // ======================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});