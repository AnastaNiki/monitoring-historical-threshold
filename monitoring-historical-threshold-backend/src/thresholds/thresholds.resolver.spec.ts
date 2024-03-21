import { Test, TestingModule } from '@nestjs/testing';
import { ThresholdsResolver } from './thresholds.resolver';
import { ThresholdService } from './thresholds.service';
import { PrismaService } from '../prisma.service';

describe('ThresholdsResolver', () => {
  let resolver: ThresholdsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThresholdsResolver, ThresholdService, PrismaService],
    }).compile();

    resolver = module.get<ThresholdsResolver>(ThresholdsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
