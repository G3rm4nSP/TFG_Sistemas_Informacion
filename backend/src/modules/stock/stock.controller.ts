import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StockService } from './application/use-cases/stock.service';
import { CreateStockDto } from './application/dto/create-stock.dto';
import { UpdateStockDto } from './application/dto/update-stock.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Ubi } from '@prisma/client';
import { MoverStockDto } from './application/dto/mover-stock.dto';

@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }
  
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto)
    {
    return this.stockService.update(id, updateStockDto);
  }

  @Patch('/mover/:id')
  mover(
  @Param('id') origenId: string,
  @Body() moverStockDto: MoverStockDto)
    {
    return this.stockService.moverStock(origenId,moverStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}
