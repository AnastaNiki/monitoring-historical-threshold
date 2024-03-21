// import { CreateThresholdInput } from './create-threshold.input';
import {
  CreateMetricInput,
  CreateResourceInput,
  CreateRoleInput,
} from './create-threshold.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty } from 'class-validator';

//data transfer object
//в schema.gql генерирует input type

@InputType()
// export class UpdateThresholdInput extends PartialType(CreateThresholdInput) {
export class UpdateThresholdInput {
  @Field({ description: 'ID редактируемого порога' })
  @IsMongoId()
  id: string;

  @Field({ description: 'Новое значение для порога' })
  @IsNotEmpty()
  value: number;
}

@InputType()
export class UpdateMetricInput extends PartialType(CreateMetricInput) {
  @Field({ description: 'ID редактируемой метрики' })
  @IsMongoId()
  id: string;

  @Field({ description: 'Новое название для метрики' })
  @IsNotEmpty()
  name: string;
}

@InputType()
export class UpdateRoleInput extends PartialType(CreateRoleInput) {
  @Field({ description: 'ID редактируемой роли' })
  @IsMongoId()
  id: string;

  @Field({ description: 'Новое название для роли' })
  @IsNotEmpty()
  name: string;
}

@InputType()
export class UpdateResourceInput extends PartialType(CreateResourceInput) {
  @Field({ description: 'ID редактируемого ресурса' })
  @IsMongoId()
  id: string;

  @Field({ description: 'Новое название для ресурса' })
  @IsNotEmpty()
  name: string;
}
