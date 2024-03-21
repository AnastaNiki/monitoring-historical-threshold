import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import {
  ThresholdsService,
  MetricService,
  RoleService,
  ResourceService,
} from './thresholds.service';
import { Threshold, Metric, Role, Resource } from './entities/threshold.entity';
import {
  CreateThresholdInput,
  CreateMetricInput,
  CreateRoleInput,
  CreateResourceInput,
} from './dto/create-threshold.input';
import {
  UpdateThresholdInput,
  UpdateMetricInput,
  UpdateRoleInput,
  UpdateResourceInput,
} from './dto/update-threshold.input';

//логическая реализация методов. Без взаимодействия с бд
//опсание методов @Resolver для файла gql
//subscriptions описываются тоже тут

@Resolver(() => Metric)
export class MetricResolver {
  constructor(private readonly metricService: MetricService) {}

  //Create Metric
  @Mutation(() => Metric)
  async createMetric(
    @Args('createMetricInput') createMetricInput: CreateMetricInput,
  ) {
    const res = this.metricService.create(createMetricInput).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  //Read
  @Query(() => [Metric], { name: 'readMetrics' })
  async readAll() {
    const res = this.metricService.readAll().catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  @Query(() => Metric, { name: 'readMetric' })
  async readOne(@Args('id', { type: () => String }) id: string) {
    const res = this.metricService.readOne(id).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  //Update
  @Mutation(() => Metric)
  async updateMetric(
    @Args('updateMetricInput') updateMetricInput: UpdateMetricInput,
  ) {
    const res = await this.metricService
      .update(updateMetricInput.id, updateMetricInput)
      .catch((e) => {
        throw new GraphQLError(e.message);
      });
    return res;
  }

  //Delete
  @Mutation(() => Metric)
  async removeMetric(@Args('id', { type: () => String }) id: string) {
    const res = await this.metricService.remove(id).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }
}

@Resolver(() => Role)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  //Create Role
  @Mutation(() => Role)
  async createRole(@Args('createRoleInput') createRoleInput: CreateRoleInput) {
    const res = this.roleService.create(createRoleInput).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  //Read
  @Query(() => [Role], { name: 'readRoles' })
  async readAll() {
    const res = this.roleService.readAll().catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  @Query(() => Role, { name: 'readRole' })
  async readOne(@Args('id', { type: () => String }) id: string) {
    const res = this.roleService.readOne(id).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  //Update
  @Mutation(() => Role)
  async updateRole(@Args('updateRoleInput') updateRoleInput: UpdateRoleInput) {
    const res = await this.roleService
      .update(updateRoleInput.id, updateRoleInput)
      .catch((e) => {
        throw new GraphQLError(e.message);
      });
    return res;
  }

  //Delete
  @Mutation(() => Role)
  async removeRole(@Args('id', { type: () => String }) id: string) {
    const res = await this.roleService.remove(id).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }
}

@Resolver(() => Resource)
export class ResourceResolver {
  constructor(private readonly resourceService: ResourceService) {}

  //Create
  @Mutation(() => Resource)
  async createResource(
    @Args('createResourceInput') createResourceInput: CreateResourceInput,
  ) {
    const res = this.resourceService.create(createResourceInput).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }
  //Read
  @Query(() => [Resource], { name: 'readResources' })
  async readAll() {
    const res = this.resourceService.readAll().catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  @Query(() => Resource, { name: 'readResource' })
  async readOne(@Args('id', { type: () => String }) id: string) {
    const res = this.resourceService.readOne(id).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  //Update
  @Mutation(() => Resource)
  async updateResource(
    @Args('updateResourceInput') updateResourceInput: UpdateResourceInput,
  ) {
    const res = await this.resourceService
      .update(updateResourceInput.id, updateResourceInput)
      .catch((e) => {
        throw new GraphQLError(e.message);
      });
    return res;
  }

  //Delete
  @Mutation(() => Resource)
  async removeResource(@Args('id', { type: () => String }) id: string) {
    const res = await this.resourceService.remove(id).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }
}

@Resolver(() => Threshold)
export class ThresholdsResolver {
  constructor(private readonly thresholdsService: ThresholdsService) {}

  //Create
  @Mutation(() => Threshold)
  async createThreshold(
    @Args('createThresholdInput') createThresholdInput: CreateThresholdInput,
  ) {
    const res = this.thresholdsService
      .create(createThresholdInput)
      .catch((e) => {
        throw new GraphQLError(e.message);
      });
    return res;
  }

  //Read
  @Query(() => [Threshold], { name: 'readThresholds' })
  async readAll() {
    const res = this.thresholdsService.readAll().catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  @Query(() => Threshold, { name: 'readThreshold' })
  async readOne(@Args('id', { type: () => String }) id: string) {
    const res = this.thresholdsService.readOne(id).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }

  //Custom read
  @Query(() => Threshold, { name: 'readThresholdHistory' })
  async readThresholdHistory(
    @Args('metricName', { type: () => String }) metricName: string,
    @Args('role', { type: () => String }) roleName: string,
    @Args('resource', { type: () => String }) resourceName: string,
    @Args('level', { type: () => String }) level: string,
  ) {
    const res = this.thresholdsService
      .readThresholdHistory(metricName, roleName, resourceName, level)
      .catch((e) => {
        throw new GraphQLError(e.message);
      });
    return res;
  }

  //Update
  @Mutation(() => Threshold)
  async updateThreshold(
    @Args('updateThresholdInput') updateThresholdInput: UpdateThresholdInput,
  ) {
    const res = await this.thresholdsService
      .update(updateThresholdInput.id, updateThresholdInput)
      .catch((e) => {
        throw new GraphQLError(e.message);
      });
    return res;
  }

  //Delete
  @Mutation(() => Threshold)
  async removeThreshold(@Args('id', { type: () => String }) id: string) {
    const res = await this.thresholdsService.remove(id).catch((e) => {
      throw new GraphQLError(e.message);
    });
    return res;
  }
}
