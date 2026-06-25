import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { ChatModule } from './modules/chat/chat.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { PlannerModule } from './modules/planner/planner.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { EventsModule } from './modules/events/events.module';
import { HoneymoonModule } from './modules/honeymoon/honeymoon.module';
import { FinanceModule } from './modules/finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const postgresHost = configService.get<string>('POSTGRES_HOST');

        if (postgresHost) {
          return {
            type: 'postgres' as const,
            host: postgresHost,
            port: configService.get<number>('POSTGRES_PORT', 5432),
            username: configService.get<string>('POSTGRES_USER'),
            password: configService.get<string>('POSTGRES_PASSWORD'),
            database: configService.get<string>('POSTGRES_DB'),
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        return {
          type: 'better-sqlite3' as const,
          database: 'wow_dev.db',
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    MatchmakingModule,
    ChatModule,
    VendorsModule,
    PlannerModule,
    NotificationsModule,
    BookingsModule,
    EventsModule,
    HoneymoonModule,
    FinanceModule,
  ],
})
export class AppModule {}
