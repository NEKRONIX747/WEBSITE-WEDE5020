// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality based on current page
    initializeNavigationHighlighting();
    initializeSmoothScrolling();
    initializeImageLoading();
    
    // Page-specific initializations
    if (document.querySelector('.events-page')) {
        initializeEventsCalendar();
    }
    
    if (document.querySelector('.contact-page')) {
        initializeContactPage();
    }
    
    if (document.querySelector('.products')) {
        initializeProductSearch();
    }
    
    if (document.querySelector('.message-form')) {
        initializeContactForm();
    }
    
    if (document.querySelectorAll('.product-card details').length > 0) {
        initializeProductDetails();
    }
    
    // Initialize lightbox gallery if on home page
    if (document.querySelector('.home') && document.getElementById('lightbox')) {
        initializeLightboxGallery();
    }
});

// Events Calendar Functionality
function initializeEventsCalendar() {
    const eventForm = document.getElementById('event-form');
    const eventDate = document.getElementById('event-date');
    const eventText = document.getElementById('event-text');
    const eventList = document.getElementById('event-list');
    const calendarTitle = document.getElementById('calendar-title');
    const calendarGrid = document.getElementById('calendar-grid');
    const clearEventsBtn = document.getElementById('clear-events');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let events = JSON.parse(localStorage.getItem('events')) || [];
    let currentDate = new Date();

    // Weekday names
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function saveEvents() {
        localStorage.setItem('events', JSON.stringify(events));
    }

    function renderEvents() {
        if (!eventList) return;
        
        eventList.innerHTML = '';
        if (events.length === 0) {
            eventList.innerHTML = '<p>No events scheduled yet. Add your first event below!</p>';
        } else {
            // Sort events by date
            events.sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateA - dateB;
            });

            events.forEach((event, index) => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event-item';
                eventDiv.innerHTML = `
                    <div>
                        <strong>${event.date}</strong>: ${event.text}
                    </div>
                    <button onclick="removeEvent(${index})">Remove</button>
                `;
                eventList.appendChild(eventDiv);
            });
        }
    }

    function renderCalendar() {
        if (!calendarTitle || !calendarGrid) return;
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        const today = new Date();
        
        calendarTitle.textContent = `${monthName} ${year}`;
        calendarGrid.innerHTML = '';

        // Add weekday headers
        const weekdaysContainer = document.createElement('div');
        weekdaysContainer.className = 'calendar-weekdays';
        weekdays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'weekday';
            dayElement.textContent = day;
            weekdaysContainer.appendChild(dayElement);
        });
        calendarGrid.parentNode.insertBefore(weekdaysContainer, calendarGrid);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const blankCell = document.createElement('div');
            blankCell.className = 'calendar-cell empty';
            calendarGrid.appendChild(blankCell);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            
            // Check if this is today
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }
            
            const dayNumber = document.createElement('div');
            dayNumber.textContent = day;
            dayNumber.style.fontWeight = 'bold';
            cell.appendChild(dayNumber);

            const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
            
            // Add event marker if there's an event on this date
            const dayEvents = events.filter(event => event.date === dateStr);
            if (dayEvents.length > 0) {
                const eventMarker = document.createElement('span');
                eventMarker.className = 'event-marker';
                eventMarker.textContent = '★';
                eventMarker.title = dayEvents.map(e => e.text).join(', ');
                cell.appendChild(eventMarker);
                
                // Add click to view events
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', () => {
                    alert(`Events on ${dateStr}:\n${dayEvents.map(e => `• ${e.text}`).join('\n')}`);
                });
            }

            calendarGrid.appendChild(cell);
        }
    }

    // Event listeners
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate date format
            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!dateRegex.test(eventDate.value)) {
                alert('Please enter date in DD/MM/YYYY format');
                return;
            }
            
            events.push({
                date: eventDate.value,
                text: eventText.value
            });
            saveEvents();
            renderEvents();
            renderCalendar();
            eventForm.reset();
            
            // Show success message
            alert('Event added successfully!');
        });
    }

    if (clearEventsBtn) {
        clearEventsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all events? This action cannot be undone.')) {
                events = [];
                saveEvents();
                renderEvents();
                renderCalendar();
                alert('All events have been cleared.');
            }
        });
    }

    // Initial render
    renderEvents();
    renderCalendar();
}

// Global function for removing events (must be in global scope)
window.removeEvent = function(index) {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    if (confirm('Are you sure you want to remove this event?')) {
        events.splice(index, 1);
        localStorage.setItem('events', JSON.stringify(events));
        
        // Re-render events and calendar
        const eventList = document.getElementById('event-list');
        const calendarGrid = document.getElementById('calendar-grid');
        
        if (eventList && calendarGrid) {
            // Re-initialize the calendar to reflect changes
            initializeEventsCalendar();
        }
    }
};

// Contact Form Handler
function initializeContactForm() {
    const contactForm = document.querySelector('.message-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Here you would typically send the data to a server
            // For now, we'll just show a success message
            alert('Thank you for your message, ' + name + '! We will get back to you soon.');
            contactForm.reset();
        });
    }
}

