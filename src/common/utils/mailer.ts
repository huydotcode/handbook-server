import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { env } from '../config';

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: env.NODEMAILER_REFRESH_TOKEN,
});

export const createTransporter = async () => {
    const accessTokenResult = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResult?.token;

    if (!accessToken) {
        throw new Error('Không lấy được access token từ Google OAuth');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: env.GMAIL_USER,
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            refreshToken: env.NODEMAILER_REFRESH_TOKEN,
            accessToken,
        },
    });
};
