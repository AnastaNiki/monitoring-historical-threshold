import gql from 'graphql-tag';

export const CREATE_METRIC =  gql`
  mutation CreateMetric($createMetricInput: CreateMetricInput!) {
  createMetric(createMetricInput: $createMetricInput) {
    id
    name
  }
}
`;

//data $createMetricInput
// {
//   "createMetricInput": {
//     "name": "SomeString"
//   }
// }

export const DELETE_METRIC = gql`
  mutation Mutation($removeMetricId: String!) {
    removeMetric(id: $removeMetricId) {
      id
      name
    }
  }
`;
// data $removeMetricId
// {
//   "removeMetricId": null
// }

export const UPDATE_METRIC = gql`
  mutation UpdateMetric($updateMetricInput: UpdateMetricInput!) {
    updateMetric(updateMetricInput: $updateMetricInput) {
      id
      name
    }
}
`;
//data updateMetricInput
// {
//   "updateMetricInput": {
//     "id": null
//   }
// }

export const READ_METRIC = gql`
  query ReadMetric($readMetricId: String!) {
    readMetric(id: $readMetricId) {
      id
      name
    }
  }
`;
//data readMetric
//{
//  "readMetricId": null
//}


export const READ_METRICS = gql`
  query ReadMetrics {
    readMetrics {
      id
      name
    }
  }
`;


