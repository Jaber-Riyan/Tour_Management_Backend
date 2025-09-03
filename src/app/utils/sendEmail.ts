import nodemailer from "nodemailer"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError";
import path from "path"
import ejs from "ejs"

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASSWORD
    },
})

interface SendEmailOptions {
    to: string,
    subject: string;
    templateName: string;
    templateData?: Record<string, any>
    attachments?: {
        filename: string,
        content: Buffer | string,
        contentType: string
    }[]
}

export const sendMail = async ({
    to,
    subject,
    templateName,
    templateData,
    attachments
}: SendEmailOptions) => {
    try {
        const templatePath = path.join(__dirname, `templates/${templateName}`)

        const html = await ejs.renderFile(templatePath, templateData)

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })

        console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
    }
    catch (error: any) {
        console.log("email sending error", error.message);
        throw new AppError(401, "Email Sending Error")
    }
}

