import { Test, TestingModule } from '@nestjs/testing';
import { ThresholdService } from './thresholds.service';
import { PrismaService } from '../prisma.service';

describe('ThresholdsService', () => {
  let service: ThresholdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThresholdService, PrismaService],
    }).compile();

    service = module.get<ThresholdService>(ThresholdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
