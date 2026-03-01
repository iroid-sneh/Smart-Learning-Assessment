import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { logo } from "../helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendMail = async (obj, template) => {
    const emailUser = process.env.EMAIL_USER || process.env.MAIL_USERNAME;
    const emailPass = process.env.EMAIL_PASS || process.env.MAIL_PASSWORD;
    const emailService = process.env.EMAIL_SERVICE || "gmail";

    if (!emailUser || !emailPass) {
        throw new Error("Email credentials are missing. Set EMAIL_USER and EMAIL_PASS.");
    }

    const transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    const toList = Array.isArray(obj.to) ? obj.to : [obj.to];
    const data = {
        ...obj,
        APP_NAME: process.env.APP_NAME || "Smart Learn",
        logo: logo(),
    };

    const htmlText = await ejs.renderFile(
        path.resolve(__dirname, "../../../views/email", `${template}.ejs`),
        data
    );

    await Promise.all(
        toList.map((emailId) =>
            transporter.sendMail({
                from: `${process.env.APP_NAME || "Smart Learn"} <${process.env.MAIL_SENDER || emailUser}>`,
                to: emailId,
                subject: obj.subject,
                html: htmlText,
            })
        )
    );
};

export default sendMail;
