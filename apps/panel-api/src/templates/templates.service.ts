import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(runtime?: string, library?: string) {
    const where: any = { isPublic: true };

    if (runtime) {
      where.runtime = runtime;
    }

    if (library) {
      where.library = library;
    }

    return this.prisma.template.findMany({
      where,
      orderBy: { downloadCount: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Increment download count
    await this.prisma.template.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    return template;
  }

  async create(userId: string, data: any) {
    return this.prisma.template.create({
      data: {
        ...data,
        createdBy: userId,
      },
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

    return { message: 'Template deleted successfully' };
  }
}
