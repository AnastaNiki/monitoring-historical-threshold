import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';

//реализация методов http-сервера

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStart(): string {
    return this.appService.getStart();
  }

  @Post('graphite/render')
  async createGraphiteAnswer(@Body() graphiteRequest: any) {
    return this.appService.graphite(graphiteRequest);
  }

  @Get('graphite/functions')
  possibleFunctions() {
    return [];
  }

  @Get('graphite/tags/autoComplete/values')
  possibleValues(@Query() params): any {
    if (params.tag === 'level') {
      return ['WARN', 'CRIT'];
    }
    return {};
  }

  //теги, которые можно указать в запросе
  @Get('graphite/tags/autoComplete/tags')
  possibleTags(@Query() params): any {
    const tags = ['name', 'level', 'resource', 'role'];
    if (params.expr) {
      //если уже несколько выбрано - придёт массив
      if (typeof params.expr === 'object') {
        params.expr.forEach((elem: string) => {
          const tmp = elem.replace(/=.*/, '');
          tags.splice(tags.indexOf(tmp), 1);
        });
      } else {
        //если выбран один тег, придёт строка
        tags.splice(tags.indexOf(params.expr.replace(/=.*/, '')), 1);
      }
    }
    return tags;
  }

  @Post('graphite/metrics/find')
  possibleMetrics() {
    return {};
  }
}
