document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initializeApp();
    
    // Configure event listeners for navigation
    setupNavigation();
    
    // Load the initial page (homepage by default)
    checkCurrentPage();
    
    // Setup product interactions
    setupProductInteractions();
    
    // Setup login tabs
    setupLoginTabs();
    
    // Setup dashboard navigation
    setupDashboardNav();
    
    // Initialize cart
    updateCartCounter();
    
    // Update wishlist buttons
    updateWishlistButtons();
    
    // Setup cart functionality
    setupCartFunctionality();
    
    // Mobile dashboard menu
    initMobileDashboard();
});

// Initialize the app
function initializeApp() {
    console.log('GreenBuy App Initialized');
}

// Initialize mobile dashboard functionality
function initMobileDashboard() {
    const mobileMoreBtn = document.getElementById('mobile-more-btn');
    if (mobileMoreBtn) {
        mobileMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mobileMoreMenu = document.getElementById('mobile-more-menu');
            if (mobileMoreMenu) {
                mobileMoreMenu.classList.toggle('hidden');
            }
        });
    }
    
    // Close more menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#mobile-more-btn') && !e.target.closest('#mobile-more-menu')) {
            const mobileMoreMenu = document.getElementById('mobile-more-menu');
            if (mobileMoreMenu && !mobileMoreMenu.classList.contains('hidden')) {
                mobileMoreMenu.classList.add('hidden');
            }
        }
    });
}

// Setup cart functionality
function setupCartFunctionality() {
    // Cart quantity buttons
    const cartItems = document.querySelectorAll('.cart-item');
    
    cartItems.forEach(item => {
        const minusBtn = item.querySelector('.cart-qty-btn.minus');
        const plusBtn = item.querySelector('.cart-qty-btn.plus');
        const qtyInput = item.querySelector('.cart-qty');
        const removeBtn = item.querySelector('.cart-remove-btn');
        const saveBtn = item.querySelector('.cart-save-btn');
        
        if (minusBtn && plusBtn && qtyInput) {
            // Minus button
            minusBtn.addEventListener('click', () => {
                let qty = parseInt(qtyInput.value);
                if (qty > 1) {
                    qtyInput.value = qty - 1;
                    updateCartItemQuantity(item.getAttribute('data-product-id'), qty - 1);
                }
            });
            
            // Plus button
            plusBtn.addEventListener('click', () => {
                let qty = parseInt(qtyInput.value);
                qtyInput.value = qty + 1;
                updateCartItemQuantity(item.getAttribute('data-product-id'), qty + 1);
            });
            
            // Quantity input change
            qtyInput.addEventListener('change', () => {
                let qty = parseInt(qtyInput.value);
                if (qty < 1) {
                    qtyInput.value = 1;
                    qty = 1;
                }
                updateCartItemQuantity(item.getAttribute('data-product-id'), qty);
            });
        }
        
        // Remove button
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                removeFromCart(item.getAttribute('data-product-id'));
                item.remove();
                updateCartTotals();
            });
        }
        
        // Save for later button
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                toggleWishlist(item.getAttribute('data-product-id'));
                removeFromCart(item.getAttribute('data-product-id'));
                item.remove();
                updateCartTotals();
            });
        }
    });
    
    // Clear cart button
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                localStorage.removeItem('cartItems');
                document.querySelectorAll('.cart-item').forEach(item => item.remove());
                updateCartTotals(0, 0, 0);
                updateCartCounter();
            }
        });
    }
    
    // Apply promo button
    const applyPromoBtn = document.querySelector('.apply-promo-btn');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', () => {
            const promoInput = document.querySelector('.promo-input');
            if (promoInput && promoInput.value) {
                showToast('Promo code applied!');
                // Here you would normally apply the discount
                updateCartTotals();
            } else {
                showToast('Please enter a promo code', 'error');
            }
        });
    }
    
    // Update cart totals initially
    updateCartTotals();
}

// Update cart item quantity
function updateCartItemQuantity(itemId, quantity) {
    const cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
        cartItems[itemIndex].quantity = quantity;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        // Update UI
        updateCartTotals();
        updateCartCounter();
    }
}

// Remove item from cart
function removeFromCart(itemId) {
    const cartItems = getCartItems();
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    
    // Update UI
    updateCartCounter();
    
    showToast('Item removed from cart');
}

