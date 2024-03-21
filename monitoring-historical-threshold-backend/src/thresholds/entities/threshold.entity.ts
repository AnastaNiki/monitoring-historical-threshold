import { ObjectType, ID, Field } from '@nestjs/graphql';
import { Level, ObjectKind } from '@prisma/client';

//здесь описывается модель сущности для GraphQL
//на основе него создается schema.gql при компиляции

@ObjectType({ description: 'Метрика' })
export class Metric {
  @Field(() => ID, { description: 'Уникальный идентификатор метрики' })
  id: string;

  @Field({ description: 'Название метрики' })
  name: string;
}

@ObjectType({ description: 'Роль' })
export class Role {
  @Field(() => ID, { description: 'Уникальный идентификатор роли' })
  id: string;

  @Field({ description: 'Название роли' })
  name: string;
}

@ObjectType({ description: 'Ресурс' })
export class Resource {
  @Field(() => ID, { description: 'Уникальный идентификатор ресурса' })
  id: string;

  @Field({ description: 'Название ресурса' })
  name: string;

  @Field({ description: 'ID роли' })
  roleId: string;

  @Field(() => Role)
  role: Role;
}

@ObjectType({ description: 'Значение порога и время его добавления' })
export class ThresholdValue {
  @Field(() => ID, { description: 'Уникальный идентификатор значения порога' })
  id: string;

  @Field(() => Date, {
    description: 'Время добавления нового значения для порога',
  })
  createdAt: Date;

  @Field({ description: 'Значение порога' })
  value: number;
}

@ObjectType({ description: 'Запись порога' })
export class Threshold {
  @Field(() => ID, { description: 'Уникальный идентификатор порога' })
  id: string;

  @Field({
    nullable: false,
    description: 'Тип объекта, для которого настроен порог',
  })
  objectKind: ObjectKind;

  //@Field({ description: 'ID  объекта, для которого настроен порог' })
  //objectId: string;

  @Field({
    nullable: false,
    description: 'ID роли, для которой настроен порог',
  })
  roleId: string;

  @Field({
    nullable: true,
    description: 'ID ресурса, для которого настроен порог',
  })
  resourceId: string;

  @Field({ nullable: false, description: 'ID метрики' })
  metricId: string;

  @Field({ description: 'Уровень критичности. Возможны: WARN, CRIT' })
  level: Level;

  @Field(() => [ThresholdValue], {
    nullable: 'items',
    description: 'Исторические значения порога',
  })
  values: [ThresholdValue];

  @Field(() => Metric)
  metric: Metric;

  @Field(() => Role)
  role: Role;

  @Field(() => Resource, { nullable: true })
  resource?: Resource;
}
