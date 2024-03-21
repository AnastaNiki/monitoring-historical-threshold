import gql from 'graphql-tag';

export const READ_THRESHOLDS_DATA = gql`
query Query {
  readThresholds {
    id
    objectKind
    roleId
    resourceId
    metricId
    level
    values {
      createdAt
      value
    }
    metric {
      id
      name
    }
    role {
      id
      name
    }
    resource {
      id
      name
      roleId
    }
  }
  readMetrics {
    id
    name
  }
  readRoles {
    id
    name
  }
  readResources {
    id
    name
    roleId
    role {
      id
      name
    }
  }
}
`;

export const CREATE_THRESHOLD = gql`
  mutation CreateThreshold($createThresholdInput: CreateThresholdInput!) {
  createThreshold(createThresholdInput: $createThresholdInput) {
    id
    objectKind
    roleId
    resourceId
    metricId
    level
    values {
      createdAt
      value
    }
    metric {
      id
      name
    }
    role {
      id
      name
    }
    resource {
      id
      name
      roleId
    }
  }
}
`;

export const UPDATE_THRESHOLD = gql`
mutation UpdateThreshold($updateThresholdInput: UpdateThresholdInput!) {
  updateThreshold(updateThresholdInput: $updateThresholdInput) {
    id
    objectKind
    roleId
    resourceId
    metricId
    level
    values {
      createdAt
      value
    }
    metric {
      id
      name
    }
    role {
      id
      name
    }
    resource {
      id
      name
      roleId
    }
  }
}
`

export const DELETE_THRESHOLD = gql`
mutation RemoveThreshold($removeThresholdId: String!) {
  removeThreshold(id: $removeThresholdId) {
    id
    metric {
      name
    }
    role {
      name
    }
    resource {
      name
    }
  }
}
`;
