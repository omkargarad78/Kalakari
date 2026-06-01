import resend
from app.core.config import settings

# Initialize Resend if key is provided
resend_configured = False
if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY
    resend_configured = True

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Sends email via Resend API, or prints to stdout if not configured.
    """
    if resend_configured:
        try:
            params = {
                "from": settings.SENDER_EMAIL,
                "to": to_email,
                "subject": subject,
                "html": html_content
            }
            resend.Emails.send(params)
            return True
        except Exception as e:
            print(f"Resend mail sending error: {e}. Printed email context instead.")
            
    # Fallback to local console printout
    print("\n" + "="*50)
    print(f"EMAIL OUTBOX (Fallback Mode)")
    print(f"From: {settings.SENDER_EMAIL}")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Content:\n{html_content}")
    print("="*50 + "\n")
    return True

def send_welcome_email(email: str, name: str):
    subject = "Welcome to Our Crochet Brand!"
    html_content = f"""
    <h2>Hello, {name}!</h2>
    <p>Thank you for creating an account with us. We are a family-run business dedicated to crafting the finest premium handmade crochet items.</p>
    <p>Explore our latest boutique catalogs, add items to your wishlist, or request a custom-made creation.</p>
    <p>Warm regards,<br>The Crochet Brand Team</p>
    """
    send_email(email, subject, html_content)

def send_order_confirmation_email(email: str, order_id: str, total_amount: float, utr: str):
    subject = f"Order #{order_id[:8]} Received - Payment Verification Pending"
    html_content = f"""
    <h2>Thank you for your order!</h2>
    <p>We've received your order and payment details for <strong>INR {total_amount}</strong>.</p>
    <p><strong>UPI Transaction Reference (UTR):</strong> {utr}</p>
    <p>Our team is currently verifying the payment. Once verified, you will receive another email and we will start processing your handmade order.</p>
    <p>Thank you for supporting our family business!</p>
    """
    send_email(email, subject, html_content)

def send_order_status_update(email: str, order_id: str, status: str):
    subject = f"Order #{order_id[:8]} Status Update: {status}"
    html_content = f"""
    <h2>Order Status Updated</h2>
    <p>Your order #{order_id[:8]} has been updated to <strong>{status}</strong>.</p>
    <p>We are crafting, packing, and shipping with love and care!</p>
    <p>If you have any questions, please reply to this email.</p>
    """
    send_email(email, subject, html_content)

def send_custom_order_quotation(email: str, custom_order_id: str, amount: float, admin_notes: str):
    subject = f"Quotation Ready for Custom Order Request"
    html_content = f"""
    <h2>Good News! We have reviewed your custom request</h2>
    <p>We would love to create your custom design. Here are the details:</p>
    <ul>
        <li><strong>Quotation Amount:</strong> INR {amount}</li>
        <li><strong>Notes from the Artisan:</strong> {admin_notes}</li>
    </ul>
    <p>To accept this quote and make payment, please log in to your account dashboard on our website and proceed to check out.</p>
    <p>Warmly,<br>The Crochet Brand Team</p>
    """
    send_email(email, subject, html_content)
