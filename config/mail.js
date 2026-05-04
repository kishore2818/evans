import nodemailer from 'nodemailer';

const sendOrderEmail = async (order, user, type = 'customer') => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0;">${item.name} x ${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const customerEmailContent = `
      <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5A2A6C; margin-bottom: 5px;">Evans Luxe Beauty</h1>
          <p style="color: #999; text-transform: uppercase; letter-spacing: 2px; font-size: 10px;">Botanical Excellence</p>
        </div>
        
        <h2 style="color: #333;">Thank you for your order, ${user.username}!</h2>
        <p style="color: #666; line-height: 1.6;">We've received your order <b>#${order._id.toString().slice(-6).toUpperCase()}</b> and are getting it ready for shipment.</p>
        
        <div style="background: #fdfcf8; padding: 20px; border-radius: 15px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #5A2A6C;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding: 20px 0 0 0; font-weight: bold;">Total Amount</td>
              <td style="padding: 20px 0 0 0; text-align: right; font-weight: bold; color: #5A2A6C; font-size: 18px;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333;">Shipping Address</h3>
          <p style="color: #666; margin: 0;">${order.shippingAddress.name}</p>
          <p style="color: #666; margin: 0;">${order.shippingAddress.address}</p>
          <p style="color: #666; margin: 0;">${order.shippingAddress.city} - ${order.shippingAddress.pincode}</p>
          <p style="color: #666; margin: 0;">Phone: ${order.shippingAddress.phone}</p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
          <p>Questions? Contact us at support@evansluxe.com</p>
          <p>&copy; 2026 Evans Luxe Beauty. All rights reserved.</p>
        </div>
      </div>
    `;

    const adminEmailContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #5A2A6C; border-radius: 10px;">
        <h2 style="color: #5A2A6C;">New Order Received!</h2>
        <p>A new order has been placed by <b>${user.username}</b> (${user.mobile}).</p>
        
        <div style="background: #eee; padding: 15px; border-radius: 5px;">
          <p><b>Order ID:</b> ${order._id}</p>
          <p><b>Total:</b> ₹${order.totalAmount.toLocaleString('en-IN')}</p>
        </div>
        
        <h3>Items:</h3>
        <ul>
          ${order.items.map(i => `<li>${i.name} x ${i.quantity}</li>`).join('')}
        </ul>
        
        <a href="https://admin-evans.vercel.app/orders/${order._id}" style="display: inline-block; background: #5A2A6C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Dashboard</a>
      </div>
    `;

    const mailOptions = {
      from: `"Evans Luxe Beauty" <${process.env.EMAIL_USER}>`,
      to: type === 'customer' ? user.email : process.env.ADMIN_EMAIL,
      subject: type === 'customer' ? `Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()}` : `🚨 New Order Alert - ${user.username}`,
      html: type === 'customer' ? customerEmailContent : adminEmailContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ${type} notification sent successfully`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send ${type} email:`, error.message);
  }
};

export default sendOrderEmail;
