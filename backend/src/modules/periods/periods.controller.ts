import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PeriodsService } from './periods.service';

@ApiTags('periods')
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all musical periods' })
  @ApiResponse({ status: 200, description: 'List of musical periods' })
  async findAll() {
    return this.periodsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get all periods with track counts' })
  @ApiResponse({ status: 200, description: 'List of periods with statistics' })
  async getAllWithStats() {
    return this.periodsService.getAllWithStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get period by ID' })
  @ApiParam({ name: 'id', description: 'Period ID' })
  @ApiResponse({ status: 200, description: 'Period data' })
  @ApiResponse({ status: 404, description: 'Period not found' })
  async findOne(@Param('id') id: string) {
    return this.periodsService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get period with statistics' })
  @ApiParam({ name: 'id', description: 'Period ID' })
  @ApiResponse({ status: 200, description: 'Period data with track count' })
  @ApiResponse({ status: 404, description: 'Period not found' })
  async getStats(@Param('id') id: string) {
    return this.periodsService.getPeriodWithStats(id);
  }
}