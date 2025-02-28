import 'module-alias/register';
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BillingPlanService } from '../billing-plan.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BillingPlan } from '../entities/billing-plan.entity';
import { NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '@shared/helpers/custom-http-filter';
import * as SYS_MSG from '@shared/constants/SystemMessages';
import { BillingPlanMapper } from '../mapper/billing-plan.mapper';

const mockBillingPlanRepository = {
  findAndCount: jest.fn().mockResolvedValue([[], 0]),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

describe('BillingPlanService', () => {
  let service: BillingPlanService;
  let repository: Repository<BillingPlan>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingPlanService,
        {
          provide: getRepositoryToken(BillingPlan),
          useValue: mockBillingPlanRepository,
        },
      ],
    }).compile();

    service = module.get<BillingPlanService>(BillingPlanService);
    repository = module.get<Repository<BillingPlan>>(getRepositoryToken(BillingPlan));
  });

  describe('getAllBillingPlans', () => {
    it('should return paginated billing plans', async () => {
      const billingPlans = [
        {
          id: '1',
          name: 'Free',
          description: 'free plan',
          amount: 0,
          frequency: 'never',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'Standard',
          description: 'standard plan',
          amount: 50,
          frequency: 'monthly',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          name: 'Premium',
          description: 'premium plan',
          amount: 120,
          frequency: 'monthly',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const total = 3;
      mockBillingPlanRepository.findAndCount.mockResolvedValue([billingPlans, total]);

      const result = await service.getAllBillingPlans(1, 10);

      expect(result).toEqual({
        message: 'Billing plans retrieved successfully',
        data: {
          plans: billingPlans.map(plan => BillingPlanMapper.mapToResponseFormat(plan)),
          total,
        },
      });

      expect(mockBillingPlanRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should throw a NotFoundException if no billing plans are found', async () => {
      mockBillingPlanRepository.findAndCount.mockResolvedValue([[], 0]);

      await expect(service.getAllBillingPlans(1, 10)).rejects.toThrow(NotFoundException);
    });
  });
});
