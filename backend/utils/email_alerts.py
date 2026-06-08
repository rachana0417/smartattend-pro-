import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_absence_alert(parent_email: str, student_name: str, date: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = parent_email
        msg['Subject'] = f"Attendance Alert — {student_name}"

        body = f"""
Dear Parent,

This is an automated alert from SmartAttend Pro.

Your child {student_name} was marked ABSENT today ({date}).

Please contact the school if you have any questions.

Regards,
SmartAttend Pro
Springfield High School
        """

        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        print(f"✅ Absence alert sent to {parent_email}")
        return True

    except Exception as e:
        print(f"❌ Email failed: {e}")
        return False

def send_late_alert(parent_email: str, student_name: str, time: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = parent_email
        msg['Subject'] = f"Late Entry Alert — {student_name}"

        body = f"""
Dear Parent,

This is an automated alert from SmartAttend Pro.

Your child {student_name} arrived LATE to school today at {time}.

Regards,
SmartAttend Pro
Springfield High School
        """

        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)

        print(f"✅ Late alert sent to {parent_email}")
        return True

    except Exception as e:
        print(f"❌ Email failed: {e}")
        return False