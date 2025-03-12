const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const db = require("../models/index");


// Hàm gửi email
async function sendEmail(type, email, link) {
  try {
    console.log("Sending email to:", email);
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        
      },
    });


    let subject, htmlContent;


    if (type === "verify") {
      subject = "🔹 Xác nhận tài khoản của bạn";
      htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50; text-align: center;">Chào mừng bạn đến với dịch vụ của chúng tôi! 🎉</h2>
            <p style="font-size: 16px; text-align: center;">Cảm ơn bạn đã đăng ký. Vui lòng nhấn vào nút bên dưới để xác minh tài khoản:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; font-size: 18px; text-decoration: none; border-radius: 5px;">
                Xác minh tài khoản
              </a>
            </div>
            <p style="font-size: 14px; text-align: center; color: #777;">Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.</p>
            <hr>
            <p style="text-align: center; font-size: 12px; color: #888;">© 2025 Công ty của bạn. Mọi quyền được bảo lưu.</p>
          </div>`;
    }     else {
      throw new Error("Invalid email type");
    }


    const mailOptions = {
      from: `"Olala" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    };


    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}


async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await db.User.findOne({email });
    if (!user) {


      return res.status(404).json({ message: "User not found!" });
    }
    if (!/^(?=.*[A-Z]).{8,}$/.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain at least one uppercase letter",
      });
    }


    if (user.status === "inactive") {
      return res.status(401).json({ message: "Please verify your account!" });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password or email!" });
    }


    const token = jwt.sign(
      { id: user._id, username: user.name, }, //them thong tin de ma hoa vao day 
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );


    res.json({ status: "Login successful!", user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
}


//them ham o day



const authenticationController = {
  sendEmail,
  login,
  

};


module.exports = authenticationController;