// Contact Page Map Functionality
function initializeContactPage() {
    // Map button functionality for embedded Google Maps
    const getDirectionsBtn = document.getElementById('getDirections');
    const viewLargerBtn = document.getElementById('viewLarger');

    if (getDirectionsBtn) {
        getDirectionsBtn.addEventListener('click', function() {
            const destination = '24 Phipson Road, Scotsville, Pietermaritzburg, 3201, South Africa';
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
            window.open(url, '_blank');
        });
    }

    if (viewLargerBtn) {
        viewLargerBtn.addEventListener('click', function() {
            const url = 'https://www.google.com/maps/place/24+Phipson+Rd,+Scotsville,+Pietermaritzburg,+3201';
            window.open(url, '_blank');
        });
    }
}

// Product Search and Filter Functionality
function initializeProductSearch() {
    const productSearch = document.getElementById('productSearch');
    const searchButton = document.getElementById('searchButton');
    const clearSearch = document.getElementById('clearSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortOptions = document.getElementById('sortOptions');
    const productGrid = document.getElementById('productGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    const resetSearch = document.getElementById('resetSearch');
    
    const productCards = Array.from(productGrid.getElementsByClassName('product-card'));

    function filterProducts() {
        const searchTerm = productSearch.value.toLowerCase();
        const category = categoryFilter.value;
        const sortBy = sortOptions.value;
        
        let filteredProducts = productCards.filter(card => {
            const matchesSearch = card.dataset.name.includes(searchTerm) || 
                                 card.querySelector('summary').textContent.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || card.dataset.category === category;
            
            return matchesSearch && matchesCategory;
        });

        // Sort products
        filteredProducts.sort((a, b) => {
            switch(sortBy) {
                case 'name':
                    return a.dataset.name.localeCompare(b.dataset.name);
                case 'category':
                    return a.dataset.category.localeCompare(b.dataset.category);
                case 'popular':
                    return parseInt(b.dataset.popularity) - parseInt(a.dataset.popularity);
                default:
                    return 0;
            }
        });

        // Update display
        productCards.forEach(card => {
            card.style.display = 'none';
            card.classList.remove('highlight');
        });

        filteredProducts.forEach(card => {
            card.style.display = 'block';
            if (searchTerm) {
                card.classList.add('highlight');
            }
        });

        // Show/hide no results message
        if (filteredProducts.length === 0) {
            noResults.style.display = 'block';
            productGrid.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            productGrid.style.display = 'flex';
        }

        // Update results count
        const totalProducts = productCards.length;
        const showingProducts = filteredProducts.length;
        
        if (showingProducts === totalProducts && !searchTerm && category === 'all') {
            resultsCount.textContent = `Showing all ${totalProducts} products`;
        } else {
            resultsCount.textContent = `Showing ${showingProducts} of ${totalProducts} products`;
        }
    }

    // Event listeners
    if (productSearch) {
        productSearch.addEventListener('input', filterProducts);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', filterProducts);
    }
    
    if (clearSearch) {
        clearSearch.addEventListener('click', function() {
            productSearch.value = '';
            categoryFilter.value = 'all';
            sortOptions.value = 'name';
            filterProducts();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (sortOptions) {
        sortOptions.addEventListener('change', filterProducts);
    }
    
    if (resetSearch) {
        resetSearch.addEventListener('click', function() {
            productSearch.value = '';
            categoryFilter.value = 'all';
            sortOptions.value = 'name';
            filterProducts();
        });
    }

    // Initialize
    filterProducts();
}

// Product Details Toggle
function initializeProductDetails() {
    const productDetails = document.querySelectorAll('.product-card details');
    
    productDetails.forEach(details => {
        details.addEventListener('toggle', function() {
            if (this.open) {
                // Optional: Add any additional behavior when details are opened
                console.log('Product details opened:', this.querySelector('summary').textContent);
            }
        });
    });
}

// Smooth Scrolling for Navigation
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal anchor links
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Image Lazy Loading Enhancement
function initializeImageLoading() {
    const images = document.querySelectorAll('img');
    
    // Add loading="lazy" to all images for better performance
    images.forEach(img => {
        if (!img.getAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
}

// Active Navigation Highlighting
function initializeNavigationHighlighting() {
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Lightbox Gallery Functionality
function initializeLightboxGallery() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxCounter = document.querySelector('.lightbox-counter');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    let currentIndex = 0;
    let images = [];

    // Collect all gallery images
    galleryItems.forEach(item => {
        images.push({
            src: item.src,
            alt: item.alt,
            index: parseInt(item.dataset.index)
        });
    });

    // Sort images by index
    images.sort((a, b) => a.index - b.index);

    // Add click event to all gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            openLightbox(index);
        });

        // Add keyboard accessibility
        item.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const index = parseInt(this.dataset.index);
                openLightbox(index);
            }
        });

        // Add tabindex for accessibility
        item.setAttribute('tabindex', '0');
    });

    function openLightbox(index) {
        currentIndex = index;
        updateLightboxImage();
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Set focus for accessibility
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }

    function updateLightboxImage() {
        const currentImage = images[currentIndex];
        lightboxImage.src = currentImage.src;
        lightboxImage.alt = currentImage.alt;
        lightboxCaption.textContent = currentImage.alt;
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    }

    function showNextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightboxImage();
    }

    function showPrevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    // Event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);

    // Close lightbox when clicking on the background
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'block') {
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    showPrevImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
            }
        }
    });

    // Prevent lightbox from closing when clicking on the image
    lightboxImage.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}