import emailjs from "@emailjs/nodejs";

export async function sendEmail(toEmail: string, code: string): Promise<void> {
  const templateParams = {
    to_email: toEmail,
    message: `Your six-digit login code is: ${code}`,
    subject: "Your Verification Code",
  };

  try {
    // Send email via EmailJS
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID || "",
      process.env.EMAILJS_TEMPLATE_ID || "",
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    return;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send verification email");
  }
}