// Calculate and update cart totals
function updateCartTotals() {
    const cartItems = getCartItems();
    
    const subtotal = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
        return sum + (price * item.quantity);
    }, 0);
    
    // Calculate shipping (free for orders over ₹10,000)
    const shipping = subtotal > 10000 ? 0 : 499;
    
    // Calculate tax (9% for example)
    const tax = subtotal * 0.09;
    
    // Total
    const total = subtotal + shipping + tax;
    
    // Update UI
    const subtotalElem = document.querySelector('.cart-subtotal');
    const shippingElem = document.querySelector('.cart-shipping');
    const taxElem = document.querySelector('.cart-tax');
    const totalElem = document.querySelector('.cart-total');
    
    if (subtotalElem) subtotalElem.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (shippingElem) shippingElem.textContent = shipping > 0 ? `₹${shipping.toLocaleString('en-IN')}` : 'Free';
    if (taxElem) taxElem.textContent = `₹${tax.toLocaleString('en-IN')}`;
    if (totalElem) totalElem.textContent = `₹${total.toLocaleString('en-IN')}`;
}

// Set up navigation event listeners
function setupNavigation() {
    // Nav links click handler
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            const category = this.getAttribute('data-category');
            navigateToPage(page, category);
        });
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            navigateToPage(event.state.page, event.state.category, false);
        }
    });
}

function initPage() {
    // Setup navigation
    setupNavigation();
    
    // Setup login/register tabs
    setupLoginTabs();
    
    // Setup dashboard navigation
    setupDashboardNav();
    
    // Initialize product interactions
    setupProductInteractions();
    
    // Initialize cart
    updateCartCounter();
    
    // Update wishlist buttons
    updateWishlistButtons();
    
    // Initialize based on current page
    checkCurrentPage();
}

function setupNavigation() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Page navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            const category = link.getAttribute('data-category');
            if (targetPage) {
                navigateToPage(targetPage, category);
            }
        });
    });
}

function setupLoginTabs() {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    
    if (loginTab && registerTab && loginForm && registerForm) {
        // Switch to login tab
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('border-green-600', 'text-green-600');
            loginTab.classList.remove('border-gray-200', 'text-gray-500');
            registerTab.classList.add('border-gray-200', 'text-gray-500');
            registerTab.classList.remove('border-green-600', 'text-green-600');
            
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });
        
        // Switch to register tab
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('border-green-600', 'text-green-600');
            registerTab.classList.remove('border-gray-200', 'text-gray-500');
            loginTab.classList.add('border-gray-200', 'text-gray-500');
            loginTab.classList.remove('border-green-600', 'text-green-600');
            
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
        
        // "Register now" link
        if (goToRegister) {
            goToRegister.addEventListener('click', () => {
                registerTab.click();
            });
        }
        
        // "Login" link
        if (goToLogin) {
            goToLogin.addEventListener('click', () => {
                loginTab.click();
            });
        }
        
        // Login form submission
        const loginSubmit = document.getElementById('login-submit');
        if (loginSubmit) {
            loginSubmit.addEventListener('click', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                if (!email || !password) {
                    showToast('Please fill in all fields', 'error');
                    return;
                }
                
                // Simulate login for demo
                const userData = {
                    displayName: 'John Doe',
                    email: email
                };
                
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userData', JSON.stringify(userData));
                
                showToast('Login successful!');
                setTimeout(() => {
                    updateAuthUI(true, userData);
                    navigateToPage('dashboard');
                }, 1000);
            });
        }
        
        // Register form submission
        const registerSubmit = document.getElementById('register-submit');
        if (registerSubmit) {
            registerSubmit.addEventListener('click', (e) => {
                e.preventDefault();
                const firstName = document.getElementById('first-name').value;
                const lastName = document.getElementById('last-name').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                const agreeTerms = document.getElementById('agree-terms').checked;
                
                if (!firstName || !lastName || !email || !password || !confirmPassword) {
                    showToast('Please fill in all fields', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showToast('Passwords do not match', 'error');
                    return;
                }
                
                if (!agreeTerms) {
                    showToast('Please agree to the terms and conditions', 'error');
                    return;
                }
                
                // Simulate registration for demo
                const userData = {
                    displayName: `${firstName} ${lastName}`,
                    email: email
                };
                
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userData', JSON.stringify(userData));
                
                showToast('Registration successful!');
                setTimeout(() => {
                    updateAuthUI(true, userData);
                    navigateToPage('dashboard');
                }, 1000);
            });
        }
    }
}

