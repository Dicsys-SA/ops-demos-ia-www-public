// =====================================================
// DICSYS PRESENTATION - INTERACTIVE SCRIPT
// =====================================================

// ===== CONFIGURACIÓN GLOBAL =====
const config = {
    mainSlides: [], // Se detectará automáticamente
    currentSlide: 1,
    currentMainIndex: 0,
    zoomLevel: 1
};

// ===== ELEMENTOS DEL DOM =====
const elements = {
    slides: document.querySelectorAll('.slide'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    dotsContainer: document.getElementById('dotsContainer'),
    imageModal: document.getElementById('imageModal'),
    modalImage: document.getElementById('modalImage'),
    closeModal: document.querySelector('.close-modal'),
    zoomInBtn: document.getElementById('zoomIn'),
    zoomOutBtn: document.getElementById('zoomOut'),
    zoomResetBtn: document.getElementById('zoomReset'),
    scrollIndicator: document.getElementById('scrollIndicator'),
    header: document.querySelector('.header')
};

// ===== INICIALIZACIÓN =====
function init() {
    detectSlides();
    createDots();
    attachEventListeners();
    updateNavigation();
    setupImageZoom();
    setupScrollIndicator();
    setupHeaderScroll();
    setupDebugPanel();
    console.log('✅ Presentación Dicsys inicializada correctamente');
    console.log(`📄 Slides detectados: ${config.mainSlides.length}`);
}

// ===== DETECTAR SLIDES AUTOMÁTICAMENTE =====
function detectSlides() {
    const allSlides = document.querySelectorAll('.slide[data-slide]');
    config.mainSlides = Array.from(allSlides).map(slide => {
        return parseInt(slide.getAttribute('data-slide'));
    }).sort((a, b) => a - b);

    if (config.mainSlides.length === 0) {
        console.error('❌ No se encontraron slides');
    }
}

// ===== CREAR DOTS DE NAVEGACIÓN =====
function createDots() {
    elements.dotsContainer.innerHTML = '';

    config.mainSlides.forEach((slideNum, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.setAttribute('data-slide', slideNum);
        dot.setAttribute('data-index', index);
        dot.setAttribute('title', `Ir a slide ${index + 1}`);

        if (index === 0) {
            dot.classList.add('active');
        }

        dot.addEventListener('click', () => {
            goToSlideByIndex(index);
        });

        elements.dotsContainer.appendChild(dot);
    });
}



// ===== ADJUNTAR EVENT LISTENERS =====
function attachEventListeners() {
    // Botones de navegación
    elements.prevBtn.addEventListener('click', previousSlide);
    elements.nextBtn.addEventListener('click', nextSlide);

    // Navegación con teclado
    document.addEventListener('keydown', handleKeyPress);

    // Modal de zoom
    elements.closeModal.addEventListener('click', closeImageModal);
    elements.imageModal.addEventListener('click', (e) => {
        if (e.target === elements.imageModal) {
            closeImageModal();
        }
    });

    // Controles de zoom
    elements.zoomInBtn.addEventListener('click', zoomIn);
    elements.zoomOutBtn.addEventListener('click', zoomOut);
    elements.zoomResetBtn.addEventListener('click', resetZoom);
}

// ===== NAVEGACIÓN ENTRE SLIDES =====
function goToSlideByIndex(index) {
    // Validar índice
    if (index < 0 || index >= config.mainSlides.length) {
        return;
    }

    const slideNum = config.mainSlides[index];

    // Ocultar slide actual
    document.querySelector('.slide.active')?.classList.remove('active');

    // Mostrar nuevo slide
    const targetSlide = document.querySelector(`.slide[data-slide="${slideNum}"]`);
    if (targetSlide) {
        targetSlide.classList.add('active');

        // Scroll suave al inicio del slide
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);

        // Resetear scroll del contenido si es scrollable
        const slideContent = targetSlide.querySelector('.slide-content');
        if (slideContent && slideContent.classList.contains('scrollable')) {
            slideContent.scrollTop = 0;
        }
    }

    // Actualizar estado
    config.currentSlide = slideNum;
    config.currentMainIndex = index;

    // Actualizar UI
    updateNavigation();
}



function previousSlide() {
    if (config.currentMainIndex > 0) {
        goToSlideByIndex(config.currentMainIndex - 1);
    }
}

function nextSlide() {
    if (config.currentMainIndex < config.mainSlides.length - 1) {
        goToSlideByIndex(config.currentMainIndex + 1);
    }
}

// ===== ACTUALIZAR NAVEGACIÓN =====
function updateNavigation() {
    // Actualizar botones
    elements.prevBtn.disabled = config.currentMainIndex === 0;
    elements.nextBtn.disabled = config.currentMainIndex === config.mainSlides.length - 1;

    // Actualizar dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === config.currentMainIndex);
    });
}



// ===== NAVEGACIÓN CON TECLADO =====
function handleKeyPress(e) {
    switch (e.key) {
        case 'ArrowLeft':
            previousSlide();
            break;
        case 'ArrowRight':
            nextSlide();
            break;
        case 'Home':
            goToSlideByIndex(0);
            break;
        case 'End':
            goToSlideByIndex(config.mainSlides.length - 1);
            break;
    }
}

// ===== ZOOM DE IMÁGENES =====
function setupImageZoom() {
    const zoomableImages = document.querySelectorAll('.zoomable');

    zoomableImages.forEach(img => {
        img.addEventListener('click', function () {
            openImageModal(this.src, this.alt);
        });
    });
}

