import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginationDto } from '../common/dto/pagination.dto.js';
import type { CreateJourneyDto } from './dto/create-journey.dto.js';
import type { CreateJourneyDayDto } from './dto/create-journey-day.dto.js';
import type { CreateDayTaskDto } from './dto/create-day-task.dto.js';
import { Journey } from './entities/journey.entity.js';
import { JourneyDay } from './entities/journey-day.entity.js';
import { DayTask } from './entities/day-task.entity.js';

@Injectable()
export class JourneysService {
  constructor(
    @InjectRepository(Journey)
    private readonly journeyRepo: Repository<Journey>,
    @InjectRepository(JourneyDay)
    private readonly dayRepo: Repository<JourneyDay>,
    @InjectRepository(DayTask)
    private readonly taskRepo: Repository<DayTask>,
  ) {}

  async create(teacherId: string, dto: CreateJourneyDto): Promise<Journey> {
    const journey = this.journeyRepo.create({ ...dto, teacherId });
    return this.journeyRepo.save(journey);
  }

  async findAll(dto: PaginationDto) {
    const { page, limit } = dto;
    const [items, total] = await this.journeyRepo.findAndCount({
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findById(journeyId: string): Promise<Journey> {
    const journey = await this.journeyRepo.findOne({
      where: { id: journeyId },
      relations: ['teacher', 'days', 'days.tasks', 'days.tasks.exercise'],
    });
    if (!journey) throw new NotFoundException('Không tìm thấy hành trình');
    return journey;
  }

  async addDay(journeyId: string, teacherId: string, dto: CreateJourneyDayDto): Promise<JourneyDay> {
    const journey = await this.journeyRepo.findOne({ where: { id: journeyId } });
    if (!journey) throw new NotFoundException('Không tìm thấy hành trình');
    if (journey.teacherId !== teacherId) throw new ForbiddenException('Không có quyền');

    const day = await this.dayRepo.save(this.dayRepo.create({ ...dto, journeyId }));

    // Keep totalDays in sync.
    const dayCount = await this.dayRepo.count({ where: { journeyId } });
    await this.journeyRepo.update(journeyId, { totalDays: dayCount });

    return day;
  }

  async addTask(dayId: string, teacherId: string, dto: CreateDayTaskDto): Promise<DayTask> {
    const day = await this.dayRepo.findOne({
      where: { id: dayId },
      relations: ['journey'],
    });
    if (!day) throw new NotFoundException('Không tìm thấy ngày học');
    if (day.journey.teacherId !== teacherId) throw new ForbiddenException('Không có quyền');

    return this.taskRepo.save(this.taskRepo.create({ ...dto, dayId }));
  }

  // Used by EnrollmentsService to load current day tasks.
  async getDayWithTasks(journeyId: string, dayNumber: number): Promise<JourneyDay | null> {
    return this.dayRepo.findOne({
      where: { journeyId, dayNumber },
      relations: ['tasks', 'tasks.exercise'],
    });
  }
}
