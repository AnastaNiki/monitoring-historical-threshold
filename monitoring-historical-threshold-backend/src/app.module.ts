import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThresholdsModule } from './thresholds/thresholds.module';
import { ApolloModule } from './apollo/apollo.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

//тут всё собирается

@Module({
  imports: [ThresholdsModule, ApolloModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
