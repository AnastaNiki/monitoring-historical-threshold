import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async prepareGraphiteAnswer(target: string, from: number, until: number) {
    //поддерживаемые форматы запросов:
    //seriesByTag('name=cpu-total', 'level=warn', 'resource=host.ru')
    //seriesByTag('name=cpu-total', 'level=warn', 'role=monitoring')
    //seriesByTag('name=cpu-total', 'level=crit', 'resource=host.ru')
    //seriesByTag('name=cpu-total', 'level=crit', 'role=monitoring')

    //парсинг тегов из запроса
    const regexp = /'.*?=.*?'/g;
    const tmpArray = [...target.matchAll(regexp)];
    const tags = new Map();
    tmpArray.forEach((element) => {
      const k = element[0].split('=');
      tags.set(
        k[0].replaceAll("'", ''),
        k[1].replaceAll("'", '').replaceAll('~', ''),
      );
    });
    //todo: проверка полученных значений
    //todo: сделать возврат всех уровней порогов, если не указан level

    let targetCurr = ''; //название графика порога

    if (!tags.get('role') && tags.get('resource')) {
      tags.set('role', '');
      targetCurr = `${tags.get('level')}.${tags.get('resource')}`;
    }

    if (!tags.get('resource') && tags.get('role')) {
      tags.set('resource', '');
      targetCurr = `${tags.get('level')}.${tags.get('role')}`;
    }

    //название графика порога в интервал, когда его ещё не существовало
    //растянется новое значение, но с таким названием
    const targetWasNotInstalled = targetCurr + '.wasNotInstalled';

    //строим запрос к бд на основе запроса из grafana
    const q =
      'query ReadThresholdHistory(\
      $metricName: String!, $role: String!, $resource: String!, $level: String!)\
      {readThresholdHistory(metricName: $metricName, role: $role, resource: $resource, level: $level)\
      {values {createdAt value }}}';

    const v = {
      metricName: tags.get('name'),
      role: tags.get('role'),
      resource: tags.get('resource'),
      level: tags.get('level'),
    };

    const data = {
      query: q,
      variables: v,
    };

    // Определяем функцию которая принимает в качестве параметров url и данные которые необходимо обработать:
    const postData = async (url = '', data = {}) => {
      // Формируем запрос
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Данные
        body: JSON.stringify(data),
      });
      return response.json();
    };

    const HOST = process.env.HOST || 'localhost';
    const PORT = process.env.PORT || '9000';

    const historyValues = await postData(
      `http://${HOST}:${PORT}/graphql`,
      data,
    ).then((data) => {
      return data.data?.readThresholdHistory?.values ?? [];
    });

    //todo: придумать как заменить на вызов фукции из модуля

    let startIndex = -1;
    let endIndex = -1;
    let nearestIndexToFrom = -1;
    let countValues = 0;

    historyValues.sort((a: { createdAt: number }, b: { createdAt: number }) =>
      a.createdAt > b.createdAt ? 1 : -1,
    );

    //проверить сколько точек порога попадает в интервал запроса от grafana
    historyValues.forEach(function (
      element: { createdAt: number; value: number },
      ind: number,
    ) {
      element.createdAt = Math.round(+new Date(element.createdAt) / 1000);
      if (element.createdAt >= from && element.createdAt <= until) {
        countValues += 1; //кол-во точек, которые попадают в интервал
        if (startIndex == -1) {
          //индекс начала точек, которые попадают в интерваал
          startIndex = ind;
        }
        if (ind > endIndex) {
          //индекс конца точек, которые попадают в интерваал
          endIndex = ind;
        }
      }
      if (element.createdAt <= from && nearestIndexToFrom < ind) {
        nearestIndexToFrom = ind;
      }
    });

    //если массив пустой historyValues, то ответ тоже будет пустой
    const answer = [];

    const answerCur = {
      target: targetCurr,
      datapoints: [],
      tags: {
        name: targetCurr,
        metric: tags.get('name'),
        role: tags.get('role'),
        resource: tags.get('resource'),
      },
    };

    const answerNotInstalled = {
      target: targetWasNotInstalled,
      datapoints: [],
      tags: {
        name: targetWasNotInstalled,
        metric: tags.get('name'),
        role: tags.get('role'),
        resource: tags.get('resource'),
      },
    };
    //если установлен порог, то создать ответ для отправки в grafana
    if (historyValues.length > 0) {
      if (countValues == 0) {
        if (nearestIndexToFrom >= 0) {
          answerCur.datapoints.push([
            historyValues[nearestIndexToFrom].value,
            from,
          ]);
          answerCur.datapoints.push([
            historyValues[nearestIndexToFrom].value,
            until,
          ]);
        } else {
          answerNotInstalled.datapoints.push([historyValues[0].value, from]);
          answerNotInstalled.datapoints.push([historyValues[0].value, until]);
        }
      }

      if (countValues == 1) {
        if (startIndex == 0) {
          answerNotInstalled.datapoints.push([
            historyValues[startIndex].value,
            from,
          ]);
          answerNotInstalled.datapoints.push([
            historyValues[startIndex].value,
            historyValues[startIndex].createdAt,
          ]);
        } else {
          answerCur.datapoints.push([
            historyValues[startIndex - 1].value - 0.01,
            from,
          ]);
          answerCur.datapoints.push([
            historyValues[startIndex - 1].value,
            historyValues[startIndex].createdAt - 0.01,
          ]);
        }
        answerCur.datapoints.push([
          historyValues[startIndex].value,
          historyValues[startIndex].createdAt,
        ]);
        answerCur.datapoints.push([historyValues[startIndex].value, until]);
      }

      if (countValues > 1) {
        if (startIndex == 0) {
          answerNotInstalled.datapoints.push([
            historyValues[startIndex].value,
            from,
          ]);
          answerNotInstalled.datapoints.push([
            historyValues[startIndex].value,
            historyValues[startIndex].createdAt,
          ]);
        } else if (startIndex > 0) {
          //значит в историии ещё есть точки до текущей -- слева
          answerCur.datapoints.push([
            historyValues[startIndex - 1].value,
            from - 0.01,
          ]);
          answerCur.datapoints.push([
            historyValues[startIndex - 1].value,
            historyValues[startIndex].createdAt - 0.01,
          ]);
        }
        for (let i = startIndex; i <= endIndex; i++) {
          answerCur.datapoints.push([
            historyValues[i].value,
            historyValues[i].createdAt,
          ]);
          if (i < endIndex) {
            answerCur.datapoints.push([
              historyValues[i].value,
              historyValues[i + 1].createdAt - 0.01,
            ]);
          }
        }
        answerCur.datapoints.push([historyValues[endIndex].value, until]);
      }
    }

    if (answerCur.datapoints.length > 0) {
      answer.push(answerCur);
    }

    // если понадобится в прошлом отображать первую точку порога из будущего
    // if (answerNotInstalled.datapoints.length > 0) {
    //   answer.push(answerNotInstalled);
    // }

    return answer;
  }

  //есть проверка на стороне бд, что если порога для ресурса нет, то вернётся порог для его роли
  async graphite(graphiteRequest: any) {
    //graphiteRequest.target - может быть сторкой, если одни запрос и объектом, если несклько запросов
    let result = [];

    if (typeof graphiteRequest.target === 'string') {
      result = await this.prepareGraphiteAnswer(
        graphiteRequest.target,
        Number(graphiteRequest.from),
        Number(graphiteRequest.until),
      );
      return result;
    }

    if (typeof graphiteRequest.target === 'object') {
      for (let i = 0; i < graphiteRequest.target.length; i++) {
        result.push({});
        result[i] = await this.prepareGraphiteAnswer(
          graphiteRequest.target[i],
          Number(graphiteRequest.from),
          Number(graphiteRequest.until),
        );
      }
      return result.flat(1);
    }
  }
}
