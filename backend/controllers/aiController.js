const { GoogleGenAI } = require('@google/genai');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

const handleChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Try to decode JWT to get the user context if available (Optional Auth)
    let user = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        console.error('AI Chat Token Verification Failed:', err.message);
      }
    }

    // Fetch user orders if user is authenticated
    let orders = [];
    let orderContext = '';
    if (user) {
      orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
      if (orders && orders.length > 0) {
        orderContext = `Here is the order history, tracking details, and payment statuses for the logged-in customer (Name: ${user.name}, Email: ${user.email}):
        ${orders.map((o, idx) => `
        Order #${idx + 1}:
        - Order ID: ${o._id}
        - Date Placed: ${new Date(o.createdAt).toLocaleDateString()}
        - Items: ${o.orderItems.map(item => `${item.name} (Qty: ${item.qty}, Price: ₹${item.price})`).join(', ')}
        - Subtotal (Items Price): ₹${o.itemsPrice}
        - Shipping: ₹${o.shippingPrice}
        - Total Cost: ₹${o.totalPrice}
        - Payment Method: ${o.paymentMethod.toUpperCase()}
        - Payment Status: ${o.isPaid ? `PAID (at ${o.paidAt ? new Date(o.paidAt).toLocaleDateString() : 'N/A'})` : 'UNPAID'}
        - Delivery Tracking: ${o.isDelivered ? `DELIVERED (at ${o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : 'N/A'})` : `NOT DELIVERED (Current Logistics Status: ${o.status.toUpperCase()})`}
        - Shipping Address: Recipient: ${o.shippingAddress.name}, Phone: ${o.shippingAddress.phone}, Address: ${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.pincode}
        `).join('\n')}`;
      } else {
        orderContext = `The logged-in customer (Name: ${user.name}, Email: ${user.email}) has not placed any orders yet.`;
      }
    } else {
      orderContext = `The customer is currently browsing as a Guest (not logged in). If they ask about orders, tracking, or payments, politely ask them to log in using the Login button in the navigation header so that you can view their real-time order history.`;
    }

    // Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    
    // If no API key, use fallback mock response
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, using mock response.");
      return handleMockChat(message, user, orders, res);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Fetch basic active products to give database context
    const products = await Product.find({ isActive: true }).limit(8).select('name price category');
    const productContext = products.map(p => `${p.name} - ₹${p.price} (${p.category})`).join(', ');

    const systemInstruction = `You are a helpful, professional, and friendly AI Customer Support Agent for our premium e-commerce store, LuxeStore.
    
    Product Listings in Store:
    Here are some active products we currently sell: ${productContext}.
    
    Customer Context (Order details & Payment logs):
    ${orderContext}
    
    Your Guidelines:
    - You are fully order-aware. When the customer asks about "my order", "status", "shipment", "delivery", "tracking", "price", "payment", "cancel", or "delete", look at the Customer Context above to provide specific, detailed, and highly helpful responses.
    - If they ask about order details, list their purchased items, dates, and order numbers using clean markdown formatting.
    - If they ask about payment status, explicitly confirm if their order is PAID (including dates and amounts) or UNPAID, and list their payment method (e.g. COD or Razorpay).
    - If they ask about shipping/delivery tracking, inform them about their logistics status (e.g. pending, processing, shipped, delivered) and specify the recipient address details.
    - If they ask about order cancellation: Explain that customers can cancel their own orders directly via the **Cancel Order** button next to their order on the [My Orders](file:///d:/ecommerce-app/frontend/src/my-orders) page, provided the order is still "pending" or "processing". If the order is "shipped" or "delivered", explain that cancellation is no longer possible and guide them on returning items within 7 days instead.
    - If they ask about deleting/removing orders from their history: Explain that they can remove cancelled or delivered orders from their dashboard by clicking the **Remove Order History** button next to those records on the [My Orders](file:///d:/ecommerce-app/frontend/src/my-orders) page. Explain that active orders (pending, processing, shipped) cannot be deleted.
    - Keep your replies friendly, supportive, and concise. Format lists using clean bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.status(200).json({
      success: true,
      reply: response.text
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, message: 'Error processing your request', error: error.message });
  }
};

const handleMockChat = (message, user, orders, res) => {
  let reply = "Hello! I am LuxeStore's Customer Support assistant. I'm currently running in offline mock mode. Set GEMINI_API_KEY in your .env for full AI capabilities!";
  
  const lowerMsg = message.toLowerCase();
  
  if (!user) {
    if (
      lowerMsg.includes('order') ||
      lowerMsg.includes('status') ||
      lowerMsg.includes('track') ||
      lowerMsg.includes('payment') ||
      lowerMsg.includes('delivery') ||
      lowerMsg.includes('shipping') ||
      lowerMsg.includes('cancel')
    ) {
      reply = "To check your order history or cancel a pending shipment, please log in first by clicking the **Login** button at the top right of the page!";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      reply = "Hello! I am LuxeStore's Support assistant. How can I help you today? Please log in if you'd like to check your orders or shipping updates!";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      reply = "You can view the prices of all our luxurious products on our **Shop** page. Let me know if you need help finding anything!";
    } else if (lowerMsg.includes('refund') || lowerMsg.includes('return')) {
      reply = "We offer a hassle-free 7-day return policy for unused products in their original packaging. Reach out to our support at support@luxestore.com for assistance.";
    }
  } else {
    // User is logged in
    if (orders.length === 0) {
      if (
        lowerMsg.includes('order') ||
        lowerMsg.includes('status') ||
        lowerMsg.includes('track') ||
        lowerMsg.includes('payment') ||
        lowerMsg.includes('delivery') ||
        lowerMsg.includes('shipping') ||
        lowerMsg.includes('cancel') ||
        lowerMsg.includes('delete') ||
        lowerMsg.includes('remove')
      ) {
        reply = `Hi **${user.name}**! I looked up your account (${user.email}) but I couldn't find any placed orders, so there is no order history to delete. Check out our latest products on the **Shop** page to place your first order!`;
      } else {
        reply = `Hello **${user.name}**! Welcome back to LuxeStore. How can I assist you with your shopping experience today?`;
      }
    } else {
      // User has orders
      const latestOrder = orders[0];
      const itemsList = latestOrder.orderItems.map(item => `• **${item.name}** (Qty: ${item.qty}, Price: ₹${item.price})`).join('\n');
      
      if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) {
        if (latestOrder.status === 'cancelled' || latestOrder.status === 'delivered') {
          reply = `Hi **${user.name}**, I see your latest order (\`${latestOrder._id}\`) is currently **${latestOrder.status.toUpperCase()}**.\n\n` +
                  `🗑️ You are eligible to remove this order from your history! Please go to your **My Orders** page and click the grey **Remove Order History** button next to this card. Please note that this action is permanent and cannot be undone.`;
        } else {
          reply = `Hi **${user.name}**, your latest order (\`${latestOrder._id}\`) is currently **${latestOrder.status.toUpperCase()}**.\n\n` +
                  `⚠️ Active orders (pending, processing, or shipped) cannot be deleted to protect logistics tracking. If you want to remove this record, you must cancel it first (if eligible) or wait until it is delivered.`;
        }
      } else if (lowerMsg.includes('cancel')) {
        if (latestOrder.status === 'pending' || latestOrder.status === 'processing') {
          reply = `Hi **${user.name}**, I see your recent order (\`${latestOrder._id}\`) is currently **${latestOrder.status.toUpperCase()}**.\n\n` +
                  `✅ You can cancel this order directly! Please go to your **My Orders** page and click the red **Cancel Order** button next to it. Since the items have not shipped yet, we will immediately cancel the order and process any payment refunds.`;
        } else if (latestOrder.status === 'cancelled') {
          reply = `Hi **${user.name}**, your latest order (\`${latestOrder._id}\`) has **already been CANCELLED**. You don't need to take any further action! Let me know if you'd like help placing a new order.`;
        } else {
          reply = `Hi **${user.name}**, your recent order (\`${latestOrder._id}\`) is currently **${latestOrder.status.toUpperCase()}**.\n\n` +
                  `⚠️ Unfortunately, once an order is shipped or delivered, it can no longer be cancelled. However, we offer a hassle-free 7-day return policy. Once the package arrives, you can contact support@luxestore.com to arrange a return.`;
        }
      } else if (lowerMsg.includes('order') || lowerMsg.includes('status') || lowerMsg.includes('track') || lowerMsg.includes('delivery') || lowerMsg.includes('shipping')) {
        reply = `Hi **${user.name}**, I found your latest order details in our system:\n\n` +
                `📦 **Order ID:** \`${latestOrder._id}\`\n` +
                `📅 **Order Date:** ${new Date(latestOrder.createdAt).toLocaleDateString()}\n` +
                `📈 **Logistics Status:** **${latestOrder.status.toUpperCase()}**\n` +
                `💰 **Total Amount:** ₹${latestOrder.totalPrice}\n` +
                `📍 **Shipping To:** ${latestOrder.shippingAddress.name}, ${latestOrder.shippingAddress.street}, ${latestOrder.shippingAddress.city} - ${latestOrder.shippingAddress.pincode}\n\n` +
                `**Items in this order:**\n${itemsList}\n\n` +
                `Is there anything specific you would like to inquire about this delivery?`;
      } else if (lowerMsg.includes('payment') || lowerMsg.includes('paid')) {
        reply = `Hi **${user.name}**, here are the billing and payment details for your recent order:\n\n` +
                `💵 **Order Total:** ₹${latestOrder.totalPrice}\n` +
                `💳 **Payment Method:** ${latestOrder.paymentMethod.toUpperCase()}\n` +
                `🔒 **Payment Status:** ${latestOrder.isPaid ? `🟢 **PAID** (on ${new Date(latestOrder.paidAt).toLocaleDateString()})` : `🔴 **UNPAID**`}\n\n` +
                `If you paid via Razorpay, the transaction ID is linked to your email **${user.email}**. Let me know if you need assistance with invoices!`;
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        reply = `Hello **${user.name}**! Welcome back to LuxeStore support. I see you have a recent order (\`${latestOrder._id}\`) in **${latestOrder.status}** status. How can I help you with it or your shopping today?`;
      } else {
        reply = `I am here to support you, **${user.name}**. I can tell you about your recent order status, delivery tracking, payments, or product details. What would you like to know?`;
      }
    }
  }

  // Simulate a slight network delay
  setTimeout(() => {
    res.status(200).json({ success: true, reply });
  }, 1000);
};

module.exports = { handleChat };
