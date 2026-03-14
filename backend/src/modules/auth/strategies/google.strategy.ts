import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, name, photos } = profile;

      if (!emails || emails.length === 0) {
        return done(new Error('No email found from Google account'), undefined);
      }

      const email = emails[0].value;
      const firstName = name?.givenName;
      const lastName = name?.familyName;
      const avatar = photos?.[0]?.value;

      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { email },
        include: { oauthAccounts: true },
      });

      if (user) {
        const googleAccount = user.oauthAccounts.find(
          (account) => account.provider === 'google' && account.providerId === id,
        );

        if (!googleAccount) {
          await this.prisma.oAuthAccount.create({
            data: {
              provider: 'google',
              providerId: id,
              accessToken,
              refreshToken,
              userId: user.id,
            },
          });
        } else {
          await this.prisma.oAuthAccount.update({
            where: { id: googleAccount.id },
            data: { accessToken, refreshToken },
          });
        }
      } else {
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        user = await this.prisma.user.create({
          data: {
            email,
            username,
            firstName,
            lastName,
            avatar,
            role: UserRole.USER,
            isVerified: true,
            isActive: true,
            oauthAccounts: {
              create: {
                provider: 'google',
                providerId: id,
                accessToken,
                refreshToken,
              },
            },
          },
          include: { oauthAccounts: true },
        });

        this.logger.log(`New user created via Google OAuth: ${email}`);
      }

      if (!user) {
        return done(new Error('Failed to create or find user'), undefined);
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      done(null, user as User);
    } catch (error) {
      this.logger.error('Error in Google OAuth validation:', error);
      done(error as Error, undefined);
    }
  }
}