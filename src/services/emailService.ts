import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { IUser } from '../interfaces/IUser';
import User from '../models/User';

// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
    },
});

// Generate a random 6-digit confirmation code
const generateConfirmationCode = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send the email
const sendConfirmationEmail = async (user: IUser): Promise<void> => {
    const confirmationCode = generateConfirmationCode();
    const expirationTime = new Date(Date.now() + 3600000);

    // Update the user with the confirmation code and expiration
    await User.findByIdAndUpdate(user._id, {
        confirmationCode,
        confirmationCodeExpires: expirationTime,
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: user.email,
        subject: 'Email Confirmation Code',
        text: `Your email confirmation code is: ${confirmationCode}. This code will expire in 1 hour.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation code sent to ${user.email}`);
    } catch (error) {
        console.error(`Error sending email: ${error}`);
        throw new Error('Error sending confirmation email');
    }
};

// Verify the confirmation code provided by the user
const verifyConfirmationCode = async (userId: string, code: string): Promise<boolean> => {
    const user = await User.findById(userId);

    if (!user || !user.confirmationCode) {
        throw new Error('User or confirmation code not found');
    }

    // Ensure confirmationCodeExpires is defined before comparing
    if (!user.confirmationCodeExpires || user.confirmationCodeExpires.getTime() < Date.now()) {
        throw new Error('Confirmation code has expired');
    }

    if (user.confirmationCode !== code) {
        throw new Error('Invalid confirmation code');
    }

    // Confirm the user's email if the code is valid
    await User.findByIdAndUpdate(userId, { emailConfirmed: true });

    return true;
};

export { sendConfirmationEmail, verifyConfirmationCode };
