import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(runtime?: string, library?: string) {
    return this.prisma.template.findMany();
  }

  async findOne(id: string) {
    return this.prisma.template.findUnique({
      where: { id },
    });
  }

  async create(userId: string, data: any) {
    return this.prisma.template.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.template.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.prisma.template.delete({
      where: { id },
    });
  }
}
