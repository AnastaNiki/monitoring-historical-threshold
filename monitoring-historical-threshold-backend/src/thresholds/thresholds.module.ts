import { Module } from '@nestjs/common';
import {
  ThresholdsService,
  MetricService,
  RoleService,
  ResourceService,
} from './thresholds.service';
import {
  ThresholdsResolver,
  MetricResolver,
  RoleResolver,
  ResourceResolver,
} from './thresholds.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [
    ThresholdsResolver,
    MetricResolver,
    RoleResolver,
    ResourceResolver,
    ThresholdsService,
    MetricService,
    RoleService,
    ResourceService,
    PrismaService,
  ],
})
export class ThresholdsModule {}

//todo: можно разнести в разные модули реализацию Thresholds,Metric,Role,Resource
