from flask import Flask, request, jsonify, render_template, session
import random
import smtplib
from email.mime.text import MIMEText
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = "supersecretkey"  # Change in production

# Gmail SMTP
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "vortxofficial.10.5@gmail.com"  # Your Gmail
SMTP_PASSWORD = "ufxe ewne axcz kutd"            # App password

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="12345",
    database="otp_system"
)
cursor = db.cursor(dictionary=True)

# Send OTP Email
def send_otp_email(email, otp):
    try:
        email_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {{
              font-family: Arial, sans-serif;
              background-color: #f4f4f7;
              margin: 0;
              padding: 0;
            }}
            .container {{
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              overflow: hidden;
            }}
            .header {{
              background: linear-gradient(90deg, #4f46e5, #9333ea);
              color: #ffffff;
              padding: 20px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
            }}
            .content {{
              padding: 30px;
              color: #333333;
              font-size: 16px;
              line-height: 1.6;
            }}
            .otp-box {{
              background: #f0f4ff;
              border: 2px dashed #4f46e5;
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              padding: 15px;
              margin: 20px 0;
              border-radius: 6px;
              color: #111827;
              letter-spacing: 2px;
            }}
            .footer {{
              background: #f9fafb;
              padding: 15px;
              text-align: center;
              font-size: 13px;
              color: #777777;
            }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              🔐 Account Verification
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up! To complete your registration, please use the following One-Time Password (OTP):</p>
              <div class="otp-box">{otp}</div>
              <p>This code is valid for <strong>5 minutes</strong>. For your security, please do not share this OTP with anyone.</p>
              <p>If you did not request this, you can safely ignore this email.</p>
              <p>Best regards,<br><strong>TLE Fighters – The App Team</strong></p>
            </div>
            <div class="footer">
              © {datetime.now().year} TLE Fighters. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        """
        msg = MIMEText(email_body, "html")
        msg['Subject'] = 'Your One-Time Password (OTP) – TLE Fighters'
        msg['From'] = SMTP_USERNAME
        msg['To'] = email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, email, msg.as_string())
        print("✅ OTP email sent successfully")
    except Exception as e:
        print(f"❌ Failed to send OTP: {e}")

# Home
@app.route("/")
def index():
    return render_template("index.html")

# Sign Up
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    hashed_pw = generate_password_hash(password)

    try:
        cursor.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, hashed_pw))
        db.commit()
    except mysql.connector.IntegrityError:
        return jsonify({"error": "User already exists"}), 400

    # Generate OTP
    otp = str(random.randint(100000, 999999))
    expires_at = (datetime.now() + timedelta(minutes=5)).strftime('%Y-%m-%d %H:%M:%S')

    try:
        cursor.execute(
        "INSERT INTO otp_codes (email, otp, expires_at) VALUES (%s, %s, %s)",
        (email, otp, expires_at)
)
        db.commit()
        print("✅ OTP inserted into database")
    except Exception as e:
        print(f"❌ OTP insert failed: {e}")
        return jsonify({"error": "Failed to generate OTP"}), 500

    send_otp_email(email, otp)
    return jsonify({"message": "Sign up successful! OTP sent to your email"}), 200

# Verify OTP
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp = data.get("otp")

    cursor.execute("SELECT * FROM otp_codes WHERE email=%s ORDER BY created_at DESC LIMIT 1", (email,))
    record = cursor.fetchone()

    if not record:
        return jsonify({"error": "No OTP found. Please sign up again."}), 400

    if record["otp"] != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    if datetime.now() > record["expires_at"]:
        return jsonify({"error": "OTP expired. Please sign up again."}), 400

    cursor.execute("UPDATE users SET verified=1 WHERE email=%s", (email,))
    cursor.execute("DELETE FROM otp_codes WHERE id=%s", (record["id"],))
    db.commit()

    return jsonify({"message": "OTP verified successfully"}), 200

# Sign In
@app.route("/signin", methods=["POST"])
def signin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 400

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid password"}), 400

    if not user["verified"]:
        return jsonify({"error": "Email not verified"}), 400

    session["user"] = email
    return jsonify({"message": "Signed in successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)
