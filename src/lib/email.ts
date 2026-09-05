import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendOrderConfirmation(order: {
  orderNumber: string;
  email: string;
  fullName: string;
  total: number;
  items: { productName: string; quantity: number; price: number }[];
}) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fff5f7; padding: 30px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ec4899; font-size: 28px; margin: 0;">Glow & Beauty</h1>
        <p style="color: #9d174d; font-size: 14px;">Your order is confirmed!</p>
      </div>
      <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #fbcfe8;">
        <p style="color: #4a5568;">Hi <strong>${order.fullName}</strong>,</p>
        <p style="color: #4a5568;">Thank you for your order! We're getting it ready.</p>
        <div style="background: #fdf2f8; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; color: #9d174d; font-size: 14px;">Order #${order.orderNumber}</p>
          <table style="width: 100%; margin-top: 12px; border-collapse: collapse;">
            <thead><tr><th style="text-align: left; color: #718096; font-size: 12px; padding: 8px 0;">Item</th><th style="color: #718096; font-size: 12px; padding: 8px 0;">Qty</th><th style="text-align: right; color: #718096; font-size: 12px; padding: 8px 0;">Price</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="text-align: right; margin-top: 12px; font-size: 18px; color: #ec4899; font-weight: bold;">Total: $${order.total.toFixed(2)}</p>
        </div>
        <p style="color: #718096; font-size: 13px;">Payment method: Cash on Delivery</p>
        <p style="color: #718096; font-size: 13px;">We'll notify you when your order ships!</p>
      </div>
      <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 24px;">&copy; 2026 Glow & Beauty. All rights reserved.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Glow & Beauty" <${process.env.SMTP_FROM || "noreply@glowandbeauty.com"}>`,
      to: order.email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendOrderStatusUpdate(order: {
  orderNumber: string;
  email: string;
  fullName: string;
  status: string;
}) {
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fff5f7; padding: 30px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ec4899; font-size: 28px; margin: 0;">Glow & Beauty</h1>
        <p style="color: #9d174d; font-size: 14px;">Order Update</p>
      </div>
      <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #fbcfe8;">
        <p style="color: #4a5568;">Hi <strong>${order.fullName}</strong>,</p>
        <p style="color: #4a5568;">Your order <strong>#${order.orderNumber}</strong> status has been updated to:</p>
        <div style="text-align: center; background: #fdf2f8; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <span style="color: #ec4899; font-size: 20px; font-weight: bold;">${order.status}</span>
        </div>
      </div>
      <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 24px;">&copy; 2026 Glow & Beauty. All rights reserved.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Glow & Beauty" <${process.env.SMTP_FROM || "noreply@glowandbeauty.com"}>`,
      to: order.email,
      subject: `Order Update - #${order.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
