import { InputType, Field } from '@nestjs/graphql';
import { Level, ObjectKind } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator'; //MaxLength
import { IsEnum } from 'class-validator';

//data transfer object
//в schema.gql генерирует input type

@InputType({ description: 'Добавление метрики' })
export class CreateMetricInput {
  @Field({ description: 'Название метрики' })
  name: string;
}

@InputType({ description: 'Добавление роли' })
export class CreateRoleInput {
  @Field({ description: 'Название роли' })
  name: string;
}

@InputType({ description: 'Добавление ресурса' })
export class CreateResourceInput {
  @Field({ description: 'Название ресурса' })
  name: string;

  @Field({ description: 'ID роли' })
  roleId: string;
}

@InputType({ description: 'Добавление значения порога' })
export class CreateThresholdValue {
  //время будет добавлено автоматически

  @Field({ description: 'Значение порога' })
  value: number;
}

@InputType()
export class CreateThresholdInput {
  @Field({ description: 'ID метрики' })
  @IsString()
  @IsNotEmpty()
  metricId: string;

  @IsEnum(ObjectKind, {
    message:
      `Недопустимое значение для 'objectType` +
      `Допустимыми значениями являются: ${Object.values(ObjectKind)}`,
  })
  @Field({ description: 'Тип объекта, для которого создаётся порог' })
  @IsNotEmpty()
  objectKind: ObjectKind;

  //@Field({ description: 'ID объекта' })
  //@IsString()
  //@IsNotEmpty()
  //objectId: string;

  @Field({ description: 'ID роли' })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @Field({ nullable: true, description: 'ID ресурса' })
  @IsString()
  resourceId: string;

  @IsEnum(Level, {
    message:
      `Недопустимое значение для 'level` +
      `Допустимыми значениями являются: ${Object.values(Level)}`,
  })
  @Field({ description: 'Уровень для порога. Возможны: WARN, CRIT' })
  @IsNotEmpty()
  level: Level;

  // @Field(() => [CreateThresholdValue], {
  //   nullable: 'items',
  //   description: 'Значения для порога',
  // })
  // @IsNotEmpty()
  // values: CreateThresholdValue[];

  @Field({ description: 'Значение порога' })
  value: number;
}
