document.addEventListener("DOMContentLoaded", function() {
    // ======================================================
    // ==== СКРИПТ АНИМАЦИИ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ ====
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
    // ========= СКРИПТ ДЛЯ ГЕОМЕТРИЧЕСКОГО ФОНА =========
    // ======================================================
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
            const speed = 0.1;

            time += speed;

            for (let x = patternSize; x < canvas.width; x += patternSize) {
                for (let y = patternSize; y < canvas.height; y += patternSize) {
                    const opacity = 0.1 + Math.sin(time * 0.8 + x * 0.01 + y * 0.01) * 0.08;

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
                animate();
            }
        });
    }

    initStaticPattern();

    // ======================================================
    // ==== ГОРИЗОНТАЛЬНЫЙ СЛАЙДЕР ПРОЕКТОВ ====
    // ======================================================
    function initProjectsSlider() {
        const track = document.querySelector('.projects-slider-track');
        if (!track) return;

        const slides = Array.from(track.querySelectorAll('.project-slide'));
        const nextButton = document.querySelector('#projects .slider-arrow.next');
        const prevButton = document.querySelector('#projects .slider-arrow.prev');

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
                if (currentIndex < slides.length - 1) {
                    moveToSlide(currentIndex + 1);
                }
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    moveToSlide(currentIndex - 1);
                }
            });
        }

        // Добавляем обработчики для свайпа на мобильных устройствах
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
            track.style.transition = 'none';
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const translateX = -currentIndex * 100 + (diff / track.offsetWidth) * 100;
            track.style.transform = `translateX(${translateX}%)`;
        });

        track.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.3s ease';

            const diff = currentX - startX;
            const threshold = 50;

            if (diff > threshold && currentIndex > 0) {
                moveToSlide(currentIndex - 1);
            } else if (diff < -threshold && currentIndex < slides.length - 1) {
                moveToSlide(currentIndex + 1);
            } else {
                updateSlider();
            }
        });

        window.addEventListener('resize', updateSlider);
    }

    // Запускаем слайдер
    initProjectsSlider();

    // ======================================================
    // ==== ЛОГИКА ДЛЯ МОДАЛЬНОГО ОКНА ====
    // ======================================================

    const modalOverlay = document.getElementById('project-modal-overlay');
    const modal = document.getElementById('project-modal');

    // --- Логика модального окна ---
    if (modalOverlay && modal) {
        const closeModalBtn = modal.querySelector('.modal-close-btn');
        const modalTitle = modal.querySelector('.modal-title');
        const modalTags = modal.querySelector('.modal-tags');
        const modalDescription = modal.querySelector('.modal-description');
        const galleryPrevBtn = modal.querySelector('.modal-gallery-arrow.prev');
        const galleryNextBtn = modal.querySelector('.modal-gallery-arrow.next');
        const galleryCounter = modal.querySelector('.modal-gallery-counter');
        const splitLayout = modal.querySelector('.split-layout');
        const projectLinks = document.querySelectorAll('.project-card-link');

        let currentImages = [];
        let currentImageIndex = 0;

        function showImage(index) {
            const images = currentImages;
            const totalSplitSlides = Math.floor(images.length / 3);
            const remainingSinglePhotos = images.length % 3;

            if (index < totalSplitSlides) {
                splitLayout.style.display = 'flex';
                hideRegularImage();
                const startIndex = index * 3;
                const leftTopImg = document.querySelector('.left-side .top-half .split-image');
                const leftBottomImg = document.querySelector('.left-side .bottom-half .split-image');
                const rightFullImg = document.querySelector('.right-side .full-image');

                if (leftTopImg && leftBottomImg && rightFullImg) {
                    leftTopImg.src = images[startIndex];
                    leftBottomImg.src = images[startIndex + 1];
                    rightFullImg.src = images[startIndex + 2];
                }
            } else {
                splitLayout.style.display = 'none';
                const singlePhotoIndex = totalSplitSlides * 3 + (index - totalSplitSlides);
                showRegularImage(images[singlePhotoIndex]);
            }
            updateCounterAndArrows(index, images.length);
        }

        function hideRegularImage() {
            const regularImage = document.querySelector('.modal-image.regular');
            if (regularImage) regularImage.style.display = 'none';
        }

        function showRegularImage(src) {
            let regularImage = document.querySelector('.modal-image.regular');
            if (!regularImage) {
                regularImage = document.createElement('img');
                regularImage.className = 'modal-image regular';
                regularImage.alt = 'Изображение проекта';
                Object.assign(regularImage.style, {
                    width: '100%',
                    aspectRatio: '16/9',
                    objectFit: 'contain',
                    borderRadius: '8px'
                });
                document.querySelector('.modal-gallery-wrapper').insertBefore(regularImage, galleryPrevBtn);
            }
            regularImage.style.display = 'block';
            regularImage.src = src || '';
        }

        function updateCounterAndArrows(index, totalImages) {
            const totalSplitSlides = Math.floor(totalImages / 3);
            const remainingSinglePhotos = totalImages % 3;
            const totalSlides = totalSplitSlides + remainingSinglePhotos;

            galleryCounter.textContent = `${index + 1} / ${totalSlides}`;
            galleryPrevBtn.classList.toggle('visible', index > 0);
            galleryNextBtn.classList.toggle('visible', index < totalSlides - 1);
        }

        galleryNextBtn.addEventListener('click', () => {
            const totalSplitSlides = Math.floor(currentImages.length / 3);
            const remainingSinglePhotos = currentImages.length % 3;
            const totalSlides = totalSplitSlides + remainingSinglePhotos;
            if (currentImageIndex < totalSlides - 1) {
                currentImageIndex++;
                showImage(currentImageIndex);
            }
        });

        galleryPrevBtn.addEventListener('click', () => {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                showImage(currentImageIndex);
            }
        });

        const openModal = (cardLink) => {
            const title = cardLink.querySelector('.project-card-title').textContent;
            const tagsString = cardLink.dataset.tags || '';
            const fullDescription = cardLink.dataset.fullDescription || '<p>Описание не найдено.</p>';
            const imagesString = cardLink.dataset.images || '';

            currentImages = imagesString.split(',').map(url => url.trim()).filter(url => url);
            currentImageIndex = 0;

            const oldRegularImage = document.querySelector('.modal-image.regular');
            if (oldRegularImage) oldRegularImage.remove();

            modalTitle.textContent = title;
            modalDescription.innerHTML = fullDescription;

            modalTags.innerHTML = '';
            tagsString.split(',').forEach(tagText => {
                if (tagText) {
                    const tagElement = document.createElement('span');
                    tagElement.textContent = tagText.trim();
                    modalTags.appendChild(tagElement);
                }
            });

            const totalSplitSlides = Math.floor(currentImages.length / 3);
            const remainingSinglePhotos = currentImages.length % 3;
            const totalSlides = totalSplitSlides + remainingSinglePhotos;

            if (totalSlides > 1) {
                galleryCounter.classList.add('visible');
                showImage(currentImageIndex);
            } else if (currentImages.length > 0) {
                showImage(currentImageIndex);
                galleryPrevBtn.classList.remove('visible');
                galleryNextBtn.classList.remove('visible');
                galleryCounter.classList.remove('visible');
            } else {
                splitLayout.style.display = 'none';
                hideRegularImage();
                galleryPrevBtn.classList.remove('visible');
                galleryNextBtn.classList.remove('visible');
                galleryCounter.classList.remove('visible');
            }

            document.body.classList.add('modal-open');
            modalOverlay.classList.add('active');
            modal.classList.add('active');
        };

        const closeModal = () => {
            document.body.classList.remove('modal-open');
            modalOverlay.classList.remove('active');
            modal.classList.remove('active');
        };

        projectLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(link);
            });
        });

        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
        });
    }
    // ======================================================
    // ==== ПОЛНОЭКРАННЫЙ РЕЖИМ ДЛЯ ИЗОБРАЖЕНИЙ ====
    // ======================================================

    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenImage = document.querySelector('.fullscreen-image');
    const fullscreenCloseBtn = document.querySelector('.fullscreen-close-btn');

    if (fullscreenOverlay && fullscreenImage) {
        function openFullscreen(imageSrc) {
            fullscreenImage.src = imageSrc;
            fullscreenOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeFullscreen() {
            fullscreenOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Обработчики кликов на изображения в модалке
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-image') &&
                modalOverlay && modalOverlay.classList.contains('active')) {
                openFullscreen(e.target.src);
            }
        });

        // Обработчики закрытия
        fullscreenCloseBtn.addEventListener('click', closeFullscreen);
        fullscreenOverlay.addEventListener('click', function(e) {
            if (e.target === fullscreenOverlay) closeFullscreen();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && fullscreenOverlay.classList.contains('active')) {
                closeFullscreen();
            }
        });
    }
    // ======================================================
    // ==== ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ ====
    // ======================================================

    // Плавная прокрутка для навигационных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});