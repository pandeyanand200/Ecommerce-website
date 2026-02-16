 // Product Data with real Unsplash images
        const products = [
            {
                id: 1,
                title: "Classic Leather Jacket",
                category: "men",
                price: 299.99,
                originalPrice: 399.99,
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop",
                badge: "SALE"
            },
            {
                id: 2,
                title: "Elegant Silk Dress",
                category: "women",
                price: 249.99,
                originalPrice: 349.99,
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
                badge: "NEW"
            },
            {
                id: 3,
                title: "Premium Wristwatch",
                category: "accessories",
                price: 599.99,
                originalPrice: 799.99,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop",
                badge: "SALE"
            },
            {
                id: 4,
                title: "Designer Sunglasses",
                category: "accessories",
                price: 199.99,
                originalPrice: 299.99,
                image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop",
                badge: "NEW"
            },
            {
                id: 5,
                title: "Casual Denim Jacket",
                category: "men",
                price: 149.99,
                originalPrice: 199.99,
                image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop",
                badge: "SALE"
            },
            {
                id: 6,
                title: "Summer Floral Dress",
                category: "women",
                price: 179.99,
                originalPrice: 249.99,
                image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",
                badge: "NEW"
            },
            {
                id: 7,
                title: "Leather Crossbody Bag",
                category: "accessories",
                price: 189.99,
                originalPrice: 259.99,
                image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop",
                badge: "SALE"
            },
            {
                id: 8,
                title: "Tailored Blazer",
                category: "men",
                price: 329.99,
                originalPrice: 449.99,
                image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop",
                badge: "NEW"
            },
            {
                id: 9,
                title: "Knit Sweater Dress",
                category: "women",
                price: 139.99,
                originalPrice: 189.99,
                image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop",
                badge: "SALE"
            }
        ];

        let cart = [];
        let currentFilter = 'all';

        // Display products
        function displayProducts(category = 'all') {
            const grid = document.getElementById('products-grid');
            const filteredProducts = category === 'all' 
                ? products 
                : products.filter(p => p.category === category);

            grid.innerHTML = filteredProducts.map(product => `
                <div class="product-card" data-category="${product.category}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.title}">
                        <span class="product-badge">${product.badge}</span>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">
                            <span class="price-current">$${product.price}</span>
                            <span class="price-original">$${product.originalPrice}</span>
                        </div>
                        <button class="add-to-cart" onclick="addToCart(${product.id})">
                            ADD TO CART
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.category;
                displayProducts(category);
            });
        });

        // Add to cart
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            updateCart();
            showNotification('Added to cart!');
        }

        // Update cart display
        function updateCart() {
            const cartCount = document.getElementById('cart-count');
            const cartItems = document.getElementById('cart-items');
            const totalPrice = document.getElementById('total-price');
            const cartTotalSection = document.getElementById('cart-total-section');
            const checkoutBtn = document.getElementById('checkout-btn');

            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;

            if (cart.length === 0) {
                cartItems.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
                cartTotalSection.style.display = 'none';
                checkoutBtn.style.display = 'none';
            } else {
                cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.title}</div>
                            <div>Quantity: ${item.quantity}</div>
                            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    </div>
                `).join('');

                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                totalPrice.textContent = `$${total.toFixed(2)}`;
                cartTotalSection.style.display = 'flex';
                checkoutBtn.style.display = 'block';
            }
        }

        // Cart modal
        document.getElementById('cart-icon').addEventListener('click', () => {
            document.getElementById('cart-modal').classList.add('active');
        });

        document.getElementById('close-cart').addEventListener('click', () => {
            document.getElementById('cart-modal').classList.remove('active');
        });

        document.getElementById('cart-modal').addEventListener('click', (e) => {
            if (e.target.id === 'cart-modal') {
                document.getElementById('cart-modal').classList.remove('active');
            }
        });

        // Checkout
        document.getElementById('checkout-btn').addEventListener('click', () => {
            alert('Thank you for your purchase! This is a demo checkout.');
            cart = [];
            updateCart();
            document.getElementById('cart-modal').classList.remove('active');
        });

        // Notification
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--accent);
                color: white;
                padding: 1rem 2rem;
                border-radius: 4px;
                z-index: 3000;
                animation: slideInRight 0.3s ease;
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }

        // Initialize
        displayProducts();