function setupDashboardNav() {            
    const dashboardNavItems = document.querySelectorAll('.dashboard-nav-item');                        
    dashboardNavItems.forEach(item => {                
        item.addEventListener('click', (e) => {                    
            e.preventDefault();                                        
            // Remove active class from all items (both desktop and mobile)                    
            document.querySelectorAll('.dashboard-nav-item').forEach(navItem => {                        
                navItem.classList.remove('bg-green-100', 'text-green-800');                                                
                // Different styling for mobile vs desktop                        
                if (navItem.closest('.dashboard-mobile-tabs') || navItem.closest('#mobile-more-menu')) {                            
                    navItem.classList.add('text-gray-700');                        
                } else {                            
                    navItem.classList.add('text-gray-700', 'hover:bg-gray-100');                        
                }                    
            });                                        
            // Add active class to clicked item                    
            item.classList.add('bg-green-100', 'text-green-800');                    
            item.classList.remove('text-gray-700', 'hover:bg-gray-100');                                        
            // Show corresponding section                    
            const sectionName = item.getAttribute('data-section');                                        
            // Special handling for "more" section in mobile                    
            if (sectionName === 'more') {                        
                const mobileMoreMenu = document.getElementById('mobile-more-menu');                        
                if (mobileMoreMenu) {                            
                    mobileMoreMenu.classList.toggle('hidden');                        
                }                    
            } else {                        
                // If mobile more menu is visible, hide it                        
                const mobileMoreMenu = document.getElementById('mobile-more-menu');                        
                if (mobileMoreMenu && !mobileMoreMenu.classList.contains('hidden')) {                            
                    mobileMoreMenu.classList.add('hidden');                        
                }                                                
                showDashboardSection(sectionName);                    
            }                                        
            // Update mobile tabs if this was clicked from desktop                    
            if (!item.closest('.dashboard-mobile-tabs') && !item.closest('#mobile-more-menu')) {                        
                updateMobileTabsFromDesktop(sectionName);                    
            }                
        });            
    });                        
    // Mobile more menu button            
    const mobileMoreBtn = document.getElementById('mobile-more-btn');            
    if (mobileMoreBtn) {                
        mobileMoreBtn.addEventListener('click', (e) => {                    
            e.preventDefault();                    
            const mobileMoreMenu = document.getElementById('mobile-more-menu');                    
            if (mobileMoreMenu) {                        
                mobileMoreMenu.classList.toggle('hidden');                    
            }                
        });            
    }                        
    // Logout button            
    const logoutBtn = document.getElementById('logout-btn');            
    if (logoutBtn) {                
        logoutBtn.addEventListener('click', (e) => {                    
            e.preventDefault();                                        
            // Clear user data                    
            localStorage.removeItem('isLoggedIn');                    
            localStorage.removeItem('userData');                                        
            showToast('Logged out successfully');                    
            setTimeout(() => {                        
                updateAuthUI(false);                        
                navigateToPage('home');                    
            }, 1000);                
        });            
    }        
}                

// Update mobile tabs when a desktop nav item is clicked        
function updateMobileTabsFromDesktop(sectionName) {            
    // Map sections to their corresponding mobile tab            
    const sectionToMobileTab = {                
        'overview': 'overview',                
        'purchases': 'purchases',                
        'orders': 'orders',                
        'wishlist': 'more',                
        'eco-impact': 'more',                
        'settings': 'more'            
    };                        
    const mobileTabName = sectionToMobileTab[sectionName] || 'overview';                        
    // Update mobile tabs            
    document.querySelectorAll('.dashboard-mobile-tabs .dashboard-nav-item').forEach(tab => {                
        tab.classList.remove('bg-green-100', 'text-green-800');                
        tab.classList.add('text-gray-700');                                
        if (tab.getAttribute('data-section') === mobileTabName) {                    
            tab.classList.add('bg-green-100', 'text-green-800');                    
            tab.classList.remove('text-gray-700');                
        }            
    });                        
    // If the section is in the more menu, also update those items            
    if (mobileTabName === 'more') {                
        document.querySelectorAll('#mobile-more-menu .dashboard-nav-item').forEach(item => {                    
            item.classList.remove('bg-green-100', 'text-green-800');                    
            item.classList.add('text-gray-700');                                        
            if (item.getAttribute('data-section') === sectionName) {                        
                item.classList.add('bg-green-100', 'text-green-800');                        
                item.classList.remove('text-gray-700');                    
            }                
        });            
    }        
}

