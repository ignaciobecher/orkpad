import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialIdentityController } from './social-identity.controller';
import { SocialIdentityService } from './social-identity.service';
import { SocialIdentityRepository } from './social-identity.repository';
import { SocialAccount, SocialAccountSchema } from './social-account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialAccount.name, schema: SocialAccountSchema },
    ]),
  ],
  controllers: [SocialIdentityController],
  providers: [SocialIdentityService, SocialIdentityRepository],
  exports: [SocialIdentityService],
})
export class SocialIdentityModule {}
