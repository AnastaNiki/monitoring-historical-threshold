import { Injectable } from '@nestjs/common';
import {
  CreateThresholdInput,
  CreateMetricInput,
  CreateRoleInput,
  CreateResourceInput,
} from './dto/create-threshold.input';
import {
  UpdateMetricInput,
  UpdateThresholdInput,
  UpdateRoleInput,
  UpdateResourceInput,
} from './dto/update-threshold.input';
import { PrismaService } from '../prisma.service';
import { Threshold, Metric, Role, Resource, Level } from '@prisma/client';

//реализация для работы с бд - провайдер работы с конкретной бд
//@Injectable - придаёт классу сущность провайдера

@Injectable()
export class MetricService {
  constructor(private prisma: PrismaService) {}

  //Create
  async create(input: CreateMetricInput): Promise<Metric> {
    return this.prisma.metric.create({
      data: input,
    });
  }

  //Read
  async readAll(): Promise<Metric[]> {
    return this.prisma.metric.findMany();
  }

  async readOne(id: string): Promise<Metric> {
    return this.prisma.metric.findUnique({
      where: {
        id: id,
      },
    });
  }

  //Update
  async update(id: string, input: UpdateMetricInput) {
    return this.prisma.metric.update({
      where: {
        id: id,
      },
      data: {
        name: input.name,
      },
    });
  }

  //Delete
  async remove(id: string) {
    return this.prisma.metric.delete({
      where: { id },
    });
  }
}

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  //Create
  async create(input: CreateRoleInput): Promise<Role> {
    return this.prisma.role.create({
      data: input,
    });
  }

  //Read
  async readAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async readOne(id: string): Promise<Role> {
    return this.prisma.role.findUnique({
      where: {
        id: id,
      },
    });
  }

  //Update
  async update(id: string, input: UpdateRoleInput) {
    return this.prisma.role.update({
      where: {
        id: id,
      },
      data: {
        name: input.name,
      },
    });
  }

  //Delete
  async remove(id: string) {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}

@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

  //Create
  async create(input: CreateResourceInput): Promise<Resource> {
    return this.prisma.resource.create({
      data: {
        name: input.name,
        role: {
          connect: {
            id: input.roleId,
          },
        },
      },
      include: {
        role: true, // Include all values in the returned object
      },
    });
  }

  //Read
  async readAll(): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      include: {
        role: true,
      },
    });
  }

  async readOne(id: string): Promise<Resource> {
    return this.prisma.resource.findUnique({
      where: {
        id: id,
      },
      include: {
        role: true,
      },
    });
  }

  //Update
  async update(id: string, input: UpdateResourceInput) {
    return this.prisma.resource.update({
      where: {
        id: id,
      },
      data: {
        name: input.name,
      },
    });
  }

  //Delete
  async remove(id: string) {
    return this.prisma.resource.delete({
      where: { id },
    });
  }
}

@Injectable()
export class ThresholdsService {
  constructor(private prisma: PrismaService) {}