// ===== SCROLL INDICATOR =====
function setupScrollIndicator() {
    // Mostrar indicador si hay scroll disponible
    function checkScrollable() {
        const activeSlide = document.querySelector('.slide.active');
        if (!activeSlide) return;

        const slideContent = activeSlide.querySelector('.slide-content');
        if (!slideContent) return;

        const isScrollable = slideContent.scrollHeight > slideContent.clientHeight;

        if (isScrollable) {
            elements.scrollIndicator.classList.add('show');
            // Ocultar después de 3 segundos
            setTimeout(() => {
                elements.scrollIndicator.classList.remove('show');
            }, 3000);
        } else {
            elements.scrollIndicator.classList.remove('show');
        }
    }

    // Verificar al cambiar de slide
    const observer = new MutationObserver(checkScrollable);
    observer.observe(document.querySelector('.slides-container'), {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    // Verificar inicialmente
    setTimeout(checkScrollable, 500);
}

// ===== HEADER SCROLL =====
function setupHeaderScroll() {
    // Header siempre visible - no se oculta con scroll
    if (elements.header) {
        elements.header.style.opacity = '1';
        elements.header.style.pointerEvents = 'auto';
    }
}

function openImageModal(src, alt) {
    elements.modalImage.src = src;
    elements.modalImage.alt = alt;
    elements.imageModal.classList.add('show');
    config.zoomLevel = 1;
    updateImageZoom();

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    elements.imageModal.classList.remove('show');
    config.zoomLevel = 1;

    // Restaurar scroll del body
    document.body.style.overflow = '';
}

function zoomIn() {
    if (config.zoomLevel < 3) {
        config.zoomLevel += 0.2;
        updateImageZoom();
    }
}

function zoomOut() {
    if (config.zoomLevel > 0.5) {
        config.zoomLevel -= 0.2;
        updateImageZoom();
    }
}

function resetZoom() {
    config.zoomLevel = 1;
    updateImageZoom();
}

function updateImageZoom() {
    elements.modalImage.style.transform = `scale(${config.zoomLevel})`;
}

// ===== UTILIDADES =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Agregar indicador de carga para imágenes
function addImageLoadingIndicators() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        if (!img.complete) {
            img.style.opacity = '0.5';

            img.addEventListener('load', function () {
                this.style.opacity = '1';
                this.style.transition = 'opacity 0.3s ease';
            });

            img.addEventListener('error', function () {
                console.error(`Error al cargar imagen: ${this.src}`);
                this.style.opacity = '0.3';
            });
        }
    });
}

// ===== ANIMACIONES DE ENTRADA =====
function animateSlideContent() {
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;

    const cards = activeSlide.querySelectorAll('.card, .benefit-card');

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ===== INFORMACIÓN DE DEBUG (DESARROLLO) =====
function logDebugInfo() {
    console.log('📊 Estado de la presentación:');
    console.log(`   - Slide actual: ${config.currentSlide}`);
    console.log(`   - Índice en flujo principal: ${config.currentMainIndex}`);
    console.log(`   - Total slides principales: ${config.mainSlides.length}`);
}

// ===== INICIAR APLICACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    init();
    addImageLoadingIndicators();
    animateSlideContent();

    // Log debug info (comentar en producción)
    // logDebugInfo();
});

// ===== MANEJO DE REDIMENSIONAMIENTO =====
window.addEventListener('resize', debounce(() => {
    // Ajustar elementos si es necesario
    console.log('🔄 Ventana redimensionada');
}, 250));

// ===== DEBUG PANEL =====
function setupDebugPanel() {
    const debugContent = document.getElementById('debugContent');
    const header = document.getElementById('mainHeader');
    const slidesContainer = document.querySelector('.slides-container');

    function updateDebug() {
        if (!debugContent || !header) return;

        const headerStyles = window.getComputedStyle(header);
        const headerRect = header.getBoundingClientRect();
        const bodyHeight = document.body.scrollHeight;
        const windowHeight = window.innerHeight;

        debugContent.innerHTML = `
            <div style="margin-bottom: 8px;">
                <strong style="color: #EE8844;">Header Position:</strong><br>
                ${headerStyles.position}
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #EE8844;">Header Rect Top:</strong><br>
                ${headerRect.top.toFixed(2)}px
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #EE8844;">Window Scroll Y:</strong><br>
                ${window.scrollY}px
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #EE8844;">Container Scroll:</strong><br>
                ${slidesContainer ? slidesContainer.scrollTop : 0}px
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #EE8844;">Body Height:</strong><br>
                ${bodyHeight}px
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #EE8844;">Window Height:</strong><br>
                ${windowHeight}px
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #EE8844;">Scrollable:</strong><br>
                ${bodyHeight > windowHeight ? 'YES' : 'NO'}
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #EE8844;">Current Slide:</strong><br>
                ${config.currentSlide}
            </div>
        `;
    }

    // Actualizar cada 500ms
    setInterval(updateDebug, 500);
    updateDebug();

    // También actualizar en scroll
    window.addEventListener('scroll', updateDebug);
    if (slidesContainer) {
        slidesContainer.addEventListener('scroll', updateDebug);
    }
}

// ===== EXPORTAR FUNCIONES GLOBALES (OPCIONAL) =====
window.presentationAPI = {
    goToSlide: goToSlideByIndex,
    getCurrentSlide: () => config.currentSlide,
    getTotalSlides: () => config.mainSlides.length,
    next: nextSlide,
    previous: previousSlide
};