function showDashboardSection(sectionName) {
    // Hide all dashboard sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

function setupProductInteractions() {
    // Wishlist button clicks
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    wishlistButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering card click
            const productId = btn.getAttribute('data-product-id');
            toggleWishlist(productId);
        });
    });
    
    // Add to cart button clicks
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering card click
            
            const productCard = btn.closest('.product-card');
            if (!productCard) return; // Skip if not in a product card
            
            const productId = productCard.getAttribute('data-product-id');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImage = productCard.querySelector('img').src;
            
            // Add to cart
            addToCart({
                id: productId,
                name: productTitle,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
            
            showToast('Item added to cart!');
        });
    });
    
    // Setup product detail page add to cart button
    const detailAddToCartBtn = document.querySelector('.detail-add-to-cart');
    if (detailAddToCartBtn) {
        detailAddToCartBtn.addEventListener('click', () => {
            const quantityInput = document.querySelector('.quantity-input');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            // Get product details from the page
            const productId = localStorage.getItem('currentProductId') || '1';
            const productTitle = document.querySelector('#product-detail-page h1').textContent;
            const productPrice = document.querySelector('#product-detail-page .text-3xl').textContent;
            const productImage = document.querySelector('#main-product-image').src;
            
            // Add to cart
            addToCart({
                id: productId,
                name: productTitle,
                price: productPrice,
                image: productImage,
                quantity: quantity
            });
            
            showToast(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart!`);
        });
    }
    
    // Product card clicks for detail view
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Skip if clicked on wishlist or add to cart buttons
            if (!e.target.closest('.wishlist-btn') && !e.target.closest('.add-to-cart-btn')) {
                const productId = card.getAttribute('data-product-id');
                
                // Store current product ID
                localStorage.setItem('currentProductId', productId);
                
                // Navigate to product detail page
                navigateToPage('product-detail');
            }
        });
    });
}

function navigateToPage(pageName, category = null, updateHistory = true) {
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the target page section
    const targetSection = document.getElementById(`${pageName}-page`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update page title
        document.title = `GreenBuy - ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`;
        
        // If category is provided and it's the shop page, apply category filter
        if (pageName === 'shop' && category) {
            applyShopFilter(category);
        }
        
        // Update browser history
        if (updateHistory) {
            const state = { page: pageName };
            if (category) state.category = category;
            history.pushState(state, document.title, `#${pageName}${category ? '/' + category : ''}`);
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    }
}

function applyShopFilter(category) {
    // Reset all category checkboxes
    document.querySelectorAll('#shop-page input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Check the specified category checkbox
    const categoryCheckbox = document.querySelector(`#shop-page input[type="checkbox"][value="${category}"]`);
    if (categoryCheckbox) {
        categoryCheckbox.checked = true;
    }
}

function checkCurrentPage() {
    // Check hash fragment to determine current page
    const hash = window.location.hash.substring(1);
    if (hash) {
        // Split hash to get page and category
        const parts = hash.split('/');
        const page = parts[0];
        const category = parts.length > 1 ? parts[1] : null;
        
        navigateToPage(page, category, false);
    }
    
    // Check auth state
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    updateAuthUI(isLoggedIn, userData);
}

function updateAuthUI(isLoggedIn, userData = {}) {
    const authLinks = document.querySelectorAll('.auth-link');
    const userLinks = document.querySelectorAll('.user-link');
    const userNames = document.querySelectorAll('.dashboard-user-name');
    
    if (isLoggedIn) {
        // Hide login links, show user links
        authLinks.forEach(link => link.classList.add('hidden'));
        userLinks.forEach(link => link.classList.remove('hidden'));
        
        // Update user name if available
        if (userData.displayName) {
            userNames.forEach(elem => {
                elem.textContent = userData.displayName;
            });
        }
    } else {
        // Show login links, hide user links
        authLinks.forEach(link => link.classList.remove('hidden'));
        userLinks.forEach(link => link.classList.add('hidden'));
    }
}

// Wishlist functions
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (wishlist.includes(productId)) {
        // Remove from wishlist
        wishlist = wishlist.filter(id => id !== productId);
        showToast('Removed from wishlist');
    } else {
        // Add to wishlist
        wishlist.push(productId);
        showToast('Added to wishlist');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistButtons();
}

function updateWishlistButtons() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        const icon = btn.querySelector('i');
        
        if (wishlist.includes(productId)) {
            btn.classList.add('text-red-500');
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            btn.classList.remove('text-red-500');
            icon.classList.add('far');
            icon.classList.remove('fas');
        }
    });
}

// Cart functions
function getCartItems() {
    return JSON.parse(localStorage.getItem('cartItems')) || [];
}

function addToCart(product) {
    const cartItems = getCartItems();
    
    // Check if item is already in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
        // Update quantity
        cartItems[existingItemIndex].quantity += product.quantity;
    } else {
        // Add new item
        cartItems.push(product);
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCounter();
}

function updateCartCounter() {
    const cartItems = getCartItems();
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    const cartCounters = document.querySelectorAll('.cart-count');
    cartCounters.forEach(counter => {
        if (cartCount > 0) {
            counter.textContent = cartCount;
            counter.classList.remove('hidden');
        } else {
            counter.classList.add('hidden');
        }
    });
}

// Toast notification function
function showToast(message, type = 'success') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="bg-white shadow-lg rounded-lg px-4 py-3 flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500'} mr-3 text-xl"></i>
            <p class="text-gray-800">${message}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Show the toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}