  //Create
  async create(input: CreateThresholdInput): Promise<Threshold> {
    //если порог для такой метрики и ресурса существует, то будет создано только новое значение
    if (input.objectKind === 'RESOURCE' && input.resourceId) {
      const exist = await this.prisma.threshold.findFirst({
        where: {
          metricId: input.metricId,
          roleId: input.roleId,
          resourceId: input.resourceId,
          level: input.level,
          objectKind: input.objectKind,
        },
      });
      if (exist) {
        return this.prisma.threshold.update({
          where: {
            id: exist.id,
          },
          data: {
            values: {
              create: {
                value: input.value,
              },
            },
          },
          include: {
            values: true, // Include all values in the returned object
            metric: true,
            role: true,
            resource: true,
          },
        });
      }
    }
    //если порог для такой метрики и роли существует, то будет создано только новое значение
    if (input.objectKind === 'ROLE') {
      const exist = await this.prisma.threshold.findFirst({
        where: {
          metricId: input.metricId,
          roleId: input.roleId,
          level: input.level,
          objectKind: input.objectKind,
        },
      });
      if (exist) {
        return this.prisma.threshold.update({
          where: {
            id: exist.id,
          },
          data: {
            values: {
              create: {
                value: input.value,
              },
            },
          },
          include: {
            values: true, // Include all values in the returned object
            metric: true,
            role: true,
            resource: true,
          },
        });
      }
    }

    //создание нового порога для ресурса
    if (input.objectKind == 'RESOURCE') {
      return this.prisma.threshold.create({
        data: {
          metric: {
            connect: {
              id: input.metricId,
            },
          },
          level: input.level,
          objectKind: input.objectKind,
          role: {
            connect: {
              id: input.roleId,
            },
          },
          resource: {
            connect: {
              id: input.resourceId,
            },
          },
          values: {
            create: {
              value: input.value,
            },
          },
        },
        include: {
          values: true, // Include all values in the returned object
          metric: true,
          role: true,
          resource: true,
        },
      });
    }
    // создание нового порога для роли
    return this.prisma.threshold.create({
      data: {
        metric: {
          connect: {
            id: input.metricId,
          },
        },
        level: input.level,
        objectKind: input.objectKind,
        role: {
          connect: {
            id: input.roleId,
          },
        },
        values: {
          create: {
            value: input.value,
          },
        },
      },
      include: {
        values: true, // Include all values in the returned object
        metric: true,
        role: true,
        resource: true,
      },
    });
  }

  //Read
  async readAll(): Promise<Threshold[]> {
    return this.prisma.threshold.findMany({
      include: {
        values: true, // Include all values in the returned object
        metric: true,
        role: true,
        resource: true,
      },
    });
  }

  async readOne(id: string): Promise<Threshold> {
    return this.prisma.threshold.findUnique({
      where: {
        id: id,
      },
      include: {
        values: true, // Include all values in the returned object
        metric: true,
        role: true,
        resource: true,
      },
    });
  }

  async readThresholdHistory(
    metricName: string,
    roleName: string,
    resourceName: string,
    level: string,
  ): Promise<Threshold> {
    let levelEnum = Level.valueOf();
    if (level.toLocaleUpperCase() === 'CRIT') {
      levelEnum = Level.CRIT;
    } else {
      levelEnum = Level.WARN;
    }
    if (resourceName === '') {
      return this.prisma.threshold.findFirst({
        where: {
          AND: {
            metric: {
              name: metricName,
            },
            role: {
              name: roleName,
            },
            resource: null,
            level: levelEnum,
          },
        },
        include: {
          values: true,
        },
      });
    }
    const resourceData = await this.prisma.threshold.findFirst({
      where: {
        AND: {
          metric: {
            name: metricName,
          },
          resource: {
            name: resourceName,
          },
          level: levelEnum,
        },
      },
      include: {
        values: true,
      },
    });
    //если существует специальный порог для ресурса вернуть его, иначе вернуть порог для его роли
    if (resourceData) {
      return resourceData;
    } else {
      const findResource = await this.prisma.resource.findFirst({
        where: {
          name: resourceName,
        },
        include: {
          role: true,
        },
      });
      return this.prisma.threshold.findFirst({
        where: {
          AND: {
            metric: {
              name: metricName,
            },
            role: {
              name: findResource.role.name,
            },
            resource: null,
            level: levelEnum,
          },
        },
        include: {
          values: true,
        },
      });
    }
  }

  //Update
  async update(id: string, input: UpdateThresholdInput) {
    return this.prisma.threshold.update({
      where: {
        id: id,
      },
      data: {
        values: {
          create: {
            value: input.value,
          },
        },
      },
      include: {
        values: true, // Include all values in the returned object
        metric: true,
        role: true,
        resource: true,
      },
    });
  }

  //Delete
  async remove(id: string) {
    return this.prisma.threshold.delete({
      where: { id },
      include: {
        values: true, // Include all values in the returned object
        metric: true,
        role: true,
        resource: true,
      },
    });
  }
}
